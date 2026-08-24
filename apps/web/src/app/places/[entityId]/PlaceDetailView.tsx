"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Accessibility,
  Camera,
  Clock,
  ExternalLink,
  Info,
  MapPin,
  Navigation,
  Phone,
  ScanLine,
  ShieldCheck,
  Sparkles,
  TriangleAlert,
} from "lucide-react";
import {
  ApiError,
  getPlaceDetail,
  type PlaceDetail,
} from "../../../lib/api-client";
import {
  getPlaceTypeLabel,
  getVerificationLabel,
} from "../../../lib/place-labels";
import { SaveButton } from "../../../components/SaveButton";
import { OfflineDownloadButton } from "../../../components/OfflineDownloadButton";
import {
  Badge,
  Button,
  Card,
  CardSkeleton,
  FeedbackState,
  PageHeader,
} from "../../../components/ui";

export function PlaceDetailView({ entityId }: { entityId: string }) {
  const [place, setPlace] = useState<PlaceDetail>();
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(true);
  const load = () => {
    setLoading(true);
    setError(undefined);
    getPlaceDetail(entityId)
      .then(setPlace)
      .catch((err) =>
        setError(
          err instanceof ApiError ? err.message : "Không tải được địa điểm.",
        ),
      )
      .finally(() => setLoading(false));
  };
  useEffect(load, [entityId]);

  if (loading)
    return (
      <main className="place-detail-loading">
        <CardSkeleton lines={5} />
        <CardSkeleton lines={4} />
      </main>
    );
  if (error || !place)
    return (
      <main>
        <PageHeader backHref="/map" title="Không tìm thấy địa điểm" />
        <FeedbackState
          title="Chưa thể mở địa điểm"
          description={error ?? "Địa điểm có thể đã được gỡ hoặc chưa công bố."}
          action={
            <>
              <Button onClick={load}>Thử lại</Button>{" "}
              <Link href="/map" className="ps-btn ps-btn--secondary">
                Về bản đồ
              </Link>
            </>
          }
        />
      </main>
    );

  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${place.latitude},${place.longitude}`;
  return (
    <main className="app-page place-detail-page" style={{ paddingBottom: 88 }}>
      <PageHeader
        eyebrow={`${getPlaceTypeLabel(place.placeType)} · ${place.administrativeArea}`}
        backHref={`/map?selected=${entityId}`}
        title={place.preferredLabel}
        subtitle={
          place.localName
            ? `Tên địa phương: ${place.localName}`
            : "Tên địa phương chưa được cập nhật"
        }
        actions={<SaveButton entityId={entityId} />}
      />
      <section className="place-detail-layout">
        <article className="place-detail-main">
          <div className="place-trust">
            <Badge variant="verified" icon={<ShieldCheck size={12} />}>
              {getVerificationLabel(place.verificationLevel)}
            </Badge>
            {place.lastVerifiedAt && (
              <span>
                Xác minh{" "}
                {new Date(place.lastVerifiedAt).toLocaleDateString("vi-VN")}
              </span>
            )}
          </div>
          <Card className="place-why">
            <Sparkles size={20} />
            <div>
              <span>Vì sao nên ghé</span>
              <h2>Một điểm dừng để hiểu bối cảnh địa phương</h2>
              <p>
                {place.visitorSummary ??
                  "Phần giới thiệu dành cho du khách chưa được người phụ trách nội dung xác minh."}
              </p>
            </div>
          </Card>
          <section className="place-content-section">
            <span className="section-kicker">Câu chuyện địa điểm</span>
            <h2>Giới thiệu</h2>
            <p>
              {place.description ??
                "Nội dung giới thiệu chi tiết đang được biên tập và xác minh."}
            </p>
          </section>
          <section className="place-content-section">
            <span className="section-kicker">Tôn trọng không gian</span>
            <h2>
              <Info size={20} /> Quy tắc tham quan
            </h2>
            {place.etiquetteNote ? (
              <p>{place.etiquetteNote}</p>
            ) : (
              <div className="unknown-note">
                <TriangleAlert size={18} />
                <p>
                  Quy tắc riêng của địa điểm chưa được cập nhật. Hãy quan sát
                  biển hướng dẫn và hỏi người quản lý trước khi chụp ảnh hoặc
                  vào khu vực nghi lễ.
                </p>
              </div>
            )}
          </section>
          <section className="place-content-section">
            <span className="section-kicker">Hướng dẫn tại điểm</span>
            <h2>
              <Camera size={20} /> Chụp ảnh và tiếp cận
            </h2>
            <p>
              {place.photoGuidanceNote ??
                "Chưa có dữ liệu xác minh về khu vực được phép chụp ảnh. Hãy hỏi người quản lý trước khi chụp trong không gian nghi lễ."}
            </p>
            <p>
              <strong>Accessibility:</strong>{" "}
              {place.accessibilityNote ??
                "Chưa có dữ liệu accessibility được xác minh."}
            </p>
          </section>
          <section className="place-content-section">
            <span className="section-kicker">Minh bạch dữ liệu</span>
            <h2>
              <ShieldCheck size={20} /> Nguồn và xác minh
            </h2>
            <div className="place-source-meta">
              <Badge>{place.publicationStatus}</Badge>
              <Badge variant="verified">
                {getVerificationLabel(place.verificationLevel)}
              </Badge>
            </div>
            {place.sources?.length ? (
              <ul className="place-sources">
                {place.sources.map((source) => (
                  <li key={source.id}>
                    {source.url ? (
                      <a href={source.url} target="_blank" rel="noreferrer">
                        {source.title} <ExternalLink size={13} />
                      </a>
                    ) : (
                      <strong>{source.title}</strong>
                    )}
                    <span>
                      {[source.author, source.reliability]
                        .filter(Boolean)
                        .join(" · ")}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="unknown-note">
                <TriangleAlert size={18} />
                <p>Chưa có nguồn công khai phù hợp để hiển thị.</p>
              </div>
            )}
          </section>
        </article>

        <aside className="place-detail-aside">
          <Card className="place-practical">
            <span className="section-kicker">Thông tin chuyến đi</span>
            <h2>Chuẩn bị trước khi đến</h2>
            <dl>
              <div>
                <dt>
                  <Clock size={18} /> Giờ và thời lượng
                </dt>
                <dd>
                  {place.openingHoursNote ?? "Chưa có giờ mở cửa được xác minh"}
                  {place.suggestedVisitMinutes
                    ? ` · khoảng ${place.suggestedVisitMinutes} phút`
                    : ""}
                </dd>
              </div>
              <div>
                <dt>
                  <MapPin size={18} /> Địa chỉ
                </dt>
                <dd>{place.address ?? place.administrativeArea}</dd>
              </div>
              <div>
                <dt>
                  <Navigation size={18} /> Tọa độ
                </dt>
                <dd>
                  {place.latitude.toFixed(5)}, {place.longitude.toFixed(5)}
                </dd>
              </div>
              <div>
                <dt>
                  <Accessibility size={18} /> Tiện ích
                </dt>
                <dd>
                  {place.facilities?.length
                    ? place.facilities.map(facilityLabel).join(", ")
                    : "Chưa có dữ liệu tiện ích xác minh"}
                </dd>
              </div>
              <div>
                <dt>
                  <Phone size={18} /> Liên hệ
                </dt>
                <dd>
                  {place.contactNote ?? "Chưa có thông tin liên hệ xác minh"}
                </dd>
              </div>
            </dl>
            <a
              href={directionsUrl}
              target="_blank"
              rel="noreferrer"
              className="ps-btn ps-btn--primary place-directions"
            >
              <Navigation size={17} /> Mở Google Maps <ExternalLink size={14} />
            </a>
          </Card>
          <div className="place-actions">
            <Link
              href={`/scan?placeId=${entityId}`}
              className="ps-btn ps-btn--secondary"
            >
              <ScanLine size={17} /> Quét tại địa điểm này
            </Link>
            <OfflineDownloadButton
              id={entityId}
              kind="place"
              title={place.preferredLabel}
              apiPaths={[`/v1/discovery/places/${entityId}`]}
            />
          </div>
          <p className="place-data-note">
            Thông tin thực tế có thể thay đổi. Hãy kiểm tra tại địa điểm trước
            chuyến đi.
          </p>
        </aside>
      </section>
    </main>
  );
}

function facilityLabel(value: string): string {
  return value === "PARKING"
    ? "Bãi đỗ xe"
    : value === "RESTROOM"
      ? "Nhà vệ sinh"
      : value;
}
