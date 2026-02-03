import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notifyAdmins } from "@/lib/notifications";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { action } = await req.json(); // "accept" or "reject"

    const quote = await prisma.quote.findUnique({
      where: { id },
      include: { application: true },
    });

    if (!quote) {
      return NextResponse.json({ error: "Quote not found" }, { status: 404 });
    }

    const user = session.user as { id: string };
    if (quote.application.userId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const newStatus = action === "accept" ? "ACCEPTED" : "REJECTED";

    await prisma.quote.update({
      where: { id },
      data: { status: newStatus },
    });

    if (action === "accept") {
      await prisma.application.update({
        where: { id: quote.applicationId },
        data: { status: "ACCEPTED" },
      });
    }

    await notifyAdmins({
      title: action === "accept" ? "Teklif Kabul Edildi" : "Teklif Reddedildi",
      message: `${quote.application.companyName} - ${quote.amount} ${quote.currency}`,
      type: "QUOTE",
      link: `/admin/applications/${quote.applicationId}`,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Quote respond error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
