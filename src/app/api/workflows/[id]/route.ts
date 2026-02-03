import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createNotification } from "@/lib/notifications";

export async function PATCH(
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
    const { status } = await req.json();

    const workflow = await prisma.workflow.update({
      where: { id },
      data: { status },
      include: { application: true },
    });

    if (workflow.application.userId) {
      await createNotification({
        userId: workflow.application.userId,
        title: "İş Akışı Güncellendi",
        message: `"${workflow.title}" adımı güncellendi: ${status}`,
        type: "WORKFLOW",
        link: `/dashboard/applications/${workflow.applicationId}`,
      });
    }

    // Check if all workflows are completed
    if (status === "COMPLETED") {
      const allWorkflows = await prisma.workflow.findMany({
        where: { applicationId: workflow.applicationId },
      });
      const allDone = allWorkflows.every((w) => w.status === "COMPLETED");
      if (allDone) {
        await prisma.application.update({
          where: { id: workflow.applicationId },
          data: { status: "COMPLETED" },
        });
      }
    }

    return NextResponse.json({ workflow });
  } catch (error) {
    console.error("Workflow update error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
