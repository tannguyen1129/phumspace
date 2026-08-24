import Link from "next/link";
import {
  CalendarDays,
  ChevronRight,
  Clock3,
  MapPin,
  Navigation,
  ShieldCheck,
} from "lucide-react";
import type { PlaceSummary } from "../../lib/api-client";
import {
  getPlaceTypeLabel,
  getVerificationLabel,
} from "../../lib/place-labels";
import { Badge } from "../ui/Badge";
import { Card } from "../ui/Card";

export function PlaceCard({
  place,
  selected = false,
  onSelect,
  planned = false,
  onTogglePlan,
}: {
  place: PlaceSummary;
  selected?: boolean;
  onSelect?: () => void;
  planned?: boolean;
  onTogglePlan?: () => void;
}) {
  return (
    <Card
      interactive
      className={`place-card${selected ? " place-card--selected" : ""}`}
    >
      <button
        type="button"
        className="place-card__select"
        onClick={onSelect}
        aria-label={`Chọn ${place.preferredLabel} trên bản đồ`}
      />
      <div className="place-card__icon">
        <MapPin size={20} aria-hidden="true" />
      </div>
      <div className="place-card__body">
        <div className="place-card__heading">
          <h3>{place.preferredLabel}</h3>
          <Link
            href={`/places/${place.entityId}`}
            aria-label={`Xem ${place.preferredLabel}`}
          >
            <ChevronRight size={19} />
          </Link>
        </div>
        <p className="place-card__meta">
          {getPlaceTypeLabel(place.placeType)} · {place.administrativeArea}
        </p>
        {place.visitorSummary && (
          <p className="place-card__summary">{place.visitorSummary}</p>
        )}
        {place.recommendationReason && (
          <p className="place-card__reason">{place.recommendationReason}</p>
        )}
        <div className="place-card__badges">
          <Badge variant="verified" icon={<ShieldCheck size={12} />}>
            {getVerificationLabel(place.verificationLevel)}
          </Badge>
          {place.distanceMeters !== null && (
            <Badge icon={<Navigation size={11} />}>
              {formatDistance(place.distanceMeters)}
            </Badge>
          )}
          {place.suggestedVisitMinutes && (
            <Badge icon={<Clock3 size={11} />}>
              {place.suggestedVisitMinutes} phút
            </Badge>
          )}
          {place.hasUpcomingEvent && (
            <Badge icon={<CalendarDays size={11} />}>Có sự kiện</Badge>
          )}
          <Badge>{visitStatusLabel(place.visitStatus)}</Badge>
        </div>
        {onTogglePlan && (
          <button
            type="button"
            className="place-card__plan"
            onClick={onTogglePlan}
          >
            {planned ? "Bỏ khỏi lộ trình" : "Thêm vào lộ trình"}
          </button>
        )}
      </div>
    </Card>
  );
}

function formatDistance(meters: number): string {
  return meters < 1000
    ? `${Math.round(meters)} m`
    : `${(meters / 1000).toFixed(1)} km`;
}
function visitStatusLabel(status: PlaceSummary["visitStatus"]): string {
  return status === "OPEN"
    ? "Đang mở"
    : status === "CLOSED"
      ? "Đóng cửa"
      : status === "TEMPORARILY_CLOSED"
        ? "Tạm đóng"
        : "Giờ chưa xác minh";
}
