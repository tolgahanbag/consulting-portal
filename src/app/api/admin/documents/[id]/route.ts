import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { deleteFile, isLocalPath } from "@/lib/storage";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = session.user as { id: string; role: string };
    if (user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;

    const document = await prisma.document.findUnique({ where: { id } });
    if (!document) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Delete the file (don't fail if file doesn't exist)
    try {
      if (isLocalPath(document.filePath)) {
        // Legacy local file
        const { unlink } = await import("fs/promises");
        const path = await import("path");
        const filePath = path.join(process.cwd(), document.filePath);
        await unlink(filePath);
      } else {
        // Delete from R2
        await deleteFile(document.filePath);
      }
    } catch {
      // File may already be deleted, continue
    }

    // Delete DB record
    await prisma.document.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin document delete error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
