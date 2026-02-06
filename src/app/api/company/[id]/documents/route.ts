import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { v4 as uuidv4 } from "uuid";
import { createNotification } from "@/lib/notifications";
import { uploadFile, generateObjectKey } from "@/lib/storage";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user as { id: string; role: string } | undefined;
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
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

    const allowedCategories = ["REGISTRATION", "TAX", "LICENSE", "OTHER"];
    if (!allowedCategories.includes(category)) {
      return NextResponse.json({ error: "Invalid category" }, { status: 400 });
    }

    const uuid = uuidv4();
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    let filePath: string;

    try {
      const objectKey = generateObjectKey("company", file.name, uuid);
      await uploadFile(objectKey, buffer, file.type);
      filePath = objectKey;
    } catch {
      // Fallback to local storage if R2 is not configured
      const { writeFile, mkdir } = await import("fs/promises");
      const path = await import("path");
      const ext = file.name.split(".").pop();
      const fileName = `${uuid}.${ext}`;
      const uploadDir = path.join(process.cwd(), "uploads", "company");
      await mkdir(uploadDir, { recursive: true });
      await writeFile(path.join(uploadDir, fileName), buffer);
      filePath = `/uploads/company/${fileName}`;
    }

    const document = await prisma.companyDocument.create({
      data: {
        companyRecordId: id,
        fileName: file.name,
        filePath,
        fileType: file.type,
        category,
      },
    });

    // Notify company owner
    const company = await prisma.companyRecord.findUnique({ where: { id } });
    if (company) {
      await createNotification({
        userId: company.userId,
        title: "Yeni Şirket Evrakı",
        message: `${file.name} yüklendi.`,
        type: "DOCUMENT",
        link: `/dashboard/company/${id}`,
      });
    }

    return NextResponse.json({ document }, { status: 201 });
  } catch (error) {
    console.error("Company document upload error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
