import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import {
  Be_Vietnam_Pro,
  Noto_Sans_Khmer,
  Noto_Serif_Khmer,
} from "next/font/google";
import "./globals.css";
import "./pwa-gd8.css";
import { ServiceWorkerRegistration } from "../components/ServiceWorkerRegistration";
import { OnlineStatusBanner } from "../components/OnlineStatusBanner";
import { AccessibilityPreferencesEffect } from "../components/AccessibilityPreferencesEffect";
import { AnalyticsTracker } from "../components/AnalyticsTracker";
import { InstallPrompt } from "../components/InstallPrompt";
import { LocalePreferencesEffect } from "../components/LocalePreferencesEffect";
import { OfflineMutationSync } from "../components/OfflineMutationSync";

/**
 * next/font tu-host font (khong goi Google Fonts luc runtime, hop PWA/offline) — kich hoat that
 * cac font da khai bao trong design token (--font-ui-latin/--font-ui-khmer/--font-display-khmer)
 * von chi ton tai o dang ten CSS truoc day, trinh duyet fallback ve font he thong.
 */
const beVietnamPro = Be_Vietnam_Pro({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-be-vietnam-pro",
  display: "swap",
});

const notoSansKhmer = Noto_Sans_Khmer({
  subsets: ["khmer"],
  weight: ["400", "500", "600"],
  variable: "--font-noto-sans-khmer",
  display: "swap",
});

const notoSerifKhmer = Noto_Serif_Khmer({
  subsets: ["khmer"],
  weight: ["500", "600", "700"],
  variable: "--font-noto-serif-khmer",
  display: "swap",
});

export const metadata: Metadata = {
  title: "PhumSpace",
  description:
    "Khám phá văn hóa Khmer Nam Bộ tại Trà Vinh — đúng nguồn, đúng ngữ cảnh, tôn trọng cộng đồng.",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#5A2433",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="vi"
      suppressHydrationWarning
      className={`${beVietnamPro.variable} ${notoSansKhmer.variable} ${notoSerifKhmer.variable}`}
    >
      {/* Browser extensions (translation/dictionary/password tools) may inject data-* attributes
          into body before React hydrates. The body has no app-owned dynamic attributes, so
          suppressing this one boundary avoids a false development overlay without masking
          hydration mismatches inside application components. */}
      <body suppressHydrationWarning>
        <a href="#main-content" className="skip-link">
          Bỏ qua đến nội dung chính
        </a>
        <ServiceWorkerRegistration />
        <AccessibilityPreferencesEffect />
        <AnalyticsTracker />
        <LocalePreferencesEffect />
        <OnlineStatusBanner />
        <InstallPrompt />
        <OfflineMutationSync />
        <div id="main-content">{children}</div>
      </body>
    </html>
  );
}
