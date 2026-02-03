export async function sendWhatsApp({
  to,
  message,
}: {
  to: string;
  message: string;
}) {
  try {
    const url = `${process.env.WHATSAPP_API_URL}/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: to.replace(/[^0-9]/g, ""),
        type: "text",
        text: { body: message },
      }),
    });

    return response.ok;
  } catch (error) {
    console.error("WhatsApp send error:", error);
    return false;
  }
}
