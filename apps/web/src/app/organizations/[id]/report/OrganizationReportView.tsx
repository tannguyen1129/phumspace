"use client";

import { useEffect, useState } from "react";
import { BarChart3 } from "lucide-react";
import {
  ApiError,
  getOrganization,
  getOrganizationReport,
  type Organization,
  type OrganizationCompetitionReport,
} from "../../../../lib/api-client";
import { PageHeader } from "../../../../components/ui/PageHeader";
import { Card } from "../../../../components/ui/Card";
import { EmptyState } from "../../../../components/ui/EmptyState";

/**
 * Bao cao to chuc toi thieu (FR-ORG-003/004) — chi Organization Manager cua chinh to chuc nay
 * xem duoc; API tra 403 (ForbiddenException tu OrganizationService.assertIsManager) neu khong
 * phai Manager, hien thi thanh thong bao loi ro rang thay vi trang trong.
 */
export function OrganizationReportView({ organizationId }: { organizationId: string }) {
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [report, setReport] = useState<OrganizationCompetitionReport[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getOrganization(organizationId), getOrganizationReport(organizationId)])
      .then(([org, reportData]) => {
        setOrganization(org);
        setReport(reportData);
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : "Không tải được báo cáo."))
      .finally(() => setLoading(false));
  }, [organizationId]);

  if (loading) {
    return (
      <main style={{ padding: "var(--content-padding-mobile)" }}>
        <p>Đang tải...</p>
      </main>
    );
  }

  if (error || !organization || !report) {
    return (
      <main>
        <PageHeader backHref="/" title="Không tìm thấy tổ chức" />
        <p style={{ padding: "0 var(--content-padding-mobile)", color: "#b3413a" }}>{error}</p>
      </main>
    );
  }

  return (
    <main className="app-page detail-page organization-page" style={{ paddingBottom: "var(--space-6)" }}>
      <PageHeader
        backHref={`/organizations/${organizationId}`}
        title={organization.name}
        subtitle="Báo cáo hoạt động của tổ chức — chỉ Organization Manager xem được"
      />
      <section className="organization-report-layout">
        {report.length === 0 && <EmptyState icon={BarChart3} title="Tổ chức chưa có phòng thi nào" />}

        <div className="organization-report-grid">
          {report.map((row) => (
            <Card key={row.competitionId} className="organization-report-card">
              <strong>{row.title}</strong>
              <div style={{ fontSize: "var(--font-size-small)", opacity: 0.7 }}>Trạng thái: {row.status}</div>
              <div style={{ display: "flex", gap: "var(--space-4)", marginTop: "var(--space-2)", fontSize: "var(--font-size-small)" }}>
                <span>{row.participantCount} người tham gia</span>
                <span>{row.submissionCount} lượt trả lời</span>
                <span>{row.correctSubmissionCount} câu đúng</span>
              </div>
            </Card>
          ))}
        </div>
      </section>
    </main>
  );
}
