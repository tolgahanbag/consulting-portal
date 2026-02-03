import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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
    const search = url.searchParams.get("search") || "";
    const category = url.searchParams.get("category") || "";
    const applicationId = url.searchParams.get("applicationId") || "";
    const fileType = url.searchParams.get("fileType") || "";
    const dateFrom = url.searchParams.get("dateFrom") || "";
    const dateTo = url.searchParams.get("dateTo") || "";

    const where: Record<string, unknown> = {};

    if (search) {
      where.fileName = { contains: search, mode: "insensitive" };
    }
    if (category) {
      where.category = category;
    }
    if (applicationId) {
      where.applicationId = applicationId;
    }
    if (fileType) {
      where.fileType = fileType;
    }
    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) {
        (where.createdAt as Record<string, unknown>).gte = new Date(dateFrom);
      }
      if (dateTo) {
        const endDate = new Date(dateTo);
        endDate.setHours(23, 59, 59, 999);
        (where.createdAt as Record<string, unknown>).lte = endDate;
      }
    }

    const documents = await prisma.document.findMany({
      where,
      include: {
        user: { select: { name: true, email: true } },
        application: { select: { id: true, companyName: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    // Stats
    const allDocuments = await prisma.document.groupBy({
      by: ["category"],
      _count: { id: true },
    });

    const total = allDocuments.reduce((sum, g) => sum + g._count.id, 0);
    const applicationDocCount =
      allDocuments.find((g) => g.category === "APPLICATION_DOC")?._count.id || 0;
    const companyDocCount =
      allDocuments.find((g) => g.category === "COMPANY_DOC")?._count.id || 0;
    const otherCount =
      allDocuments.find((g) => g.category === "OTHER")?._count.id || 0;

    // Get unique applications for filter dropdown
    const applications = await prisma.application.findMany({
      select: { id: true, companyName: true },
      orderBy: { companyName: "asc" },
    });

    return NextResponse.json({
      documents,
      stats: {
        total,
        applicationDoc: applicationDocCount,
        companyDoc: companyDocCount,
        other: otherCount,
      },
      applications,
    });
  } catch (error) {
    console.error("Admin documents fetch error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
