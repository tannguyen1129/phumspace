import type { Metadata } from 'next';
import './globals.css';
import { Header } from '@/components/layout/header';
import { MobileNav } from '@/components/layout/mobile-nav';
import { Footer } from '@/components/layout/footer';

export const metadata: Metadata = {
  title: 'PhumSpace — Nền tảng di sản số văn hóa Khmer Nam Bộ',
  description: 'Nền tảng số hóa, khám phá và bảo tồn di sản văn hóa Khmer Nam Bộ tại Trà Vinh với kho tri thức PhumData.',
  keywords: ['PhumSpace', 'Khmer Nam Bộ', 'Trà Vinh', 'Di sản văn hóa', 'PhumData', 'Chùa Âng', 'Ok Om Bok'],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className="antialiased bg-slate-950 text-slate-100 min-h-screen flex flex-col justify-between selection:bg-amber-500 selection:text-slate-950">
        <Header />
        <main className="flex-grow mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8">
          {children}
        </main>
        <MobileNav />
        <Footer />
      </body>
    </html>
  );
}
