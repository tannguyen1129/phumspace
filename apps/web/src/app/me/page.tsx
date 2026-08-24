"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  ArrowRight,
  Bell,
  BellRing,
  Bookmark,
  ClipboardCheck,
  Download,
  FileArchive,
  History,
  Loader2,
  LogOut,
  ScanLine,
  Settings,
  ShieldCheck,
  Trash2,
  User,
  UserRound,
} from "lucide-react";
import {
  ApiError,
  cancelPrivacyRequest,
  createPrivacyRequest,
  disableMfa,
  deleteScanHistoryItem,
  exportPersonalData,
  enableMfa,
  fetchMe,
  listMyNotifications,
  listPrivacyRequests,
  listScanHistory,
  listSaved,
  logout,
  markNotificationRead,
  resendVerification,
  setupMfa,
  unsaveEntity,
  unsaveTerm,
  updatePreferences,
  type AppNotification,
  type PublicUser,
  type PrivacyRequest,
  type SavedItem,
  type ScanHistoryItem,
} from "../../lib/api-client";
import {
  listDownloads,
  getOfflineStorageEstimate,
  requestPersistentOfflineStorage,
  removeDownload,
  type OfflineDownloadEntry,
} from "../../lib/offline-downloads";
import { BottomNav } from "../../components/BottomNav";
import {
  Badge,
  Button,
  Card,
  CardSkeleton,
  FeedbackState,
  PageHeader,
  SearchBar,
  Toast,
} from "../../components/ui";
type Tab =
  | "saved"
  | "history"
  | "downloads"
  | "notifications"
  | "preferences"
  | "account";
const TABS = [
  { id: "saved", label: "Đã lưu", icon: Bookmark },
  { id: "history", label: "Lịch sử quét", icon: History },
  { id: "downloads", label: "Offline", icon: Download },
  { id: "notifications", label: "Thông báo", icon: Bell },
  { id: "preferences", label: "Tùy chọn", icon: Settings },
  { id: "account", label: "Tài khoản", icon: UserRound },
] as const;
export default function MePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<PublicUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();
  const [tab, setTab] = useState<Tab>("saved");
  useEffect(() => {
    const requested = new URLSearchParams(window.location.search).get(
      "tab",
    ) as Tab | null;
    if (requested && TABS.some((item) => item.id === requested))
      setTab(requested);
    fetchMe()
      .then(setProfile)
      .catch((err) =>
        setError(
          err instanceof ApiError ? err.message : "Không tải được hồ sơ.",
        ),
      )
      .finally(() => setLoading(false));
  }, []);
  function changeTab(value: Tab) {
    setTab(value);
    window.history.replaceState(null, "", `/me?tab=${value}`);
  }
  async function signOut() {
    await logout();
    router.push("/welcome");
  }
  return (
    <main className="app-page me-page" style={{ paddingBottom: 88 }}>
      <PageHeader
        eyebrow="Không gian cá nhân"
        title={profile ? `Xin chào, ${profile.displayName}` : "Tôi"}
        subtitle="Nội dung riêng tư, tùy chọn và quyền dữ liệu của bạn."
        actions={
          profile && (
            <Badge variant="verified">
              <ShieldCheck size={12} />
              {profile.role}
            </Badge>
          )
        }
      />
      <section className="me-layout">
        <aside className="me-sidebar">
          <div className="me-identity">
            <span>
              <User size={22} />
            </span>
            <div>
              <strong>{profile?.displayName ?? "Tài khoản PhumSpace"}</strong>
              <small>{profile?.email ?? "Đang tải hồ sơ…"}</small>
            </div>
          </div>
          <nav aria-label="Khu vực cá nhân">
            {TABS.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  aria-current={tab === item.id ? "page" : undefined}
                  onClick={() => changeTab(item.id)}
                >
                  <Icon size={17} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
          <div className="me-sidebar__links">
            <Link href="/contribute">
              Đóng góp của tôi <ArrowRight size={13} />
            </Link>
            <Link href="/organizations/new">
              Đăng ký tổ chức <ArrowRight size={13} />
            </Link>
            {profile?.role === "SYSTEM_ADMIN" && (
              <Link href="/admin/organizations">
                <ClipboardCheck size={13} /> Duyệt tổ chức
              </Link>
            )}
          </div>
        </aside>
        <div className="me-content">
          {loading ? (
            <>
              <CardSkeleton lines={4} />
              <CardSkeleton lines={3} />
            </>
          ) : error ? (
            <FeedbackState
              title="Không mở được khu vực cá nhân"
              description={error}
            />
          ) : (
            <>
              {tab === "saved" && <SavedTab />}
              {tab === "history" && <HistoryTab />}
              {tab === "downloads" && <DownloadsTab />}
              {tab === "notifications" && <NotificationsTab />}
              {tab === "preferences" && profile && (
                <PreferencesTab profile={profile} onUpdated={setProfile} />
              )}{" "}
              {tab === "account" && profile && (
                <AccountTab profile={profile} onLoggedOut={signOut} />
              )}
            </>
          )}
        </div>
      </section>
      <BottomNav />
    </main>
  );
}
function SectionTitle({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <header className="me-section-title">
      <small>{eyebrow}</small>
      <h2>{title}</h2>
      <p>{description}</p>
    </header>
  );
}
function SavedTab() {
  const [items, setItems] = useState<SavedItem[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();
  const [busy, setBusy] = useState<string>();
  function load() {
    setLoading(true);
    setError(undefined);
    listSaved()
      .then(setItems)
      .catch((err) =>
        setError(
          err instanceof ApiError
            ? err.message
            : "Không tải được nội dung đã lưu.",
        ),
      )
      .finally(() => setLoading(false));
  }
  useEffect(load, []);
  async function remove(item: SavedItem) {
    setBusy(item.id);
    try {
      if (item.entityId) await unsaveEntity(item.entityId);
      else if (item.termId) await unsaveTerm(item.termId);
      setItems((old) => old.filter((value) => value.id !== item.id));
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Không bỏ lưu được nội dung.",
      );
    } finally {
      setBusy(undefined);
    }
  }
  const filtered = useMemo(
    () =>
      items.filter((item) =>
        `${item.title} ${item.subtitle ?? ""}`
          .toLowerCase()
          .includes(query.toLowerCase()),
      ),
    [items, query],
  );
  return (
    <section>
      <SectionTitle
        eyebrow="BỘ SƯU TẬP"
        title="Nội dung đã lưu"
        description="Địa điểm và từ vựng bạn muốn quay lại sau."
      />
      <SearchBar
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onClear={() => setQuery("")}
        placeholder="Tìm trong nội dung đã lưu"
      />
      {loading ? (
        <ListLoading />
      ) : error ? (
        <FeedbackState
          title="Không tải được bộ sưu tập"
          description={error}
          action={<Button onClick={load}>Thử lại</Button>}
        />
      ) : !filtered.length ? (
        <PersonalEmpty
          icon={Bookmark}
          title={query ? "Không có kết quả phù hợp" : "Chưa có nội dung đã lưu"}
          description={
            query
              ? "Thử từ khóa ngắn hơn."
              : "Bấm Lưu tại địa điểm hoặc từ vựng để xem lại ở đây."
          }
        />
      ) : (
        <div className="personal-list">
          {filtered.map((item) => (
            <Card key={item.id} className="personal-item">
              <span className="personal-item__icon">
                <Bookmark size={18} />
              </span>
              <Link
                href={
                  item.itemType === "ENTITY"
                    ? `/places/${item.entityId}`
                    : `/handbook/${item.termId}`
                }
              >
                <strong>{item.title}</strong>
                <small>
                  {item.subtitle ??
                    (item.itemType === "ENTITY" ? "Địa điểm" : "Từ vựng")}
                </small>
              </Link>
              <Button
                variant="ghost"
                disabled={busy === item.id}
                onClick={() => remove(item)}
              >
                {busy === item.id ? (
                  <Loader2 className="ps-spin" size={15} />
                ) : (
                  <Trash2 size={15} />
                )}
                <span className="action-label">Bỏ lưu</span>
              </Button>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}
function HistoryTab() {
  const [items, setItems] = useState<ScanHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();
  const [busy, setBusy] = useState<string>();
  function load() {
    setLoading(true);
    setError(undefined);
    listScanHistory()
      .then(setItems)
      .catch((err) =>
        setError(
          err instanceof ApiError
            ? err.message
            : "Không tải được lịch sử quét.",
        ),
      )
      .finally(() => setLoading(false));
  }
  useEffect(load, []);
  async function remove(id: string) {
    setBusy(id);
    try {
      await deleteScanHistoryItem(id);
      setItems((old) => old.filter((item) => item.id !== id));
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Không xóa được lượt quét.",
      );
    } finally {
      setBusy(undefined);
    }
  }
  return (
    <section>
      <SectionTitle
        eyebrow="RIÊNG TƯ"
        title="Lịch sử quét"
        description="Chỉ bạn xem được. Bạn có thể xóa từng mục bất cứ lúc nào."
      />
      {loading ? (
        <ListLoading />
      ) : error ? (
        <FeedbackState
          title="Không tải được lịch sử"
          description={error}
          action={<Button onClick={load}>Thử lại</Button>}
        />
      ) : !items.length ? (
        <PersonalEmpty
          icon={ScanLine}
          title="Chưa có lượt quét"
          description="Kết quả từ Cultural Scanner sẽ xuất hiện tại đây."
          action="/scan"
          actionLabel="Mở Scanner"
        />
      ) : (
        <div className="personal-grid">
          {items.map((item) => (
            <Card key={item.id} className="scan-history-card">
              <img src={item.imageUrl} alt="Ảnh đã quét" />
              <div>
                <Badge
                  variant={item.status === "COMPLETED" ? "success" : "neutral"}
                >
                  {item.status === "COMPLETED" ? "Đã phân tích" : item.status}
                </Badge>
                <h3>{item.result?.synthesis.title ?? "Kết quả đang xử lý"}</h3>
                <small>
                  {new Date(item.createdAt).toLocaleString("vi-VN")}
                </small>
              </div>
              <Button
                variant="ghost"
                disabled={busy === item.id}
                onClick={() => remove(item.id)}
                aria-label="Xóa lượt quét"
              >
                <Trash2 size={16} />
              </Button>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}
function DownloadsTab() {
  const [items, setItems] = useState<OfflineDownloadEntry[]>([]);
  const [storage,setStorage]=useState<{usage:number;quota:number;persisted:boolean}>();
  const [error, setError] = useState<string>();
  useEffect(() => {setItems(listDownloads());getOfflineStorageEstimate().then(setStorage).catch(()=>undefined)}, []);
  async function remove(id: string) {
    try {
      await removeDownload(id);
      setItems(listDownloads());
    } catch {
      setError("Không xóa được gói offline.");
    }
  }
  const bytes = items.reduce((sum, item) => sum + item.approxBytes, 0);
  return (
    <section>
      <SectionTitle
        eyebrow="DÙNG KHI MẤT MẠNG"
        title="Nội dung offline"
        description={`${items.length} gói · ${formatBytes(bytes)} đang được lưu trên thiết bị này.`}
      />
      {storage&&<Card><strong>Dung lượng trình duyệt</strong><p>{formatBytes(storage.usage)} / {formatBytes(storage.quota)} · {storage.persisted?"Đã bảo vệ khỏi dọn tự động":"Có thể bị trình duyệt dọn khi thiếu chỗ"}</p>{!storage.persisted&&<Button variant="secondary" onClick={async()=>{await requestPersistentOfflineStorage();setStorage(await getOfflineStorageEstimate())}}>Giữ nội dung lâu dài</Button>}</Card>}
      {error && (
        <Toast kind="error" onDismiss={() => setError(undefined)}>
          {error}
        </Toast>
      )}
      {!items.length ? (
        <PersonalEmpty
          icon={FileArchive}
          title="Chưa có nội dung offline"
          description="Tải địa điểm hoặc từ vựng để sử dụng khi kết nối không ổn định."
          action="/"
          actionLabel="Khám phá nội dung"
        />
      ) : (
        <div className="personal-list">
          {items.map((item) => (
            <Card key={item.id} className="personal-item">
              <span className="personal-item__icon">
                <Download size={18} />
              </span>
              <div>
                <strong>{item.title}</strong>
                <small>
                  {formatBytes(item.approxBytes)} ·{" "}
                  {new Date(item.downloadedAt).toLocaleDateString("vi-VN")}
                </small>
              </div>
              <Button variant="ghost" onClick={() => remove(item.id)}>
                <Trash2 size={15} />
                <span className="action-label">Xóa</span>
              </Button>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}
function NotificationsTab() {
  const [items, setItems] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();
  function load() {
    setLoading(true);
    setError(undefined);
    listMyNotifications()
      .then(setItems)
      .catch((err) =>
        setError(
          err instanceof ApiError ? err.message : "Không tải được thông báo.",
        ),
      )
      .finally(() => setLoading(false));
  }
  useEffect(load, []);
  async function read(id: string) {
    try {
      await markNotificationRead(id);
      setItems((old) =>
        old.map((item) =>
          item.id === id ? { ...item, readAt: new Date().toISOString() } : item,
        ),
      );
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Không cập nhật được thông báo.",
      );
    }
  }
  const unread = items.filter((item) => !item.readAt).length;
  return (
    <section>
      <SectionTitle
        eyebrow="THEO DÕI"
        title="Thông báo"
        description={`${unread} chưa đọc · Chỉ gồm cập nhật từ lễ hội và đội ghe bạn theo dõi.`}
      />
      {loading ? (
        <ListLoading />
      ) : error ? (
        <FeedbackState
          title="Không tải được thông báo"
          description={error}
          action={<Button onClick={load}>Thử lại</Button>}
        />
      ) : !items.length ? (
        <PersonalEmpty
          icon={Bell}
          title="Chưa có thông báo"
          description="Theo dõi lễ hội hoặc đội ghe để nhận cập nhật tại đây."
          action="/festivals"
          actionLabel="Khám phá lễ hội"
        />
      ) : (
        <div className="notification-list">
          {items.map((item) => (
            <Card
              key={item.id}
              className={`notification-item${item.readAt ? " notification-item--read" : ""}`}
            >
              <span>
                {item.priority === "URGENT" ? (
                  <AlertTriangle size={19} />
                ) : (
                  <Bell size={19} />
                )}
              </span>
              <div>
                <div>
                  {!item.readAt && <i />}
                  <strong>{item.title}</strong>
                </div>
                <p>{item.body}</p>
                <small>
                  {new Date(item.createdAt).toLocaleString("vi-VN")}
                </small>
              </div>
              {!item.readAt && (
                <Button variant="ghost" onClick={() => read(item.id)}>
                  <BellRing size={15} />
                  <span className="action-label">Đã đọc</span>
                </Button>
              )}
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}
function PreferencesTab({
  profile,
  onUpdated,
}: {
  profile: PublicUser;
  onUpdated: (value: PublicUser) => void;
}) {
  const [displayName, setDisplayName] = useState(profile.displayName);
  const [language, setLanguage] = useState(profile.preferredLanguage ?? "vi");
  const [interests, setInterests] = useState(
    (profile.interests ?? []).join(", "),
  );
  const [motion, setMotion] = useState(
    Boolean(profile.accessibilityPreferences?.reducedMotion),
  );
  const [large, setLarge] = useState(
    Boolean(profile.accessibilityPreferences?.largeText),
  );
  const [emailNotifications, setEmailNotifications] = useState(
    profile.notificationPreferences?.email ?? true,
  );
  const [festivalUpdates, setFestivalUpdates] = useState(
    profile.notificationPreferences?.festivalUpdates ?? true,
  );
  const [securityAlerts, setSecurityAlerts] = useState(
    profile.notificationPreferences?.securityAlerts ?? true,
  );
  const [resending, setResending] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{
    kind: "success" | "error";
    text: string;
  }>();
  async function save() {
    setBusy(true);
    setMessage(undefined);
    try {
      const value = await updatePreferences({
        displayName: displayName.trim(),
        preferredLanguage: language,
        interests: interests
          .split(",")
          .map((v) => v.trim())
          .filter(Boolean),
        accessibilityPreferences: { reducedMotion: motion, largeText: large },
        notificationPreferences: {
          inApp: true,
          email: emailNotifications,
          festivalUpdates,
          securityAlerts,
        },
      });
      onUpdated(value);
      document.documentElement.setAttribute(
        "data-reduced-motion",
        String(motion),
      );
      document.documentElement.setAttribute("data-large-text", String(large));
      setMessage({ kind: "success", text: "Đã lưu tùy chọn trên tài khoản." });
    } catch (err) {
      setMessage({
        kind: "error",
        text:
          err instanceof ApiError ? err.message : "Không lưu được tùy chọn.",
      });
    } finally {
      setBusy(false);
    }
  }
  async function resend() {
    setResending(true);
    setMessage(undefined);
    try {
      await resendVerification();
      setMessage({ kind: "success", text: "Đã gửi lại email xác minh." });
    } catch (err) {
      setMessage({
        kind: "error",
        text:
          err instanceof ApiError
            ? err.message
            : "Không gửi lại được email xác minh.",
      });
    } finally {
      setResending(false);
    }
  }
  return (
    <section>
      <SectionTitle
        eyebrow="CÁ NHÂN HÓA"
        title="Trải nghiệm của bạn"
        description="Điều chỉnh ngôn ngữ, chủ đề quan tâm và khả năng tiếp cận."
      />
      <Card className="preferences-card">
        <label className="ps-field">
          <span className="ps-field-label">Tên hiển thị</span>
          <input
            className="ps-input"
            minLength={1}
            maxLength={120}
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
          />
        </label>
        <div className="email-verification-row">
          <div>
            <strong>
              {profile.emailVerifiedAt
                ? "Email đã xác minh"
                : "Email chưa xác minh"}
            </strong>
            <small>{profile.email}</small>
          </div>
          {!profile.emailVerifiedAt && (
            <Button variant="secondary" disabled={resending} onClick={resend}>
              {resending ? (
                <Loader2 className="ps-spin" size={15} />
              ) : (
                <ShieldCheck size={15} />
              )}{" "}
              Gửi lại
            </Button>
          )}
        </div>
        <label className="ps-field">
          <span className="ps-field-label">Ngôn ngữ giao diện</span>
          <select
            className="ps-select"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
          >
            <option value="vi">Tiếng Việt</option>
            <option value="en">English</option>
          </select>
        </label>
        <label className="ps-field">
          <span className="ps-field-label">Chủ đề quan tâm</span>
          <input
            className="ps-input"
            value={interests}
            onChange={(e) => setInterests(e.target.value)}
            placeholder="lễ hội, ẩm thực, chùa…"
          />
          <small className="field-help">
            Phân cách mỗi chủ đề bằng dấu phẩy.
          </small>
        </label>
        <div className="preference-toggles">
          <Toggle
            checked={motion}
            onChange={setMotion}
            title="Giảm chuyển động"
            text="Hạn chế animation và hiệu ứng dịch chuyển."
          />
          <Toggle
            checked={large}
            onChange={setLarge}
            title="Cỡ chữ lớn"
            text="Tăng kích thước chữ trên toàn bộ ứng dụng."
          />
          <Toggle
            checked={emailNotifications}
            onChange={setEmailNotifications}
            title="Thông báo qua email"
            text="Nhận các cập nhật bạn đã chủ động theo dõi."
          />
          <Toggle
            checked={festivalUpdates}
            onChange={setFestivalUpdates}
            title="Cập nhật lễ hội"
            text="Nhận thay đổi lịch và cảnh báo từ lễ hội đã theo dõi."
          />
          <Toggle
            checked={securityAlerts}
            onChange={setSecurityAlerts}
            title="Cảnh báo bảo mật"
            text="Khuyến nghị cho đăng nhập và thay đổi tài khoản."
          />
        </div>
        {message && <Toast kind={message.kind}>{message.text}</Toast>}
        <Button onClick={save} disabled={busy}>
          {busy ? (
            <Loader2 className="ps-spin" size={16} />
          ) : (
            <Settings size={16} />
          )}{" "}
          Lưu thay đổi
        </Button>
      </Card>
    </section>
  );
}
function Toggle({
  checked,
  onChange,
  title,
  text,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  title: string;
  text: string;
}) {
  return (
    <label>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span>
        <strong>{title}</strong>
        <small>{text}</small>
      </span>
    </label>
  );
}
function AccountTab({
  profile,
  onLoggedOut,
}: {
  profile: PublicUser;
  onLoggedOut: () => void;
}) {
  const [requests, setRequests] = useState<PrivacyRequest[]>([]);
  const [exporting, setExporting] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [phrase, setPhrase] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string>();
  const [mfaEnabled, setMfaEnabled] = useState(profile.mfaEnabled);
  const [mfaSetup, setMfaSetup] = useState<{
    secret: string;
    provisioningUri: string;
  }>();
  const [mfaCode, setMfaCode] = useState("");
  const [mfaBusy, setMfaBusy] = useState(false);
  useEffect(() => {
    listPrivacyRequests()
      .then(setRequests)
      .catch(() => undefined);
  }, []);
  async function exportData() {
    setExporting(true);
    setError(undefined);
    try {
      const request = await createPrivacyRequest("EXPORT");
      const data = request.resultPayload ?? (await exportPersonalData());
      setRequests((old) => [
        request,
        ...old.filter((item) => item.id !== request.id),
      ]);
      const url = URL.createObjectURL(
        new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }),
      );
      const link = document.createElement("a");
      link.href = url;
      link.download = "phumspace-du-lieu-ca-nhan.json";
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Không xuất được dữ liệu.",
      );
    } finally {
      setExporting(false);
    }
  }
  async function remove() {
    if (phrase !== "XÓA TÀI KHOẢN") return;
    setDeleting(true);
    try {
      const request = await createPrivacyRequest("DELETE");
      setRequests((old) => [
        request,
        ...old.filter((item) => item.id !== request.id),
      ]);
      setConfirm(false);
      setPhrase("");
      setDeleting(false);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Không xóa được tài khoản.",
      );
      setDeleting(false);
    }
  }
  async function cancelRequest(id: string) {
    try {
      await cancelPrivacyRequest(id);
      setRequests((old) =>
        old.map((item) =>
          item.id === id ? { ...item, status: "CANCELLED" } : item,
        ),
      );
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Không hủy được yêu cầu.",
      );
    }
  }
  async function startMfa() {
    setMfaBusy(true);
    setError(undefined);
    try {
      setMfaSetup(await setupMfa());
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Không khởi tạo được MFA.",
      );
    } finally {
      setMfaBusy(false);
    }
  }
  async function confirmMfa() {
    setMfaBusy(true);
    setError(undefined);
    try {
      await enableMfa(mfaCode);
      setMfaEnabled(true);
      setMfaSetup(undefined);
      setMfaCode("");
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Mã xác thực không đúng.",
      );
    } finally {
      setMfaBusy(false);
    }
  }
  async function turnOffMfa() {
    setMfaBusy(true);
    setError(undefined);
    try {
      await disableMfa(mfaCode);
      setMfaEnabled(false);
      setMfaCode("");
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Mã xác thực không đúng.",
      );
    } finally {
      setMfaBusy(false);
    }
  }
  return (
    <section>
      <SectionTitle
        eyebrow="QUYỀN DỮ LIỆU"
        title="Tài khoản"
        description="Xuất dữ liệu, đăng xuất hoặc yêu cầu xóa tài khoản."
      />
      <div className="account-actions">
        <Card>
          <ShieldCheck size={22} />
          <h3>Xác thực hai bước</h3>
          <p>
            {mfaEnabled
              ? "MFA đang bảo vệ tài khoản. Tắt MFA sẽ thu hồi mọi phiên đăng nhập khác."
              : "Dùng ứng dụng xác thực để tạo mã 6 số khi đăng nhập."}
          </p>
          {!mfaEnabled && !mfaSetup && (
            <Button variant="secondary" disabled={mfaBusy} onClick={startMfa}>
              Thiết lập MFA
            </Button>
          )}
          {mfaSetup && (
            <div className="mfa-setup">
              <small>Khóa thiết lập</small>
              <code>{mfaSetup.secret}</code>
              <a href={mfaSetup.provisioningUri}>Mở trong ứng dụng xác thực</a>
              <label className="ps-field">
                <span className="ps-field-label">Mã 6 số để xác nhận</span>
                <input
                  className="ps-input"
                  inputMode="numeric"
                  maxLength={6}
                  value={mfaCode}
                  onChange={(e) =>
                    setMfaCode(e.target.value.replace(/\D/g, ""))
                  }
                />
              </label>
              <Button
                disabled={mfaBusy || mfaCode.length !== 6}
                onClick={confirmMfa}
              >
                Bật MFA
              </Button>
            </div>
          )}
          {mfaEnabled && (
            <div className="mfa-setup">
              <label className="ps-field">
                <span className="ps-field-label">Mã hiện tại để tắt MFA</span>
                <input
                  className="ps-input"
                  inputMode="numeric"
                  maxLength={6}
                  value={mfaCode}
                  onChange={(e) =>
                    setMfaCode(e.target.value.replace(/\D/g, ""))
                  }
                />
              </label>
              <Button
                variant="danger"
                disabled={mfaBusy || mfaCode.length !== 6}
                onClick={turnOffMfa}
              >
                Tắt MFA
              </Button>
            </div>
          )}
        </Card>
        <Card>
          <Download size={22} />
          <h3>Xuất dữ liệu cá nhân</h3>
          <p>
            Tải hồ sơ, nội dung đã lưu, lịch sử quét và đóng góp dưới dạng JSON.
          </p>
          <Button variant="secondary" disabled={exporting} onClick={exportData}>
            {exporting ? (
              <Loader2 className="ps-spin" size={16} />
            ) : (
              <Download size={16} />
            )}{" "}
            Xuất dữ liệu
          </Button>
        </Card>
        <Card className="danger-zone">
          <AlertTriangle size={22} />
          <h3>Xóa tài khoản</h3>
          <p>
            Dữ liệu riêng tư sẽ bị xóa. Đóng góp đã công bố được giữ lại nhưng
            ẩn danh hóa.
          </p>
          {!confirm ? (
            <Button variant="danger" onClick={() => setConfirm(true)}>
              <Trash2 size={16} /> Bắt đầu xóa
            </Button>
          ) : (
            <div className="delete-confirm">
              <label className="ps-field">
                <span className="ps-field-label">
                  Nhập “XÓA TÀI KHOẢN” để xác nhận
                </span>
                <input
                  className="ps-input"
                  value={phrase}
                  onChange={(e) => setPhrase(e.target.value)}
                />
              </label>
              <div>
                <Button
                  variant="danger"
                  disabled={phrase !== "XÓA TÀI KHOẢN" || deleting}
                  onClick={remove}
                >
                  {deleting ? (
                    <Loader2 className="ps-spin" size={16} />
                  ) : (
                    <Trash2 size={16} />
                  )}{" "}
                  Xác nhận xóa
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => {
                    setConfirm(false);
                    setPhrase("");
                  }}
                >
                  Hủy
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
      {requests.length > 0 && (
        <Card className="privacy-requests">
          <h3>Yêu cầu quyền dữ liệu</h3>
          {requests.map((request) => (
            <div key={request.id}>
              <div>
                <strong>
                  {request.requestType === "EXPORT"
                    ? "Xuất dữ liệu"
                    : "Xóa tài khoản"}
                </strong>
                <small>
                  {request.status} · hạn xử lý{" "}
                  {new Date(request.dueAt).toLocaleDateString("vi-VN")}
                </small>
              </div>
              {request.status === "REQUESTED" && (
                <Button
                  variant="ghost"
                  onClick={() => cancelRequest(request.id)}
                >
                  Hủy yêu cầu
                </Button>
              )}
            </div>
          ))}
        </Card>
      )}
      {error && (
        <FeedbackState title="Thao tác chưa hoàn tất" description={error} />
      )}
      <Button
        className="logout-button"
        variant="secondary"
        onClick={onLoggedOut}
      >
        <LogOut size={16} /> Đăng xuất khỏi PhumSpace
      </Button>
    </section>
  );
}
function PersonalEmpty({
  icon: Icon,
  title,
  description,
  action,
  actionLabel,
}: {
  icon: typeof Bookmark;
  title: string;
  description: string;
  action?: string;
  actionLabel?: string;
}) {
  return (
    <div className="personal-empty">
      <Icon size={29} />
      <h3>{title}</h3>
      <p>{description}</p>
      {action && (
        <Link href={action} className="ps-btn ps-btn--secondary">
          {actionLabel}
          <ArrowRight size={15} />
        </Link>
      )}
    </div>
  );
}
function ListLoading() {
  return (
    <div className="personal-list">
      <CardSkeleton lines={2} />
      <CardSkeleton lines={2} />
      <CardSkeleton lines={2} />
    </div>
  );
}
function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}
