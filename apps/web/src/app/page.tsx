"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  MapPin,
  RefreshCw,
  ScanLine,
  Sparkles,
  Volume2,
} from "lucide-react";
import { BottomNav } from "../components/BottomNav";
import { PlaceCard } from "../components/discovery/PlaceCard";
import {
  Button,
  CardSkeleton,
  EmptyState,
  FeedbackState,
  SearchBar,
} from "../components/ui";
import {
  fetchMe,
  listFestivals,
  listPlaces,
  type FestivalSummary,
  type PlaceSummary,
  type PublicUser,
} from "../lib/api-client";

const TOPICS = [
  {
    href: "/handbook",
    label: "Ngôn ngữ Khmer",
    copy: "Nghe cách đọc từ cộng đồng",
    icon: Volume2,
  },
  {
    href: "/festivals",
    label: "Lễ hội",
    copy: "Lịch và chương trình đã xác minh",
    icon: CalendarDays,
  },
  {
    href: "/quiz",
    label: "Học qua câu hỏi",
    copy: "Tìm hiểu theo nhịp của bạn",
    icon: BookOpen,
  },
];

export default function HomePage() {
  const router = useRouter();
  const [user, setUser] = useState<PublicUser>();
  const [places, setPlaces] = useState<PlaceSummary[]>([]);
  const [festivals, setFestivals] = useState<FestivalSummary[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  function loadHome() {
    setLoading(true);
    setError(false);
    Promise.allSettled([fetchMe(), listPlaces(), listFestivals()])
      .then(([meResult, placesResult, festivalsResult]) => {
        if (meResult.status === "fulfilled") setUser(meResult.value);
        if (placesResult.status === "fulfilled")
          setPlaces(placesResult.value.slice(0, 6));
        if (festivalsResult.status === "fulfilled")
          setFestivals(festivalsResult.value.slice(0, 3));
        setError(
          placesResult.status === "rejected" ||
            festivalsResult.status === "rejected",
        );
      })
      .finally(() => setLoading(false));
  }

  useEffect(loadHome, []);

  function search(event: React.FormEvent) {
    event.preventDefault();
    const value = query.trim();
    router.push(value ? `/search?q=${encodeURIComponent(value)}` : "/map");
  }

  return (
    <main className="discover-page with-primary-nav">
      <section className="discover-hero">
        <div className="discover-hero__copy">
          <p className="discover-hero__greeting">
            <Sparkles size={15} />{" "}
            {user ? `Xin chào, ${user.displayName}` : "Chào mừng đến PhumSpace"}
          </p>
          <h1>Khám phá văn hóa Khmer Nam Bộ</h1>
          <p>
            Điểm đến, câu chuyện và ngôn ngữ được đặt đúng nguồn, đúng địa
            phương và đúng bối cảnh.
          </p>
          <form className="discover-search" onSubmit={search}>
            <SearchBar
              label="Tìm kiếm trên PhumSpace"
              placeholder="Bạn muốn khám phá điều gì?"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onClear={() => setQuery("")}
            />
            <button className="ps-btn ps-btn--primary" type="submit">
              Tìm kiếm
            </button>
          </form>
          <div className="discover-hero__actions">
            <Link href="/map" className="ps-btn ps-btn--secondary">
              <MapPin size={17} /> Mở bản đồ
            </Link>
            <Link href="/scan" className="ps-btn ps-btn--ghost">
              <ScanLine size={17} /> Quét một hình ảnh
            </Link>
          </div>
        </div>
        <div className="discover-hero__mark" aria-hidden="true">
          <span>ភ</span>
          <small>Trà Vinh</small>
        </div>
      </section>

      {error && (
        <section className="discover-section">
          <FeedbackState
            title="Chưa tải được một phần nội dung"
            description="Phiên đăng nhập hoặc kết nối API có thể vừa hết hạn. Bạn có thể thử tải lại ngay."
            action={
              <Button onClick={loadHome}>
                <RefreshCw size={16} /> Thử tải lại
              </Button>
            }
          />
        </section>
      )}

      <section className="discover-section">
        <div className="section-heading">
          <div>
            <span>Gợi ý cho chuyến đi</span>
            <h2>Địa điểm nổi bật</h2>
          </div>
          <Link href="/map">
            Xem trên bản đồ <ArrowRight size={16} />
          </Link>
        </div>
        <div className="discover-place-grid">
          {loading ? (
            <>
              <CardSkeleton />
              <CardSkeleton />
              <CardSkeleton />
            </>
          ) : places.length === 0 ? (
            <EmptyState icon={MapPin} title="Chưa có địa điểm được công bố" />
          ) : (
            places.map((place) => (
              <PlaceCard key={place.entityId} place={place} />
            ))
          )}
        </div>
      </section>

      <section className="discover-section">
        <div className="section-heading">
          <div>
            <span>Hiểu sâu hơn</span>
            <h2>Khám phá theo chủ đề</h2>
          </div>
        </div>
        <div className="topic-grid">
          {TOPICS.map(({ href, label, copy, icon: Icon }) => (
            <Link key={href} href={href}>
              <article className="topic-card">
                <span>
                  <Icon size={21} />
                </span>
                <div>
                  <h3>{label}</h3>
                  <p>{copy}</p>
                </div>
                <ArrowRight size={17} />
              </article>
            </Link>
          ))}
        </div>
      </section>

      <section className="discover-section discover-events">
        <div className="section-heading">
          <div>
            <span>Lịch văn hóa</span>
            <h2>Lễ hội sắp tới</h2>
          </div>
          <Link href="/festivals">
            Xem tất cả <ArrowRight size={16} />
          </Link>
        </div>
        {!loading && festivals.length === 0 ? (
          <EmptyState
            icon={CalendarDays}
            title="Chưa có lịch lễ hội được công bố"
            description="Ngày tổ chức cần được xác minh theo từng năm."
          />
        ) : (
          <div className="event-strip">
            {festivals.map((festival) => (
              <Link
                key={festival.entityId}
                href={`/festivals/${festival.entityId}`}
              >
                <article>
                  <span className="event-date">
                    <strong>
                      {festival.nextOccurrenceAt
                        ? new Date(festival.nextOccurrenceAt).getDate()
                        : "—"}
                    </strong>
                    <small>
                      {festival.nextOccurrenceAt
                        ? `Th${new Date(festival.nextOccurrenceAt).getMonth() + 1}`
                        : "Chờ lịch"}
                    </small>
                  </span>
                  <div>
                    <h3>{festival.preferredLabel}</h3>
                    <p>
                      {festival.nextOccurrenceAt
                        ? new Date(
                            festival.nextOccurrenceAt,
                          ).toLocaleDateString("vi-VN")
                        : "Ngày tổ chức chưa được xác minh"}
                    </p>
                  </div>
                  <ArrowRight size={18} />
                </article>
              </Link>
            ))}
          </div>
        )}
      </section>
      <BottomNav />
    </main>
  );
}
