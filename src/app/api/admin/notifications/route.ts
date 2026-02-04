import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createNotification } from "@/lib/notifications";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const user = session.user as { id: string; role: string };
    if (user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get("page") || "1");
    const type = url.searchParams.get("type") || "";
    const pageSize = 30;

    const where: Record<string, unknown> = {};
    if (type) where.type = type;

    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        include: { user: { select: { name: true, email: true } } },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.notification.count({ where }),
    ]);

    const stats = {
      total: await prisma.notification.count(),
      unread: await prisma.notification.count({ where: { isRead: false } }),
    };

    return NextResponse.json({
      notifications,
      total,
      stats,
      page,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (error) {
    console.error("Admin notifications fetch error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Broadcast notification to all users or specific role
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const user = session.user as { id: string; role: string };
    if (user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { title, message, type, targetRole } = await req.json();

    if (!title || !message) {
      return NextResponse.json({ error: "Missing title or message" }, { status: 400 });
    }

    const where: Record<string, string> = {};
    if (targetRole) where.role = targetRole;

    const users = await prisma.user.findMany({
      where,
      select: { id: true },
    });

    let sent = 0;
    for (const u of users) {
      await createNotification({
        userId: u.id,
        title,
        message,
        type: type || "INFO",
      });
      sent++;
    }

    return NextResponse.json({ sent }, { status: 201 });
  } catch (error) {
    console.error("Broadcast notification error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
