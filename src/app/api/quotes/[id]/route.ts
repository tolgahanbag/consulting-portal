import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createAuditLog } from "@/lib/audit";

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
    const body = await req.json();

    const data: Record<string, unknown> = {};
    if (body.amount !== undefined) {
      const parsedAmount = Number(body.amount);
      if (!Number.isFinite(parsedAmount)) {
        return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
      }
      data.amount = parsedAmount;
    }
    if (body.currency !== undefined) data.currency = body.currency;
    if (body.description !== undefined) data.description = body.description;
    if (body.validUntil !== undefined) {
      const parsedValidUntil = new Date(body.validUntil);
      if (Number.isNaN(parsedValidUntil.getTime())) {
        return NextResponse.json({ error: "Invalid validUntil date" }, { status: 400 });
      }
      data.validUntil = parsedValidUntil;
    }
    if (body.status !== undefined) data.status = body.status;

    const quote = await prisma.quote.update({
      where: { id },
      data,
    });

    await createAuditLog({
      userId: user.id,
      action: "UPDATE",
      entity: "QUOTE",
      entityId: id,
      details: data,
    });

    return NextResponse.json({ quote });
  } catch (error) {
    console.error("Quote update error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
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

    await prisma.quote.delete({ where: { id } });

    await createAuditLog({
      userId: user.id,
      action: "DELETE",
      entity: "QUOTE",
      entityId: id,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Quote delete error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
