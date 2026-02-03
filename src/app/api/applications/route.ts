import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notifyAdmins } from "@/lib/notifications";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { fullName, email, phone, companyName, companyType, description } = body;

    if (!fullName || !email || !phone || !companyName || !companyType) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const session = await getServerSession(authOptions);
    const userId = (session?.user as { id?: string })?.id || null;

    const application = await prisma.application.create({
      data: {
        userId,
        fullName,
        email,
        phone,
        companyName,
        companyType,
        description: description || "",
        status: "NEW",
      },
    });

    // Notify admins
    await notifyAdmins({
      title: "Yeni Başvuru",
      message: `${fullName} - ${companyName} (${companyType})`,
      type: "INFO",
      link: `/admin/applications/${application.id}`,
    });

    return NextResponse.json({ application }, { status: 201 });
  } catch (error) {
    console.error("Application creation error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = session.user as { id: string; role: string };
    const url = new URL(req.url);
    const status = url.searchParams.get("status");

    const where: Record<string, unknown> = {};
    if (user.role !== "ADMIN") {
      where.userId = user.id;
    }
    if (status && status !== "all") {
      where.status = status;
    }

    const applications = await prisma.application.findMany({
      where,
      include: {
        quotes: true,
        workflows: { orderBy: { order: "asc" } },
        _count: { select: { documents: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ applications });
  } catch (error) {
    console.error("Application fetch error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
