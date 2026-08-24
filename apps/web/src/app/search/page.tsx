"use client";
import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Search, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  listPlaces,
  searchHeritage,
  type HeritageSearchResult,
  type PlaceSummary,
} from "../../lib/api-client";
import {
  Badge,
  Card,
  CardSkeleton,
  EmptyState,
  FeedbackState,
  PageHeader,
  SearchBar,
} from "../../components/ui";
import { BottomNav } from "../../components/BottomNav";
import { getVerificationLabel } from "../../lib/place-labels";

export default function SearchPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<HeritageSearchResult[]>([]);
  const [places, setPlaces] = useState<PlaceSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();
  useEffect(() => {
    const value = new URLSearchParams(window.location.search).get("q") ?? "";
    setQuery(value);
    if (!value) {
      setLoading(false);
      return;
    }
    Promise.all([searchHeritage(value), listPlaces({ q: value })])
      .then(([items, placeItems]) => {
        setResults(items);
        setPlaces(placeItems);
      })
      .catch(() => setError("Không tải được kết quả tìm kiếm."))
      .finally(() => setLoading(false));
  }, []);
  const placeIds = useMemo(
    () => new Set(places.map((place) => place.entityId)),
    [places],
  );
  function submit(event: FormEvent) {
    event.preventDefault();
    const value = query.trim();
    if (value) router.push(`/search?q=${encodeURIComponent(value)}`);
  }
  return (
    <main className="app-page search-page with-primary-nav">
      <PageHeader
        eyebrow="PHUMDATA CÓ NGUỒN"
        title="Tìm kiếm khám phá"
        subtitle="Tìm theo tên Việt, Khmer, tên địa phương, mô tả hoặc chủ đề."
      />
      <section className="search-content">
        <form onSubmit={submit} className="search-page-form">
          <SearchBar
            label="Từ khóa tìm kiếm"
            placeholder="Ví dụ: chùa Ang, ghe Ngo…"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onClear={() => setQuery("")}
          />
          <button className="ps-btn ps-btn--primary" type="submit">
            Tìm kiếm
          </button>
        </form>
        {error && (
          <FeedbackState title="Chưa thể tìm kiếm" description={error} />
        )}{" "}
        {loading ? (
          <div className="search-results">
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : results.length === 0 ? (
          <EmptyState
            icon={Search}
            title={
              query
                ? "Không tìm thấy nội dung phù hợp"
                : "Nhập từ khóa để bắt đầu"
            }
            description={
              query
                ? "Thử tên địa phương, từ không dấu hoặc một chủ đề rộng hơn."
                : undefined
            }
          />
        ) : (
          <div className="search-results">
            {results.map((result) => (
              <Card key={result.id} interactive>
                <div>
                  <Badge variant="verified" icon={<ShieldCheck size={12} />}>
                    {getVerificationLabel(result.verificationLevel)}
                  </Badge>
                  <h2>{result.preferredLabel}</h2>
                  <p>{result.description ?? "Chưa có mô tả công khai."}</p>
                </div>
                <Link
                  href={
                    placeIds.has(result.entityId)
                      ? `/places/${result.entityId}`
                      : `/culture/${result.entityId}`
                  }
                  aria-label={`Mở ${result.preferredLabel}`}
                >
                  <ArrowRight />
                </Link>
              </Card>
            ))}
          </div>
        )}
      </section>
      <BottomNav />
    </main>
  );
}
