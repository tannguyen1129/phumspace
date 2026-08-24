"use client";

import { useEffect, useState } from "react";
import { Sailboat } from "lucide-react";
import { ApiError, getBoatTeam, type BoatTeam } from "../../../../lib/api-client";
import { FollowButton } from "../../../../components/FollowButton";
import { PageHeader } from "../../../../components/ui/PageHeader";

/** Ho so doi ghe Ngo (FR-FES-004) — chi ten/dia phuong/mau sac/cau chuyen da duyet. */
export function BoatTeamDetailView({ teamId }: { teamId: string }) {
  const [team, setTeam] = useState<BoatTeam | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getBoatTeam(teamId)
      .then(setTeam)
      .catch((err) => setError(err instanceof ApiError ? err.message : "Không tải được đội ghe."))
      .finally(() => setLoading(false));
  }, [teamId]);

  if (loading) {
    return (
      <main style={{ padding: "var(--content-padding-mobile)" }}>
        <p>Đang tải...</p>
      </main>
    );
  }

  if (error || !team) {
    return (
      <main>
        <PageHeader backHref="/festivals/boat-teams" title="Không tìm thấy đội ghe" />
        <p style={{ padding: "0 var(--content-padding-mobile)", color: "#b3413a" }}>{error}</p>
      </main>
    );
  }

  return (
    <main className="app-page detail-page" style={{ paddingBottom: "var(--space-6)" }}>
      <PageHeader
        backHref="/festivals/boat-teams"
        title={team.displayName}
        actions={team.symbolColor ? <span aria-hidden="true" style={{ width: 20, height: 20, borderRadius: "50%", background: team.symbolColor }} /> : undefined}
      />
      <section style={{ padding: "0 var(--content-padding-mobile)", maxWidth: 560, margin: "0 auto" }}>
        <div style={{ marginBottom: "var(--space-3)" }}>
          <FollowButton targetType="BOAT_TEAM" targetId={team.id} />
        </div>

        {team.story ? (
          <section>
            <h2>Câu chuyện</h2>
            <p>{team.story}</p>
          </section>
        ) : (
          <p style={{ opacity: 0.6, fontSize: "var(--font-size-small)", display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
            <Sailboat size={16} aria-hidden="true" /> Chưa có câu chuyện được ghi lại cho đội ghe này.
          </p>
        )}
      </section>
    </main>
  );
}
