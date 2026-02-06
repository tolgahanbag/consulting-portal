import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createNotification, notifyAdmins } from "@/lib/notifications";
import { canPostWorkflowRequest } from "@/lib/authorization";
import { getRequestIp, rateLimit } from "@/lib/rate-limit";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const ip = getRequestIp(req.headers);
    const limit = rateLimit(`workflow-request:${ip}`, { limit: 30, windowMs: 10 * 60 * 1000 });
    if (!limit.ok) {
      return NextResponse.json(
        { error: "Too many requests. Try again later." },
        { status: 429 }
      );
    }

    const { id } = await params;
    const user = session.user as { id: string; role: string };
    const { type, message } = await req.json();

    const validTypes = ["REQUEST", "QUESTION", "DOCUMENT_UPLOAD"];
    if (!validTypes.includes(type)) {
      return NextResponse.json({ error: "Invalid request type" }, { status: 400 });
    }
    if (!message || message.trim().length < 2 || message.length > 2000) {
      return NextResponse.json({ error: "Invalid message" }, { status: 400 });
    }

    const workflow = await prisma.workflow.findUnique({
      where: { id },
      include: { application: true },
    });
    if (!workflow) {
      return NextResponse.json({ error: "Workflow not found" }, { status: 404 });
    }

    if (!canPostWorkflowRequest(user, workflow)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const request = await prisma.workflowRequest.create({
      data: {
        workflowId: id,
        userId: user.id,
        type,
        message,
      },
      include: { user: { select: { name: true, role: true } } },
    });

    // Notify the other party
    if (user.role === "CLIENT") {
      await notifyAdmins({
        title: "Yeni Müşteri Mesajı",
        message: `${workflow.title}: ${message.substring(0, 100)}`,
        type: "WORKFLOW",
        link: `/admin/applications/${workflow.applicationId}`,
      });
    } else if (workflow.application.userId) {
      await createNotification({
        userId: workflow.application.userId,
        title: "Yeni Mesaj",
        message: `${workflow.title}: ${message.substring(0, 100)}`,
        type: "WORKFLOW",
        link: `/dashboard/applications/${workflow.applicationId}`,
      });
    }

    return NextResponse.json({ request }, { status: 201 });
  } catch (error) {
    console.error("Workflow request error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
