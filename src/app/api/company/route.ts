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

    const { applicationId, companyName, registrationNumber, registrationDate } =
      await req.json();

    const application = await prisma.application.findUnique({
      where: { id: applicationId },
    });
    if (!application) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    const companyRecord = await prisma.companyRecord.create({
      data: {
        applicationId,
        userId: application.userId || user.id,
        companyName,
        registrationNumber,
        registrationDate: registrationDate ? new Date(registrationDate) : null,
      },
    });

    await prisma.application.update({
      where: { id: applicationId },
      data: { status: "COMPLETED" },
    });

    if (application.userId) {
      await createNotification({
        userId: application.userId,
        title: "Şirketiniz Kuruldu!",
        message: `${companyName} başarıyla kuruldu. Resmi evraklarınız panelinizde.`,
        type: "INFO",
        link: `/dashboard/company/${companyRecord.id}`,
      });
    }

    return NextResponse.json({ companyRecord }, { status: 201 });
  } catch (error) {
    console.error("Company creation error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
