import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createNotification } from "@/lib/notifications";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user as { id: string; role: string } | undefined;
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { applicationId, title, description, order } = await req.json();

    const application = await prisma.application.findUnique({
      where: { id: applicationId },
    });
    if (!application) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    const workflow = await prisma.workflow.create({
      data: {
        applicationId,
        title,
        description,
        order: parseInt(order),
      },
    });

    // Update application status if needed
    if (application.status === "ACCEPTED") {
      await prisma.application.update({
        where: { id: applicationId },
        data: { status: "IN_PROGRESS" },
      });
    }

    // Notify client
    if (application.userId) {
      await createNotification({
        userId: application.userId,
        title: "İş Akışı Güncellendi",
        message: `Yeni adım eklendi: ${title}`,
        type: "WORKFLOW",
        link: `/dashboard/applications/${applicationId}`,
      });
    }

    return NextResponse.json({ workflow }, { status: 201 });
  } catch (error) {
    console.error("Workflow creation error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
