"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { AlertTriangle, CalendarDays, Send, ShieldCheck } from "lucide-react";
import {
  ApiError,
  getFestivalDetail,
  sendEmergencyBroadcast,
  updateOccurrenceStatus,
  type FestivalDetail,
} from "../../../lib/api-client";
import { FollowButton } from "../../../components/FollowButton";
import { PageHeader } from "../../../components/ui/PageHeader";
import { Card } from "../../../components/ui/Card";
import { Badge } from "../../../components/ui/Badge";
import { Button } from "../../../components/ui/Button";

const OCCURRENCE_STATUS_LABELS: Record<string, string> = {
  PLANNED: "Dự kiến",
  CONFIRMED: "Đã xác nhận",
  POSTPONED: "Hoãn lại",
  CANCELLED: "Đã hủy",
};

const OCCURRENCE_STATUS_VARIANT: Record<string, "neutral" | "success" | "warning" | "danger"> = {
  PLANNED: "neutral",
  CONFIRMED: "success",
  POSTPONED: "warning",
  CANCELLED: "danger",
};

const EVENT_TYPE_LABELS: Record<string, string> = {
  CEREMONY: "Nghi lễ",
  BOAT_RACE: "Đua ghe",
};

const FACILITY_TYPE_LABELS: Record<string, string> = {
  PARKING: "Bãi giữ xe",
  MEDICAL: "Y tế",
  RESTROOM: "Nhà vệ sinh",
  VIEWING_POINT: "Điểm quan sát",
  SAFETY_WARNING: "Cảnh báo an toàn",
};

/** Festival Detail (M-20, FR-FES-001..007) — mo ta, chuong trinh, tien ich/an toan, theo doi, thong bao khan. */
export function FestivalDetailView({ entityId }: { entityId: string }) {
  const [festival, setFestival] = useState<FestivalDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    refresh();
  }, [entityId]);

  function refresh() {
    getFestivalDetail(entityId)
      .then(setFestival)
      .catch((err) => setError(err instanceof ApiError ? err.message : "Không tải được lễ hội."))
      .finally(() => setLoading(false));
  }

  if (loading) {
    return (
      <main style={{ padding: "var(--content-padding-mobile)" }}>
        <p>Đang tải...</p>
      </main>
    );
  }

  if (error || !festival) {
    return (
      <main>
        <PageHeader backHref="/festivals" title="Không tìm thấy lễ hội" />
        <p style={{ padding: "0 var(--content-padding-mobile)", color: "#b3413a" }}>{error}</p>
      </main>
    );
  }

  return (
    <main className="app-page detail-page festival-detail-page" style={{ paddingBottom: "var(--space-6)" }}>
      <PageHeader
        backHref="/festivals"
        title={festival.preferredLabel}
        subtitle={festival.recurrenceRule ? `Chu kỳ tổ chức: ${festival.recurrenceRule}` : undefined}
      />
      <section className="festival-detail-layout">
        <div style={{ marginBottom: "var(--space-3)" }}>
          <FollowButton targetType="FESTIVAL" targetId={festival.entityId} />
        </div>

        {festival.description && (
          <section style={{ marginBottom: "var(--space-4)" }}>
            <h2>Giới thiệu</h2>
            <p>{festival.description}</p>
          </section>
        )}

        {festival.occurrences.map((occurrence) => (
          <Card key={occurrence.id} className="festival-occurrence">
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "var(--space-2)" }}>
              <h2 style={{ marginTop: 0, display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
                <CalendarDays size={18} aria-hidden="true" />
                {new Date(occurrence.startsAt).toLocaleDateString("vi-VN", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </h2>
              <Badge variant={OCCURRENCE_STATUS_VARIANT[occurrence.status] ?? "neutral"}>
                {OCCURRENCE_STATUS_LABELS[occurrence.status] ?? occurrence.status}
              </Badge>
            </div>

            {occurrence.events.length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)", marginTop: "var(--space-2)" }}>
                {occurrence.events.map((event) => (
                  <div key={event.id} style={{ padding: "var(--space-2) var(--space-3)", borderRadius: "var(--radius-sm)", background: "var(--color-sand-surface)" }}>
                    <strong>{event.title}</strong>
                    <span style={{ fontSize: "var(--font-size-caption)", opacity: 0.7 }}>
                      {" "}
                      · {EVENT_TYPE_LABELS[event.eventType] ?? event.eventType}
                    </span>
                    {event.note && <p style={{ fontSize: "var(--font-size-small)", margin: "var(--space-1) 0 0" }}>{event.note}</p>}
                  </div>
                ))}
              </div>
            )}

            {occurrence.facilities.length > 0 && (
              <div style={{ marginTop: "var(--space-3)" }}>
                <h3 style={{ fontSize: 14 }}>An toàn &amp; tiện ích</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-1)" }}>
                  {occurrence.facilities.map((facility) => (
                    <p key={facility.id} style={{ fontSize: "var(--font-size-small)", opacity: 0.85, margin: 0 }}>
                      <strong>{FACILITY_TYPE_LABELS[facility.facilityType] ?? facility.facilityType}:</strong> {facility.note}
                    </p>
                  ))}
                </div>
              </div>
            )}

            <OccurrenceStatusControl occurrenceId={occurrence.id} currentStatus={occurrence.status} onChanged={refresh} />
          </Card>
        ))}

        <EmergencyBroadcastForm festivalId={festival.entityId} />

        <p style={{ fontSize: "var(--font-size-caption)", opacity: 0.6, marginTop: "var(--space-6)", display: "flex", alignItems: "center", gap: "var(--space-1)" }}>
          <ShieldCheck size={14} aria-hidden="true" /> Mức xác minh: {festival.verificationLevel} · Nội dung đua ghe Ngo liên quan có
          trong <Link href="/handbook">Sổ tay</Link>, bộ câu hỏi tại <Link href="/quiz">Olympiad</Link>, và hồ sơ tại{" "}
          <Link href="/festivals/boat-teams">Đội ghe Ngo</Link>.
        </p>
      </section>
    </main>
  );
}

/**
 * Chi Organization Manager cua to chuc so huu le hoi (hoac SYSTEM_ADMIN) doi duoc trang thai —
 * form luon hien, API tra loi ro neu khong co quyen (khong kiem tra quyen o client).
 */
function OccurrenceStatusControl({
  occurrenceId,
  currentStatus,
  onChanged,
}: {
  occurrenceId: string;
  currentStatus: string;
  onChanged: () => void;
}) {
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleChange(status: string) {
    setBusy(true);
    setError(null);
    try {
      await updateOccurrenceStatus(occurrenceId, status);
      onChanged();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Không đổi được trạng thái.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ marginTop: "var(--space-3)" }}>
      <label className="ps-field" style={{ marginBottom: 0 }}>
        <span className="ps-field-label">Đổi trạng thái (chỉ Manager tổ chức phụ trách)</span>
        <select value={currentStatus} onChange={(event) => handleChange(event.target.value)} disabled={busy} className="ps-select">
          {Object.entries(OCCURRENCE_STATUS_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </label>
      {error && (
        <p role="alert" style={{ color: "#b3413a", fontSize: "var(--font-size-caption)" }}>
          {error}
        </p>
      )}
    </div>
  );
}

function EmergencyBroadcastForm({ festivalId }: { festivalId: string }) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sentTo, setSentTo] = useState<number | null>(null);
  const [sending, setSending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSending(true);
    setError(null);
    setSentTo(null);
    try {
      const count = await sendEmergencyBroadcast(festivalId, { title, body, priority: "URGENT" });
      setSentTo(count);
      setTitle("");
      setBody("");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Không gửi được thông báo.");
    } finally {
      setSending(false);
    }
  }

  return (
    <Card style={{ border: "1px dashed var(--color-saffron-accent)", background: "var(--color-sand-surface)" }}>
      <h2 style={{ fontSize: 15, marginTop: 0, display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
        <AlertTriangle size={18} aria-hidden="true" style={{ color: "var(--color-saffron-accent)" }} />
        Gửi thông báo khẩn (chỉ Manager tổ chức phụ trách)
      </h2>
      <form onSubmit={handleSubmit}>
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Tiêu đề"
          required
          className="ps-input"
          style={{ marginBottom: "var(--space-2)" }}
        />
        <textarea
          value={body}
          onChange={(event) => setBody(event.target.value)}
          placeholder="Nội dung"
          required
          className="ps-textarea"
          style={{ marginBottom: "var(--space-2)" }}
        />
        {error && <p style={{ color: "#b3413a", fontSize: "var(--font-size-small)" }}>{error}</p>}
        {sentTo !== null && (
          <p style={{ color: "var(--color-palm-green)", fontSize: "var(--font-size-small)" }}>Đã gửi đến {sentTo} người theo dõi.</p>
        )}
        <Button type="submit" disabled={sending} style={{ width: "100%", background: "var(--color-saffron-accent)" }}>
          <Send size={16} aria-hidden="true" /> {sending ? "Đang gửi..." : "Gửi thông báo khẩn"}
        </Button>
      </form>
    </Card>
  );
}
