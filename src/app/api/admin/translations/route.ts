import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

const MESSAGES_DIR = join(process.cwd(), "messages");
const LOCALES = ["tr", "en", "et"];

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
    const locale = url.searchParams.get("locale") || "tr";

    if (!LOCALES.includes(locale)) {
      return NextResponse.json({ error: "Invalid locale" }, { status: 400 });
    }

    const filePath = join(MESSAGES_DIR, `${locale}.json`);
    const content = readFileSync(filePath, "utf-8");
    const translations = JSON.parse(content);

    return NextResponse.json({ locale, translations, locales: LOCALES });
  } catch (error) {
    console.error("Translations fetch error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const user = session.user as { id: string; role: string };
    if (user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { locale, key, value } = await req.json();

    if (!locale || !key || value === undefined) {
      return NextResponse.json({ error: "Missing locale, key, or value" }, { status: 400 });
    }

    if (!LOCALES.includes(locale)) {
      return NextResponse.json({ error: "Invalid locale" }, { status: 400 });
    }

    const filePath = join(MESSAGES_DIR, `${locale}.json`);
    const content = readFileSync(filePath, "utf-8");
    const translations = JSON.parse(content);

    // Set nested key (e.g., "admin.sidebar.dashboard")
    const keys = key.split(".");
    let obj = translations;
    for (let i = 0; i < keys.length - 1; i++) {
      if (!obj[keys[i]]) obj[keys[i]] = {};
      obj = obj[keys[i]];
    }
    obj[keys[keys.length - 1]] = value;

    writeFileSync(filePath, JSON.stringify(translations, null, 2) + "\n", "utf-8");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Translation update error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
