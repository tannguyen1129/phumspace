"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CalendarDays,
  List,
  LocateFixed,
  Map,
  MapPin,
  RefreshCw,
  SlidersHorizontal,
} from "lucide-react";
import {
  buildItinerary,
  listPlaces,
  nearbyPlaces,
  type Itinerary,
  type PlaceSummary,
} from "../../lib/api-client";
import { getPlaceTypeLabel } from "../../lib/place-labels";
import { BottomNav } from "../../components/BottomNav";
import { HeritageMap } from "../../components/discovery/HeritageMap";
import { PlaceCard } from "../../components/discovery/PlaceCard";
import {
  Button,
  CardSkeleton,
  EmptyState,
  FeedbackState,
  FilterChips,
  PageHeader,
  SearchBar,
} from "../../components/ui";

const FILTER_TYPES = [
  "ALL",
  "PAGODA",
  "LAKE",
  "MUSEUM",
  "CRAFT_VILLAGE",
  "FESTIVAL_GROUND",
];
const FACILITIES = [
  { value: "", label: "Mọi tiện ích" },
  { value: "PARKING", label: "Bãi đỗ xe" },
  { value: "RESTROOM", label: "Nhà vệ sinh" },
];

export default function MapPage() {
  const router = useRouter();
  const [places, setPlaces] = useState<PlaceSummary[]>([]);
  const [placeType, setPlaceType] = useState("ALL");
  const [query, setQuery] = useState("");
  const [visitStatus, setVisitStatus] = useState("");
  const [facility, setFacility] = useState("");
  const [hasEvent, setHasEvent] = useState(false);
  const [radius, setRadius] = useState(10000);
  const [selectedId, setSelectedId] = useState<string>();
  const [view, setView] = useState<"map" | "list">("map");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();
  const [nearbyActive, setNearbyActive] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [ready, setReady] = useState(false);
  const [plannedIds, setPlannedIds] = useState<string[]>([]);
  const [itinerary, setItinerary] = useState<Itinerary>();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setQuery(params.get("q") ?? params.get("search") ?? "");
    setPlaceType(params.get("type") ?? "ALL");
    setVisitStatus(params.get("status") ?? "");
    setFacility(params.get("facility") ?? "");
    setHasEvent(params.get("event") === "true");
    setRadius(Number(params.get("radius")) || 10000);
    setSelectedId(params.get("selected") ?? undefined);
    setView(params.get("view") === "list" ? "list" : "map");
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready || nearbyActive) return;
    const handle = window.setTimeout(() => {
      setLoading(true);
      setError(undefined);
      listPlaces({
        placeType: placeType === "ALL" ? undefined : placeType,
        q: query.trim() || undefined,
        visitStatus: visitStatus || undefined,
        facility: facility || undefined,
        hasEvent,
      })
        .then((result) => {
          setPlaces(result);
          setSelectedId((current) =>
            result.some((place) => place.entityId === current)
              ? current
              : result[0]?.entityId,
          );
        })
        .catch(() =>
          setError(
            "Không tải được địa điểm. Kết quả trước đó vẫn được giữ nếu có.",
          ),
        )
        .finally(() => setLoading(false));
    }, 250);
    return () => window.clearTimeout(handle);
  }, [ready, placeType, query, visitStatus, facility, hasEvent, nearbyActive]);

  useEffect(() => {
    if (!ready) return;
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    if (placeType !== "ALL") params.set("type", placeType);
    if (visitStatus) params.set("status", visitStatus);
    if (facility) params.set("facility", facility);
    if (hasEvent) params.set("event", "true");
    if (radius !== 10000) params.set("radius", String(radius));
    if (selectedId) params.set("selected", selectedId);
    if (view !== "map") params.set("view", view);
    router.replace(`/map${params.size ? `?${params}` : ""}`, { scroll: false });
  }, [
    ready,
    query,
    placeType,
    visitStatus,
    facility,
    hasEvent,
    radius,
    selectedId,
    view,
    router,
  ]);

  const chips = useMemo(
    () =>
      FILTER_TYPES.map((type) => ({
        value: type,
        label: type === "ALL" ? "Tất cả" : getPlaceTypeLabel(type),
      })),
    [],
  );
  const activeFilters =
    Number(Boolean(visitStatus)) + Number(Boolean(facility)) + Number(hasEvent);

  function applyNearby(latitude: number, longitude: number) {
    setLoading(true);
    setError(undefined);
    nearbyPlaces(latitude, longitude, radius, {
      placeType: placeType === "ALL" ? undefined : placeType,
      facility: facility || undefined,
    })
      .then((result) => {
        setPlaces(result);
        setNearbyActive(true);
        setSelectedId(result[0]?.entityId);
      })
      .catch(() =>
        setError("Không tìm được địa điểm phù hợp quanh điểm xuất phát."),
      )
      .finally(() => setLoading(false));
  }
  function locateNearby() {
    if (!("geolocation" in navigator)) {
      setError(
        "Thiết bị không hỗ trợ định vị. Hãy chọn một địa điểm làm điểm xuất phát.",
      );
      return;
    }
    setLoading(true);
    setError(undefined);
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => applyNearby(coords.latitude, coords.longitude),
      () => {
        setError(
          "Chưa được cấp quyền vị trí. Bạn có thể chọn một địa điểm trong danh sách làm điểm xuất phát.",
        );
        setLoading(false);
      },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 300000 },
    );
  }
  function resetFilters() {
    setVisitStatus("");
    setFacility("");
    setHasEvent(false);
    setNearbyActive(false);
  }
  function reload() {
    setNearbyActive(false);
    setReady(false);
    window.setTimeout(() => setReady(true), 0);
  }
  function togglePlan(id: string) {
    setPlannedIds((current) =>
      current.includes(id)
        ? current.filter((value) => value !== id)
        : [...current, id],
    );
    setItinerary(undefined);
  }
  async function calculatePlan() {
    if (plannedIds.length >= 2) setItinerary(await buildItinerary(plannedIds));
  }

  return (
    <main className="app-page map-page with-primary-nav">
      <PageHeader
        eyebrow="Khám phá tại Trà Vinh"
        title="Bản đồ di sản"
        subtitle="Tìm địa điểm, xem bối cảnh và chuẩn bị cho chuyến ghé thăm."
        actions={
          <Link href="/festivals" className="ps-btn ps-btn--secondary">
            <CalendarDays size={17} /> Lịch lễ hội
          </Link>
        }
      />
      <section className="map-experience">
        <div className="map-toolbar">
          <SearchBar
            label="Tìm địa điểm"
            placeholder="Tên Việt, tên địa phương, chủ đề…"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setNearbyActive(false);
            }}
            onClear={() => setQuery("")}
          />
          <div className="map-toolbar__row">
            <FilterChips
              items={chips}
              value={placeType}
              onChange={(value) => {
                setPlaceType(value);
                setNearbyActive(false);
              }}
            />
            <Button
              variant={nearbyActive ? "primary" : "secondary"}
              onClick={locateNearby}
            >
              <LocateFixed size={17} /> Gần tôi
            </Button>
            <Button
              variant="secondary"
              onClick={() => setFiltersOpen((value) => !value)}
              aria-expanded={filtersOpen}
            >
              <SlidersHorizontal size={17} /> Lọc
              {activeFilters ? ` (${activeFilters})` : ""}
            </Button>
          </div>
          {filtersOpen && (
            <div className="map-advanced-filters">
              <label>
                <span>Trạng thái tham quan</span>
                <select
                  className="ps-input"
                  value={visitStatus}
                  onChange={(event) => {
                    setVisitStatus(event.target.value);
                    setNearbyActive(false);
                  }}
                >
                  <option value="">Mọi trạng thái</option>
                  <option value="OPEN">Đang mở</option>
                  <option value="UNKNOWN">Chưa xác minh</option>
                </select>
              </label>
              <label>
                <span>Tiện ích</span>
                <select
                  className="ps-input"
                  value={facility}
                  onChange={(event) => {
                    setFacility(event.target.value);
                    setNearbyActive(false);
                  }}
                >
                  {FACILITIES.map((item) => (
                    <option value={item.value} key={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span>Khoảng cách gần tôi</span>
                <select
                  className="ps-input"
                  value={radius}
                  onChange={(event) => setRadius(Number(event.target.value))}
                >
                  <option value={3000}>3 km</option>
                  <option value={10000}>10 km</option>
                  <option value={30000}>30 km</option>
                </select>
              </label>
              <label className="map-check">
                <input
                  type="checkbox"
                  checked={hasEvent}
                  onChange={(event) => {
                    setHasEvent(event.target.checked);
                    setNearbyActive(false);
                  }}
                />{" "}
                Có sự kiện sắp tới
              </label>
              {activeFilters > 0 && (
                <Button variant="ghost" onClick={resetFilters}>
                  Xóa bộ lọc
                </Button>
              )}
            </div>
          )}
          <div className="map-view-switch" aria-label="Chế độ hiển thị">
            <button
              aria-pressed={view === "map"}
              onClick={() => setView("map")}
            >
              <Map size={16} /> Bản đồ
            </button>
            <button
              aria-pressed={view === "list"}
              onClick={() => setView("list")}
            >
              <List size={16} /> Danh sách
            </button>
          </div>
        </div>
        {error && (
          <FeedbackState
            kind="permission"
            title="Chưa thể cập nhật kết quả"
            description={error}
            action={
              <Button variant="secondary" onClick={reload}>
                <RefreshCw size={16} /> Tải danh sách mặc định
              </Button>
            }
          />
        )}
        <div className={`map-layout map-layout--${view}`}>
          <div className="map-layout__canvas">
            {loading && places.length === 0 ? (
              <div className="map-loading">
                <Map size={28} />
                <span>Đang dựng bản đồ…</span>
              </div>
            ) : (
              <HeritageMap
                places={places}
                selectedId={selectedId}
                onSelect={setSelectedId}
              />
            )}
          </div>
          <aside className="map-results" aria-label="Danh sách địa điểm">
            <div className="map-results__heading">
              <div>
                <strong>{places.length} địa điểm</strong>
                <span>
                  {nearbyActive
                    ? `Trong bán kính ${radius / 1000} km`
                    : "Dữ liệu đã công bố"}
                </span>
              </div>
              {!nearbyActive && selectedId && (
                <button
                  onClick={() => {
                    const origin = places.find(
                      (place) => place.entityId === selectedId,
                    );
                    if (origin) applyNearby(origin.latitude, origin.longitude);
                  }}
                >
                  Tìm quanh điểm đang chọn
                </button>
              )}
            </div>
            {loading && places.length === 0 && (
              <>
                <CardSkeleton />
                <CardSkeleton />
              </>
            )}
            {!loading && places.length === 0 && (
              <EmptyState
                icon={MapPin}
                title="Không tìm thấy địa điểm"
                description="Thử đổi từ khóa hoặc xóa bớt bộ lọc."
              />
            )}
            {plannedIds.length > 0 && (
              <div className="map-itinerary">
                <strong>Lộ trình của bạn · {plannedIds.length} điểm</strong>
                {itinerary ? (
                  <>
                    <ol>
                      {itinerary.stops.map((stop) => (
                        <li key={stop.entityId}>
                          {stop.order}. {stop.preferredLabel}
                          <span>
                            {stop.travelMinutesFromPrevious
                              ? `${stop.travelMinutesFromPrevious} phút di chuyển · `
                              : ""}
                            {stop.suggestedVisitMinutes} phút tham quan
                          </span>
                        </li>
                      ))}
                    </ol>
                    <p>
                      Tổng {itinerary.totalDurationMinutes} phút (
                      {itinerary.totalTravelMinutes} phút di chuyển)
                    </p>
                    <small>{itinerary.note}</small>
                  </>
                ) : (
                  <Button
                    disabled={plannedIds.length < 2}
                    onClick={calculatePlan}
                  >
                    Sắp xếp lộ trình
                  </Button>
                )}
              </div>
            )}
            {places.map((place) => (
              <PlaceCard
                key={place.entityId}
                place={place}
                selected={selectedId === place.entityId}
                onSelect={() => setSelectedId(place.entityId)}
                planned={plannedIds.includes(place.entityId)}
                onTogglePlan={() => togglePlan(place.entityId)}
              />
            ))}
          </aside>
        </div>
      </section>
      <BottomNav />
    </main>
  );
}
