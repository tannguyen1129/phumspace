import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PhumSpace — Nền tảng di sản số văn hóa Khmer Nam Bộ",
  description: "Nền tảng số hóa, khám phá và bảo tồn di sản văn hóa Khmer Nam Bộ tại Trà Vinh.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className="antialiased selection:bg-amber-500 selection:text-slate-900">
        {children}
      </body>
    </html>
  );
}
