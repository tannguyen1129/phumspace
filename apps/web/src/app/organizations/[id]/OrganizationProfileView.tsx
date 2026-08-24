"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { AlertTriangle, ArrowRight, Download, Palette, Trash2, Users } from "lucide-react";
import {
  addOrganizationMember,
  ApiError,
  exportOrganizationData,
  fetchMe,
  getOrganization,
  listOrganizationMembers,
  removeOrganizationMember,
  updateOrganizationBranding,
  type Organization,
  type OrganizationMember,
  type PublicUser,
} from "../../../lib/api-client";
import { PageHeader } from "../../../components/ui/PageHeader";
import { Card } from "../../../components/ui/Card";
import { Badge } from "../../../components/ui/Badge";
import { Button } from "../../../components/ui/Button";
import { IconButton } from "../../../components/ui/IconButton";

const STATUS_LABELS: Record<string, string> = {
  PENDING_APPROVAL: "Đang chờ duyệt",
  ACTIVE: "Đang hoạt động",
  SUSPENDED: "Tạm ngưng",
  REJECTED: "Đã từ chối",
};

const STATUS_VARIANT: Record<string, "neutral" | "success" | "warning" | "danger"> = {
  PENDING_APPROVAL: "warning",
  ACTIVE: "success",
  SUSPENDED: "neutral",
  REJECTED: "danger",
};

const ORG_TYPE_LABELS: Record<string, string> = {
  PAGODA: "Chùa",
  SCHOOL: "Trường học",
  CLUB: "Câu lạc bộ",
  MUSEUM: "Bảo tàng",
  AGENCY: "Cơ quan",
  PROJECT_TEAM: "Đội dự án",
};

/**
 * Ho so to chuc (FR-ORG-001/002/005/006). Phan quan ly thanh vien/branding/export chi hien khi
 * fetch members thanh cong (tuc nguoi dung la Manager) — API tu 403 neu khong phai, khong can
 * kiem tra rieng o client.
 */
export function OrganizationProfileView({ organizationId }: { organizationId: string }) {
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [members, setMembers] = useState<OrganizationMember[] | null>(null);
  const [me, setMe] = useState<PublicUser | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    refresh();
    fetchMe()
      .then(setMe)
      .catch(() => undefined);
  }, [organizationId]);

  function refresh() {
    setLoading(true);
    getOrganization(organizationId)
      .then(setOrganization)
      .catch((err) => setError(err instanceof ApiError ? err.message : "Không tải được tổ chức."))
      .finally(() => setLoading(false));
    listOrganizationMembers(organizationId)
      .then(setMembers)
      .catch(() => setMembers(null));
  }

  if (loading) {
    return (
      <main style={{ padding: "var(--content-padding-mobile)" }}>
        <p>Đang tải...</p>
      </main>
    );
  }

  if (error || !organization) {
    return (
      <main>
        <PageHeader backHref="/" title="Không tìm thấy tổ chức" />
        <p style={{ padding: "0 var(--content-padding-mobile)", color: "#b3413a" }}>{error}</p>
      </main>
    );
  }

  const isManager = members !== null;

  return (
    <main className="app-page detail-page organization-page" style={{ paddingBottom: "var(--space-6)" }}>
      <PageHeader
        title={organization.name}
        actions={organization.brandColor ? <span aria-hidden="true" style={{ width: 20, height: 20, borderRadius: "50%", background: organization.brandColor }} /> : undefined}
      />
      <section className="organization-profile-layout">
        <div style={{ display: "flex", gap: "var(--space-2)", alignItems: "center", marginBottom: "var(--space-3)" }}>
          <Badge>{ORG_TYPE_LABELS[organization.orgType] ?? organization.orgType}</Badge>
          <Badge variant={STATUS_VARIANT[organization.status] ?? "neutral"}>
            {STATUS_LABELS[organization.status] ?? organization.status}
          </Badge>
        </div>

        {organization.status === "PENDING_APPROVAL" && (
          <p style={{ fontSize: "var(--font-size-small)", color: "var(--color-saffron-accent)", display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
            <AlertTriangle size={16} aria-hidden="true" /> Yêu cầu tạo tổ chức đang chờ quản trị viên duyệt — chưa thể tạo
            phòng thi/sự kiện cho đến khi được duyệt.
          </p>
        )}
        {organization.status === "REJECTED" && (
          <p style={{ fontSize: "var(--font-size-small)", color: "#b3413a" }}>Yêu cầu này đã bị từ chối.</p>
        )}

        {isManager && organization.status === "ACTIVE" && (
          <Link
            href={`/organizations/${organization.id}/report`}
            style={{ display: "inline-flex", alignItems: "center", gap: "var(--space-1)", fontSize: "var(--font-size-small)", fontWeight: 600 }}
          >
            Xem báo cáo hoạt động <ArrowRight size={14} aria-hidden="true" />
          </Link>
        )}

        {isManager && members && (
          <MemberManagement organizationId={organization.id} members={members} currentUserId={me?.id} onChanged={refresh} />
        )}

        {isManager && <BrandingForm organizationId={organization.id} brandColor={organization.brandColor} onChanged={refresh} />}

        {isManager && organization.status === "ACTIVE" && <ExportButton organizationId={organization.id} />}
      </section>
    </main>
  );
}

function MemberManagement({
  organizationId,
  members,
  currentUserId,
  onChanged,
}: {
  organizationId: string;
  members: OrganizationMember[];
  currentUserId?: string;
  onChanged: () => void;
}) {
  const [newUserId, setNewUserId] = useState("");
  const [newRole, setNewRole] = useState<"MANAGER" | "MEMBER">("MEMBER");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleAdd(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await addOrganizationMember(organizationId, { userId: newUserId, role: newRole });
      setNewUserId("");
      onChanged();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Không thêm được thành viên.");
    } finally {
      setBusy(false);
    }
  }

  async function handleRemove(userId: string) {
    setError(null);
    try {
      await removeOrganizationMember(organizationId, userId);
      onChanged();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Không gỡ được thành viên.");
    }
  }

  return (
    <section style={{ marginTop: "var(--space-5)" }}>
      <h2 style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
        <Users size={18} aria-hidden="true" /> Thành viên
      </h2>
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
        {members.map((member) => (
          <Card key={member.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "var(--space-3)" }}>
            <span>
              {member.displayName} <span style={{ fontSize: "var(--font-size-caption)", opacity: 0.7 }}>({member.role})</span>
            </span>
            {member.userId !== currentUserId && (
              <IconButton icon={Trash2} label="Gỡ thành viên" onClick={() => handleRemove(member.userId)} />
            )}
          </Card>
        ))}
      </div>

      <form onSubmit={handleAdd} style={{ display: "flex", gap: "var(--space-2)", marginTop: "var(--space-3)", flexWrap: "wrap" }}>
        <input
          value={newUserId}
          onChange={(event) => setNewUserId(event.target.value)}
          placeholder="userId (UUID) người cần thêm"
          required
          className="ps-input"
          style={{ flex: 1, minWidth: 200 }}
        />
        <select value={newRole} onChange={(event) => setNewRole(event.target.value as "MANAGER" | "MEMBER")} className="ps-select" style={{ width: "auto" }}>
          <option value="MEMBER">Thành viên</option>
          <option value="MANAGER">Quản lý</option>
        </select>
        <Button type="submit" variant="secondary" disabled={busy}>
          Thêm
        </Button>
      </form>
      {error && <p style={{ color: "#b3413a", fontSize: "var(--font-size-small)" }}>{error}</p>}
    </section>
  );
}

function BrandingForm({
  organizationId,
  brandColor,
  onChanged,
}: {
  organizationId: string;
  brandColor: string | null;
  onChanged: () => void;
}) {
  const [color, setColor] = useState(brandColor ?? "#5A2433");
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    try {
      await updateOrganizationBranding(organizationId, color);
      onChanged();
    } catch {
      // giu nguyen gia tri de nguoi dung thu lai
    } finally {
      setSaving(false);
    }
  }

  return (
    <section style={{ marginTop: "var(--space-5)" }}>
      <h2 style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
        <Palette size={18} aria-hidden="true" /> Màu thương hiệu
      </h2>
      <p style={{ fontSize: "var(--font-size-small)", opacity: 0.7 }}>
        Chỉ đổi màu viền tên tổ chức — không che khuất nguồn hay nhãn xác minh của PhumData.
      </p>
      <div style={{ display: "flex", gap: "var(--space-2)", alignItems: "center" }}>
        <input type="color" value={color} onChange={(event) => setColor(event.target.value)} />
        <Button variant="secondary" onClick={handleSave} disabled={saving}>
          {saving ? "Đang lưu..." : "Lưu"}
        </Button>
      </div>
    </section>
  );
}

function ExportButton({ organizationId }: { organizationId: string }) {
  const [exporting, setExporting] = useState(false);

  async function handleExport() {
    setExporting(true);
    try {
      const data = await exportOrganizationData(organizationId);
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "phumspace-to-chuc-du-lieu.json";
      link.click();
      URL.revokeObjectURL(url);
    } catch {
      // bo qua — nguoi dung co the thu lai
    } finally {
      setExporting(false);
    }
  }

  return (
    <section style={{ marginTop: "var(--space-5)" }}>
      <h2 style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
        <Download size={18} aria-hidden="true" /> Xuất dữ liệu
      </h2>
      <Button variant="secondary" onClick={handleExport} disabled={exporting}>
        {exporting ? "Đang xuất..." : "Xuất kết quả & danh sách thành viên"}
      </Button>
    </section>
  );
}
