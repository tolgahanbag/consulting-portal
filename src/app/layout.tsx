import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "EstonTurk Danışmanlık",
  description: "AB ve Estonya'dan Türkiye'de şirket kurma danışmanlık portalı",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
