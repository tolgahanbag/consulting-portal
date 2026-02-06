import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createAuditLog } from "@/lib/audit";

// Default settings
const DEFAULTS: Record<string, unknown> = {
  emailTemplates: {
    newApplication: {
      subject: "Yeni Başvuru Alındı - {companyName}",
      body: "Sayın {fullName},\n\nBaşvurunuz başarıyla alınmıştır. En kısa sürede size dönüş yapılacaktır.\n\nSaygılarımızla,\nEstonTurk Danışmanlık",
    },
    quoteSent: {
      subject: "Fiyat Teklifi - {companyName}",
      body: "Sayın {fullName},\n\n{amount} {currency} tutarında fiyat teklifiniz hazırlanmıştır. Panelinizden inceleyebilirsiniz.\n\nSaygılarımızla,\nEstonTurk Danışmanlık",
    },
    companyCompleted: {
      subject: "Şirketiniz Kuruldu - {companyName}",
      body: "Sayın {fullName},\n\nŞirketiniz başarıyla kurulmuştur. Resmi evraklarınız panelinizde mevcuttur.\n\nSaygılarımızla,\nEstonTurk Danışmanlık",
    },
  },
  workflowTemplates: [
    { title: "Evrak Toplama", description: "Gerekli evrakların toplanması" },
    { title: "Noter İşlemleri", description: "Noter onayları ve imzalar" },
    { title: "Ticaret Sicil", description: "Ticaret sicil kaydı" },
    { title: "Vergi Dairesi", description: "Vergi dairesi kaydı" },
  ],
  documentCategories: ["APPLICATION_DOC", "COMPANY_DOC", "OTHER"],
  companyDocumentCategories: ["REGISTRATION", "TAX", "LICENSE", "OTHER"],
};

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const user = session.user as { id: string; role: string };
    if (user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const settings = await prisma.systemSetting.findMany();
    const result: Record<string, unknown> = { ...DEFAULTS };

    settings.forEach((s) => {
      try {
        result[s.key] = JSON.parse(s.value);
      } catch {
        result[s.key] = s.value;
      }
    });

    return NextResponse.json({ settings: result });
  } catch (error) {
    console.error("Settings fetch error:", error);
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

    const body = await req.json();
    const { key, value } = body;

    if (!key || value === undefined) {
      return NextResponse.json({ error: "Missing key or value" }, { status: 400 });
    }

    const serialized = typeof value === "string" ? value : JSON.stringify(value);

    const setting = await prisma.systemSetting.upsert({
      where: { key },
      update: { value: serialized },
      create: { key, value: serialized },
    });

    await createAuditLog({
      userId: user.id,
      action: "UPDATE",
      entity: "SETTING",
      entityId: setting.id,
      details: { settingKey: key },
    });

    return NextResponse.json({ setting });
  } catch (error) {
    console.error("Settings update error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
