"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { updatePreferences } from "../../lib/api-client";
import { PageHeader } from "../../components/ui/PageHeader";
import { Button } from "../../components/ui/Button";

const LANGUAGES = [
  { code: "vi", label: "Tiếng Việt" },
  { code: "en", label: "English" },
];

const INTERESTS = [
  { code: "chua", label: "Chùa" },
  { code: "le-hoi", label: "Lễ hội" },
  { code: "am-nhac", label: "Âm nhạc" },
  { code: "am-thuc", label: "Ẩm thực" },
];

const MAX_INTERESTS = 3;

/** Onboarding nhe (buoc 4, UX Flow) — chon ngon ngu + 1-3 moi quan tam, luon co the bo qua/chinh sau. */
export default function OnboardingPage() {
  const router = useRouter();
  const [language, setLanguage] = useState("vi");
  const [interests, setInterests] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  function toggleInterest(code: string) {
    setInterests((prev) => (prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]));
  }

  async function handleContinue() {
    setLoading(true);
    try {
      await updatePreferences({ preferredLanguage: language, interests });
    } finally {
      router.push("/");
    }
  }

  return (
    <main className="app-page onboarding-page" style={{ paddingBottom: "var(--space-6)" }}>
      <PageHeader title="Chọn ngôn ngữ và mối quan tâm" subtitle="Có thể bỏ qua hoặc chỉnh lại sau" />
      <section style={{ padding: "0 var(--content-padding-mobile)", maxWidth: 480, margin: "0 auto" }}>
        <h2>Ngôn ngữ</h2>
        <div style={{ display: "flex", gap: "var(--space-2)" }}>
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              type="button"
              onClick={() => setLanguage(lang.code)}
              className={`ps-btn ps-btn--${language === lang.code ? "primary" : "secondary"}`}
            >
              {lang.label}
            </button>
          ))}
        </div>

        <h2 style={{ marginTop: "var(--space-5)" }}>Mối quan tâm (tối đa {MAX_INTERESTS})</h2>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-2)" }}>
          {INTERESTS.map((interest) => (
            <button
              key={interest.code}
              type="button"
              onClick={() => toggleInterest(interest.code)}
              disabled={!interests.includes(interest.code) && interests.length >= MAX_INTERESTS}
              className={`ps-btn ps-btn--${interests.includes(interest.code) ? "primary" : "secondary"}`}
            >
              {interest.label}
            </button>
          ))}
        </div>

        <div style={{ display: "flex", gap: "var(--space-3)", marginTop: "var(--space-6)" }}>
          <Button variant="secondary" onClick={() => router.push("/")} style={{ flex: 1 }}>
            Bỏ qua
          </Button>
          <Button variant="primary" onClick={handleContinue} disabled={loading} style={{ flex: 1 }}>
            Tiếp tục <ArrowRight size={16} aria-hidden="true" />
          </Button>
        </div>
      </section>
    </main>
  );
}
