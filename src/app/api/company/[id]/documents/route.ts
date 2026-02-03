import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { createNotification } from "@/lib/notifications";

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

    const ext = file.name.split(".").pop();
    const fileName = `${uuidv4()}.${ext}`;
    const uploadDir = path.join(process.cwd(), "uploads", "company");
    await mkdir(uploadDir, { recursive: true });
    const filePath = path.join(uploadDir, fileName);

    const bytes = await file.arrayBuffer();
    await writeFile(filePath, Buffer.from(bytes));

    const document = await prisma.companyDocument.create({
      data: {
        companyRecordId: id,
        fileName: file.name,
        filePath: `/uploads/company/${fileName}`,
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
