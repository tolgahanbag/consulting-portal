import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const currentUser = session.user as { id: string; role: string };
    if (currentUser.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Application stats by status
    const applications = await prisma.application.findMany({
      select: {
        id: true,
        status: true,
        createdAt: true,
        companyType: true,
      },
    });

    const statusCounts: Record<string, number> = {};
    const typeCounts: Record<string, number> = {};
    const monthlyApplications: Record<string, number> = {};

    applications.forEach((app) => {
      statusCounts[app.status] = (statusCounts[app.status] || 0) + 1;
      typeCounts[app.companyType] = (typeCounts[app.companyType] || 0) + 1;

      const month = new Date(app.createdAt).toISOString().slice(0, 7); // YYYY-MM
      monthlyApplications[month] = (monthlyApplications[month] || 0) + 1;
    });

    // Quote stats
    const quotes = await prisma.quote.findMany({
      select: {
        status: true,
        amount: true,
        currency: true,
        createdAt: true,
      },
    });

    const quoteStatusCounts: Record<string, number> = {};
    let totalQuoteAmount = 0;
    let acceptedQuoteAmount = 0;
    quotes.forEach((q) => {
      quoteStatusCounts[q.status] = (quoteStatusCounts[q.status] || 0) + 1;
      totalQuoteAmount += q.amount;
      if (q.status === "ACCEPTED") {
        acceptedQuoteAmount += q.amount;
      }
    });

    // Workflow stats
    const workflows = await prisma.workflow.findMany({
      select: {
        status: true,
        applicationId: true,
      },
    });

    const workflowStatusCounts: Record<string, number> = {};
    const workflowsByApp: Record<string, { total: number; completed: number }> = {};
    workflows.forEach((w) => {
      workflowStatusCounts[w.status] = (workflowStatusCounts[w.status] || 0) + 1;
      if (!workflowsByApp[w.applicationId]) {
        workflowsByApp[w.applicationId] = { total: 0, completed: 0 };
      }
      workflowsByApp[w.applicationId].total++;
      if (w.status === "COMPLETED") {
        workflowsByApp[w.applicationId].completed++;
      }
    });

    // Find bottleneck apps (have workflows but none completed)
    const bottleneckApps = Object.entries(workflowsByApp).filter(
      ([, v]) => v.total > 0 && v.completed === 0
    ).length;

    // Document stats
    const documentCount = await prisma.document.count();
    const companyDocCount = await prisma.companyDocument.count();

    // User stats
    const userCount = await prisma.user.count();
    const adminCount = await prisma.user.count({ where: { role: "ADMIN" } });

    // Recent activity (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentApps = await prisma.application.count({
      where: { createdAt: { gte: thirtyDaysAgo } },
    });
    const recentQuotes = await prisma.quote.count({
      where: { createdAt: { gte: thirtyDaysAgo } },
    });

    // Average time from NEW to COMPLETED (for completed apps)
    const completedApps = await prisma.application.findMany({
      where: { status: "COMPLETED" },
      select: { createdAt: true, updatedAt: true },
    });

    let avgCompletionDays = 0;
    if (completedApps.length > 0) {
      const totalDays = completedApps.reduce((acc, app) => {
        const diff = new Date(app.updatedAt).getTime() - new Date(app.createdAt).getTime();
        return acc + diff / (1000 * 60 * 60 * 24);
      }, 0);
      avgCompletionDays = Math.round(totalDays / completedApps.length);
    }

    // Conversion rate (accepted quotes / total quotes)
    const conversionRate =
      quotes.length > 0
        ? Math.round(((quoteStatusCounts["ACCEPTED"] || 0) / quotes.length) * 100)
        : 0;

    return NextResponse.json({
      overview: {
        totalApplications: applications.length,
        totalQuotes: quotes.length,
        totalDocuments: documentCount + companyDocCount,
        totalUsers: userCount,
        adminUsers: adminCount,
        recentApplications: recentApps,
        recentQuotes: recentQuotes,
        avgCompletionDays,
        conversionRate,
        totalQuoteAmount: Math.round(totalQuoteAmount),
        acceptedQuoteAmount: Math.round(acceptedQuoteAmount),
        bottleneckApps,
      },
      statusCounts,
      typeCounts,
      quoteStatusCounts,
      workflowStatusCounts,
      monthlyApplications,
    });
  } catch (error) {
    console.error("Reports fetch error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
