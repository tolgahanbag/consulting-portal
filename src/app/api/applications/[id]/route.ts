import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createAuditLog } from "@/lib/audit";

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
    const user = session.user as { id: string; role: string };

    const application = await prisma.application.findUnique({
      where: { id },
      include: {
        quotes: { orderBy: { createdAt: "desc" } },
        workflows: {
          orderBy: { order: "asc" },
          include: {
            requests: {
              orderBy: { createdAt: "asc" },
              include: { user: { select: { name: true, role: true } }, documents: true },
            },
          },
        },
        documents: { orderBy: { createdAt: "desc" } },
        notes: { orderBy: { createdAt: "desc" } },
        companyRecord: { include: { documents: true } },
      },
    });

    if (!application) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    if (user.role !== "ADMIN" && application.userId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({ application });
  } catch (error) {
    console.error("Application detail error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const user = session.user as { id: string; role: string };
    if (user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const data: Record<string, string> = {};
    if (body.status) data.status = body.status;
    if (body.companyName !== undefined) data.companyName = body.companyName;
    if (body.description !== undefined) data.description = body.description;

    const application = await prisma.application.update({
      where: { id },
      data,
    });

    await createAuditLog({
      userId: user.id,
      action: "UPDATE",
      entity: "APPLICATION",
      entityId: id,
      details: data,
    });

    return NextResponse.json({ application });
  } catch (error) {
    console.error("Application update error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const user = session.user as { id: string; role: string };
    if (user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Delete related records in order
    await prisma.applicationNote.deleteMany({ where: { applicationId: id } });

    // Delete workflow requests and their documents
    const workflows = await prisma.workflow.findMany({
      where: { applicationId: id },
      select: { id: true },
    });
    const workflowIds = workflows.map((w) => w.id);
    if (workflowIds.length > 0) {
      await prisma.document.deleteMany({ where: { workflowRequestId: { in: (await prisma.workflowRequest.findMany({ where: { workflowId: { in: workflowIds } }, select: { id: true } })).map(r => r.id) } } });
      await prisma.workflowRequest.deleteMany({ where: { workflowId: { in: workflowIds } } });
    }
    await prisma.workflow.deleteMany({ where: { applicationId: id } });
    await prisma.quote.deleteMany({ where: { applicationId: id } });
    await prisma.document.deleteMany({ where: { applicationId: id } });

    // Delete company record and its documents
    const companyRecord = await prisma.companyRecord.findUnique({ where: { applicationId: id } });
    if (companyRecord) {
      await prisma.companyDocument.deleteMany({ where: { companyRecordId: companyRecord.id } });
      await prisma.companyRecord.delete({ where: { applicationId: id } });
    }

    await prisma.application.delete({ where: { id } });

    await createAuditLog({
      userId: user.id,
      action: "DELETE",
      entity: "APPLICATION",
      entityId: id,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Application delete error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
