import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { downloadFile, isLocalPath } from "@/lib/storage";
import { canAccessDocument } from "@/lib/authorization";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const document = await prisma.document.findUnique({
      where: { id },
      include: {
        application: { select: { userId: true } },
        workflowRequest: {
          include: {
            workflow: {
              select: {
                applicationId: true,
                application: { select: { userId: true } },
              },
            },
          },
        },
      },
    });
    if (!document) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const user = session.user as { id: string; role: string };
    if (!canAccessDocument(user, document)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    let fileBuffer: Buffer;

    if (isLocalPath(document.filePath)) {
      // Legacy local file fallback
      const { readFile } = await import("fs/promises");
      const path = await import("path");
      const filePath = path.join(
        process.cwd(),
        document.filePath.replace(/^\/+/, "")
      );
      fileBuffer = await readFile(filePath);
    } else {
      // Download from R2
      fileBuffer = await downloadFile(document.filePath);
    }

    return new NextResponse(new Uint8Array(fileBuffer), {
      headers: {
        "Content-Type": document.fileType,
        "Content-Disposition": `attachment; filename="${document.fileName}"`,
      },
    });
  } catch (error) {
    console.error("Document download error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
