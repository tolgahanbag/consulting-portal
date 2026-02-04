import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createNotification } from "@/lib/notifications";
import { createAuditLog } from "@/lib/audit";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user as { id: string; role: string } | undefined;
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { applicationId, amount, currency, description, validUntil } = await req.json();

    const application = await prisma.application.findUnique({
      where: { id: applicationId },
    });
    if (!application) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    const quote = await prisma.quote.create({
      data: {
        applicationId,
        amount: parseFloat(amount),
        currency: currency || "EUR",
        description,
        validUntil: new Date(validUntil),
      },
    });

    await prisma.application.update({
      where: { id: applicationId },
      data: { status: "QUOTED" },
    });

    await createAuditLog({
      userId: user.id,
      action: "CREATE",
      entity: "QUOTE",
      entityId: quote.id,
      details: { applicationId, amount, currency },
    });

    // Notify client if they have a user account
    if (application.userId) {
      await createNotification({
        userId: application.userId,
        title: "Fiyat Teklifi",
        message: `${amount} ${currency} tutarında teklif gönderildi.`,
        type: "QUOTE",
        link: `/dashboard/applications/${applicationId}`,
      });
    }

    return NextResponse.json({ quote }, { status: 201 });
  } catch (error) {
    console.error("Quote creation error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
