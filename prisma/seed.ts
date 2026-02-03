import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminPassword = await bcrypt.hash("admin123", 12);

  const admin = await prisma.user.upsert({
    where: { email: "admin@estonturk.com" },
    update: {},
    create: {
      email: "admin@estonturk.com",
      password: adminPassword,
      name: "Admin",
      role: "ADMIN",
      phone: "+372 5555 5555",
    },
  });

  console.log("Admin user created:", admin.email);
  console.log("Password: admin123");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
