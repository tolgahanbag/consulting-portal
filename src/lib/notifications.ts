import { prisma } from "./prisma";
import { sendEmail } from "./email";

export async function createNotification({
  userId,
  title,
  message,
  type,
  link,
}: {
  userId: string;
  title: string;
  message: string;
  type: string;
  link?: string;
}) {
  const notification = await prisma.notification.create({
    data: { userId, title, message, type, link },
  });

  // Send email notification
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (user) {
    sendEmail({
      to: user.email,
      subject: title,
      html: `<h2>${title}</h2><p>${message}</p>${
        link ? `<p><a href="${process.env.NEXTAUTH_URL}${link}">Detaylar</a></p>` : ""
      }`,
    }).catch(console.error);
  }

  return notification;
}

export async function notifyAdmins({
  title,
  message,
  type,
  link,
}: {
  title: string;
  message: string;
  type: string;
  link?: string;
}) {
  const admins = await prisma.user.findMany({ where: { role: "ADMIN" } });
  for (const admin of admins) {
    await createNotification({
      userId: admin.id,
      title,
      message,
      type,
      link,
    });
  }
}
