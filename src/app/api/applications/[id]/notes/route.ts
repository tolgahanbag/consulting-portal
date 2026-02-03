import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
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
    const { content } = await req.json();

    const note = await prisma.applicationNote.create({
      data: { applicationId: id, content },
    });

    return NextResponse.json({ note }, { status: 201 });
  } catch (error) {
    console.error("Note creation error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
