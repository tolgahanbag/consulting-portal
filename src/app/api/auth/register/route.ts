import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { getRequestIp, rateLimit } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  try {
    const ip = getRequestIp(req.headers);
    const limit = rateLimit(`register:${ip}`, { limit: 5, windowMs: 10 * 60 * 1000 });
    if (!limit.ok) {
      return NextResponse.json(
        { error: "Too many requests. Try again later." },
        { status: 429 }
      );
    }

    const { email, password, name, phone } = await req.json();

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email already exists" },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        phone: phone || null,
        role: "CLIENT",
      },
    });

    return NextResponse.json(
      { message: "User created", userId: user.id },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
