// src/app/layout.tsx
import type { Metadata } from "next";
// import "./globals.css"; // (Uncomment baris ini jika Anda memiliki file globals.css)

export const metadata: Metadata = {
  title: "Sistem Tagihan Les",
  description: "Sistem pembayaran SPP QRIS",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}