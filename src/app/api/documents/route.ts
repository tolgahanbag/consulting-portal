import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { v4 as uuidv4 } from "uuid";
import { notifyAdmins, createNotification } from "@/lib/notifications";
import { uploadFile, generateObjectKey } from "@/lib/storage";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = session.user as { id: string; role: string };
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const applicationId = formData.get("applicationId") as string | null;
    const workflowRequestId = formData.get("workflowRequestId") as string | null;
    const category = (formData.get("category") as string) || "OTHER";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "File too large (max 10MB)" }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "Invalid file type" }, { status: 400 });
    }

    const id = uuidv4();
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    let filePath: string;

    try {
      const objectKey = generateObjectKey("documents", file.name, id);
      await uploadFile(objectKey, buffer, file.type);
      filePath = objectKey;
    } catch {
      // Fallback to local storage if R2 is not configured
      const { writeFile, mkdir } = await import("fs/promises");
      const path = await import("path");
      const ext = file.name.split(".").pop();
      const fileName = `${id}.${ext}`;
      const uploadDir = path.join(process.cwd(), "uploads");
      await mkdir(uploadDir, { recursive: true });
      await writeFile(path.join(uploadDir, fileName), buffer);
      filePath = `/uploads/${fileName}`;
    }

    const document = await prisma.document.create({
      data: {
        applicationId,
        workflowRequestId,
        userId: user.id,
        fileName: file.name,
        filePath,
        fileType: file.type,
        category,
      },
    });

    // Notify
    if (user.role === "CLIENT" && applicationId) {
      await notifyAdmins({
        title: "Yeni Evrak Yüklendi",
        message: `${file.name}`,
        type: "DOCUMENT",
        link: `/admin/applications/${applicationId}`,
      });
    } else if (user.role === "ADMIN" && applicationId) {
      const app = await prisma.application.findUnique({ where: { id: applicationId } });
      if (app?.userId) {
        await createNotification({
          userId: app.userId,
          title: "Yeni Evrak",
          message: `${file.name} yüklendi.`,
          type: "DOCUMENT",
          link: `/dashboard/applications/${applicationId}`,
        });
      }
    }

    return NextResponse.json({ document }, { status: 201 });
  } catch (error) {
    console.error("Document upload error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
