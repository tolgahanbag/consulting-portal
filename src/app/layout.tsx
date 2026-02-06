import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";

export const metadata: Metadata = {
  title: "EstonTurk Danışmanlık",
  description: "AB ve Estonya'dan Türkiye'de şirket kurma danışmanlık portalı",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = headers().get("x-next-intl-locale") ?? "tr";

  return (
    <html lang={locale}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-screen bg-[#fafbfd] antialiased font-body">
        {children}
      </body>
    </html>
  );
}
