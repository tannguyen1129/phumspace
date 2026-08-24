"use client";
import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type RefObject,
} from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  Camera,
  CheckCircle2,
  Clock3,
  FileImage,
  History,
  Info,
  Loader2,
  MapPin,
  RotateCcw,
  ScanLine,
  ShieldCheck,
  Sparkles,
  UploadCloud,
} from "lucide-react";
import {
  ApiError,
  createScan,
  getScan,
  listPlaces,
  sendScanFeedback,
  type PlaceSummary,
  type ScanResult,
  type ScanStatus,
} from "../../lib/api-client";
import {
  listPendingScans,
  queuePendingScan,
  removePendingScan,
  type PendingScan,
} from "../../lib/offline-scan-queue";
import { DECISION_LABELS, NEXT_ACTION_LABELS } from "../../lib/scan-labels";
import { BottomNav } from "../../components/BottomNav";
import {
  Badge,
  Button,
  Card,
  FeedbackState,
  PageHeader,
} from "../../components/ui";

type Phase =
  | "capture"
  | "preview"
  | "uploading"
  | "processing"
  | "delayed"
  | "queued"
  | "done"
  | "error";
const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
const POLL_INTERVAL_MS = 1500;
const MAX_POLL_ATTEMPTS = 40;

export default function ScanPage() {
  const cameraRef = useRef<HTMLInputElement>(null);
  const libraryRef = useRef<HTMLInputElement>(null);
  const previewRef = useRef<string>();
  const [file, setFile] = useState<File>();
  const [previewUrl, setPreviewUrl] = useState<string>();
  const [phase, setPhase] = useState<Phase>("capture");
  const [status, setStatus] = useState<ScanStatus>();
  const [error, setError] = useState<string>();
  const [places, setPlaces] = useState<PlaceSummary[]>([]);
  const [placeId, setPlaceId] = useState("");
  const [pollStep, setPollStep] = useState(0);
  const [online, setOnline] = useState(true);
  const [qualityWarning, setQualityWarning] = useState<string>();
  const [pending, setPending] = useState<PendingScan[]>([]);

  useEffect(() => {
    const syncConnection = () => setOnline(navigator.onLine);
    listPlaces()
      .then(setPlaces)
      .catch(() => undefined);
    listPendingScans()
      .then(setPending)
      .catch(() => undefined);
    setPlaceId(
      new URLSearchParams(window.location.search).get("placeId") ?? "",
    );
    syncConnection();
    window.addEventListener("online", syncConnection);
    window.addEventListener("offline", syncConnection);
    return () => {
      window.removeEventListener("online", syncConnection);
      window.removeEventListener("offline", syncConnection);
      if (previewRef.current) URL.revokeObjectURL(previewRef.current);
    };
  }, []);

  async function chooseFile(event: ChangeEvent<HTMLInputElement>) {
    const selected = event.target.files?.[0];
    if (!selected) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(selected.type)) {
      setError("Ảnh phải ở định dạng JPEG, PNG hoặc WebP.");
      setPhase("error");
      return;
    }
    if (selected.size > MAX_IMAGE_BYTES) {
      setError("Ảnh lớn hơn 8 MB. Hãy chọn ảnh nhỏ hơn để tiếp tục.");
      setPhase("error");
      return;
    }
    try {
      const quality = await inspectImageQuality(selected);
      if (quality.blocking) {
        setError(quality.blocking);
        setPhase("error");
        return;
      }
      setQualityWarning(quality.warning);
    } catch {
      setError("Không đọc được ảnh. Hãy chọn một ảnh khác.");
      setPhase("error");
      return;
    }
    if (previewRef.current) URL.revokeObjectURL(previewRef.current);
    const url = URL.createObjectURL(selected);
    previewRef.current = url;
    setFile(selected);
    setPreviewUrl(url);
    setStatus(undefined);
    setError(undefined);
    setPhase("preview");
  }

  async function poll(scanId: string) {
    for (let attempt = 0; attempt < MAX_POLL_ATTEMPTS; attempt++) {
      setPollStep(attempt);
      const current = await getScan(scanId);
      setStatus(current);
      if (current.status === "COMPLETED") {
        if (!current.result) throw new Error("Kết quả quét chưa sẵn sàng.");
        setPhase("done");
        return;
      }
      if (current.status === "FAILED")
        throw new Error(
          current.errorMessage ?? "Hệ thống không thể xử lý ảnh này.",
        );
      await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
    }
    setPhase("delayed");
  }

  async function submit() {
    if (!file) return;
    setError(undefined);
    if (!navigator.onLine) {
      try {
        await queuePendingScan({
          blob: file,
          mimeType: file.type,
          placeId: placeId || undefined,
        });
        setPending(await listPendingScans());
        setPhase("queued");
      } catch {
        setError("Không lưu được ảnh vào hàng chờ trên thiết bị này.");
        setPhase("error");
      }
      return;
    }
    try {
      setPhase("uploading");
      const created = await createScan(file, placeId || undefined);
      setPhase("processing");
      await poll(created.id);
    } catch (err) {
      setError(
        err instanceof ApiError || err instanceof Error
          ? err.message
          : "Không thể hoàn tất yêu cầu quét.",
      );
      setPhase("error");
    }
  }

  function reset() {
    if (previewRef.current) URL.revokeObjectURL(previewRef.current);
    previewRef.current = undefined;
    setFile(undefined);
    setPreviewUrl(undefined);
    setStatus(undefined);
    setError(undefined);
    setQualityWarning(undefined);
    setPollStep(0);
    setPhase("capture");
    if (cameraRef.current) cameraRef.current.value = "";
    if (libraryRef.current) libraryRef.current.value = "";
  }
  async function sendPending(item: PendingScan) {
    await createScan(
      new File(
        [item.blob],
        `pending-scan.${item.mimeType.split("/")[1] ?? "jpg"}`,
        { type: item.mimeType },
      ),
      item.placeId,
    );
    await removePendingScan(item.id);
    setPending(await listPendingScans());
  }
  async function discardPending(id: string) {
    await removePendingScan(id);
    setPending(await listPendingScans());
  }

  return (
    <main className="app-page scanner-page with-primary-nav">
      <PageHeader
        eyebrow="AI Cultural Scanner"
        title="Quét để tìm hiểu"
        subtitle="PhumSpace quan sát hình ảnh, đối chiếu PhumData và luôn nói rõ khi chưa chắc chắn."
        actions={
          <Link href="/me" className="ps-btn ps-btn--secondary">
            <History size={17} /> Lịch sử
          </Link>
        }
      />
      <section className="scanner-layout">
        <div className="scanner-stage">
          {(phase === "capture" || phase === "preview") && (
            <CapturePanel
              phase={phase}
              previewUrl={previewUrl}
              qualityWarning={qualityWarning}
              cameraRef={cameraRef}
              libraryRef={libraryRef}
              onFile={chooseFile}
              onCamera={() => cameraRef.current?.click()}
              onLibrary={() => libraryRef.current?.click()}
              onReset={reset}
            />
          )}
          {(phase === "uploading" || phase === "processing") && (
            <ProcessingPanel
              phase={phase}
              previewUrl={previewUrl}
              step={pollStep}
            />
          )}
          {phase === "delayed" && (
            <FeedbackState
              title="Quá trình đối chiếu đang mất nhiều thời gian"
              description="Yêu cầu vẫn tiếp tục ở nền và không bị tạo trùng. Bạn có thể kiểm tra lại hoặc xem trong lịch sử."
              action={
                <>
                  <Button onClick={() => status && poll(status.id)}>
                    Kiểm tra lại
                  </Button>
                  <Link
                    href="/me?tab=history"
                    className="ps-btn ps-btn--secondary"
                  >
                    Mở lịch sử
                  </Link>
                </>
              }
            />
          )}
          {phase === "queued" && (
            <FeedbackState
              kind="offline"
              title="Đã lưu ảnh vào hàng chờ"
              description="Khi có mạng trở lại, PhumSpace sẽ tự gửi ảnh để phân tích. Bạn có thể tiếp tục dùng ứng dụng."
              action={
                <>
                  <Button onClick={reset}>Quét ảnh khác</Button>{" "}
                  <Link href="/me" className="ps-btn ps-btn--secondary">
                    Xem mục Tôi
                  </Link>
                </>
              }
            />
          )}
          {phase === "error" && (
            <FeedbackState
              title="Chưa hoàn tất lần quét"
              description={error ?? "Đã xảy ra lỗi không xác định."}
              action={
                <div className="scanner-error-actions">
                  {file && (
                    <Button onClick={submit}>
                      <UploadCloud size={16} /> Thử gửi lại
                    </Button>
                  )}
                  <Button variant="secondary" onClick={reset}>
                    <RotateCcw size={16} /> Chọn ảnh khác
                  </Button>
                </div>
              }
            />
          )}
          {phase === "done" && status?.result && (
            <ScanResultView
              scanId={status.id}
              result={status.result}
              onReset={reset}
            />
          )}
        </div>

        {(phase === "capture" || phase === "preview") && (
          <aside className="scanner-context">
            <Card>
              <span className="section-kicker">Bối cảnh tùy chọn</span>
              <h2>
                <MapPin size={19} /> Bạn đang ở đâu?
              </h2>
              <p>
                Chọn địa điểm chỉ khi bạn muốn dùng nó làm ngữ cảnh. PhumSpace
                không tự xin vị trí GPS.
              </p>
              <label className="ps-field">
                <span className="ps-field-label">Địa điểm hiện tại</span>
                <select
                  className="ps-select"
                  value={placeId}
                  onChange={(event) => setPlaceId(event.target.value)}
                >
                  <option value="">Không gửi địa điểm</option>
                  {places.map((place) => (
                    <option key={place.entityId} value={place.entityId}>
                      {place.preferredLabel}
                    </option>
                  ))}
                </select>
              </label>
            </Card>
            <Card className="scanner-privacy">
              <ShieldCheck size={20} />
              <div>
                <h3>Ảnh được xử lý có kiểm soát</h3>
                <p>
                  Metadata EXIF/GPS được loại bỏ trước khi lưu. Ảnh vẫn được giữ
                  trong lịch sử để bạn xem hoặc xóa.
                </p>
              </div>
            </Card>
            {phase === "preview" && (
              <Button
                variant="primary"
                onClick={submit}
                className="scanner-submit"
              >
                <ScanLine size={18} />{" "}
                {online ? "Phân tích ảnh này" : "Lưu để gửi khi có mạng"}
              </Button>
            )}
          </aside>
        )}
      </section>
      {pending.length > 0 && (
        <section className="scanner-pending">
          <Card>
            <span className="section-kicker">Hàng chờ trên thiết bị</span>
            <h2>{pending.length} ảnh chưa gửi</h2>
            <p>
              PhumSpace chỉ tải lên khi bạn chủ động xác nhận và đang có mạng.
            </p>
            {pending.map((item) => (
              <div key={item.id}>
                <span>{new Date(item.queuedAt).toLocaleString("vi-VN")}</span>
                <div>
                  <Button disabled={!online} onClick={() => sendPending(item)}>
                    <UploadCloud size={15} /> Gửi ngay
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => discardPending(item.id)}
                  >
                    Xóa
                  </Button>
                </div>
              </div>
            ))}
          </Card>
        </section>
      )}
      <BottomNav />
    </main>
  );
}

function CapturePanel({
  phase,
  previewUrl,
  qualityWarning,
  cameraRef,
  libraryRef,
  onFile,
  onCamera,
  onLibrary,
  onReset,
}: {
  phase: "capture" | "preview";
  previewUrl?: string;
  qualityWarning?: string;
  cameraRef: RefObject<HTMLInputElement>;
  libraryRef: RefObject<HTMLInputElement>;
  onFile: (event: ChangeEvent<HTMLInputElement>) => void;
  onCamera: () => void;
  onLibrary: () => void;
  onReset: () => void;
}) {
  return (
    <div className="scanner-capture">
      <input
        ref={cameraRef}
        aria-label="Chụp ảnh bằng camera"
        className="visually-hidden"
        type="file"
        accept="image/jpeg,image/png,image/webp"
        capture="environment"
        onChange={onFile}
      />
      <input
        ref={libraryRef}
        aria-label="Chọn ảnh từ thư viện"
        className="visually-hidden"
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={onFile}
      />
      <div
        className={`camera-viewport${previewUrl ? " camera-viewport--preview" : ""}`}
      >
        {previewUrl ? (
          <img src={previewUrl} alt="Ảnh chuẩn bị gửi để phân tích" />
        ) : (
          <>
            <div className="camera-guide" aria-hidden="true">
              <i />
              <i />
              <i />
              <i />
            </div>
            <ScanLine size={42} />
            <strong>Đặt đối tượng vào trong khung</strong>
            <span>
              Giữ máy ổn định, đủ sáng và tránh chụp khuôn mặt người khác.
            </span>
          </>
        )}
      </div>
      {phase === "capture" ? (
        <div className="capture-actions">
          <Button onClick={onCamera}>
            <Camera size={19} /> Chụp ảnh
          </Button>
          <Button variant="secondary" onClick={onLibrary}>
            <FileImage size={19} /> Chọn từ thư viện
          </Button>
        </div>
      ) : (
        <div className="capture-actions">
          <Button variant="secondary" onClick={onReset}>
            <RotateCcw size={17} /> Chọn lại
          </Button>
          <Button variant="ghost" onClick={onCamera}>
            <Camera size={17} /> Chụp ảnh khác
          </Button>
        </div>
      )}
      <p className="capture-note">
        <Info size={14} /> JPEG, PNG hoặc WebP · tối đa 8 MB
      </p>
      {qualityWarning && (
        <p className="capture-warning">
          <AlertTriangle size={15} />
          {qualityWarning} Bạn vẫn có thể gửi hoặc chụp lại để có kết quả tốt
          hơn.
        </p>
      )}
    </div>
  );
}

async function inspectImageQuality(
  file: File,
): Promise<{ blocking?: string; warning?: string }> {
  const bitmap = await createImageBitmap(file);
  if (bitmap.width < 320 || bitmap.height < 320) {
    bitmap.close();
    return { blocking: "Ảnh cần có chiều rộng và chiều cao tối thiểu 320 px." };
  }
  const canvas = document.createElement("canvas");
  canvas.width = 64;
  canvas.height = 64;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) {
    bitmap.close();
    return {};
  }
  context.drawImage(bitmap, 0, 0, 64, 64);
  bitmap.close();
  const data = context.getImageData(0, 0, 64, 64).data;
  let brightness = 0;
  let edge = 0;
  let previous = 0;
  for (let index = 0; index < data.length; index += 4) {
    const value = (data[index] + data[index + 1] + data[index + 2]) / 3;
    brightness += value;
    if (index > 0) edge += Math.abs(value - previous);
    previous = value;
  }
  const pixels = data.length / 4;
  const average = brightness / pixels;
  const edgeAverage = edge / pixels;
  if (average < 42) return { warning: "Ảnh có vẻ quá tối." };
  if (edgeAverage < 5) return { warning: "Ảnh có vẻ mờ hoặc thiếu chi tiết." };
  return {};
}

function ProcessingPanel({
  phase,
  previewUrl,
  step,
}: {
  phase: "uploading" | "processing";
  previewUrl?: string;
  step: number;
}) {
  const progress = phase === "uploading" ? 20 : Math.min(90, 38 + step * 4);
  return (
    <div className="scanner-processing">
      {previewUrl && <img src={previewUrl} alt="Ảnh đang được phân tích" />}
      <div className="processing-overlay">
        <Loader2 className="ps-spin" size={28} />
        <span className="section-kicker">
          {phase === "uploading" ? "Đang tải ảnh" : "Đang đối chiếu PhumData"}
        </span>
        <h2>
          {phase === "uploading"
            ? "Chuẩn bị dữ liệu an toàn…"
            : "Tìm nội dung có nguồn phù hợp…"}
        </h2>
        <div
          className="processing-progress"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progress}
        >
          <span style={{ width: `${progress}%` }} />
        </div>
        <p>
          <Clock3 size={14} /> Thường mất dưới một phút. Không cần giữ màn hình
          luôn sáng.
        </p>
      </div>
    </div>
  );
}

function ScanResultView({
  scanId,
  result,
  onReset,
}: {
  scanId: string;
  result: ScanResult;
  onReset: () => void;
}) {
  const [feedback, setFeedback] = useState<string>();
  async function respond(
    type:
      | "CORRECT"
      | "INCORRECT"
      | "UNSURE"
      | "REQUEST_REVIEW"
      | "SELECTED_CANDIDATE",
    entityId?: string,
  ) {
    await sendScanFeedback(scanId, type, entityId);
    setFeedback(
      "Cảm ơn bạn. Phản hồi đã được lưu riêng để cải thiện quá trình đối chiếu.",
    );
  }
  const uncertain =
    result.decision === "UNKNOWN" ||
    result.decision === "SUGGEST" ||
    result.requiresHumanReview;
  const confidence = Math.round(result.confidence * 100);
  return (
    <div
      className={`scan-result scan-result--${uncertain ? "uncertain" : "match"}`}
    >
      <div className="scan-result__status">
        <span>
          {uncertain ? <AlertTriangle size={24} /> : <CheckCircle2 size={24} />}
        </span>
        <div>
          <Badge variant={uncertain ? "warning" : "success"}>
            {DECISION_LABELS[result.decision] ?? result.decision}
          </Badge>
          <h1>{result.synthesis.title || "Chưa xác định được đối tượng"}</h1>
          <p>
            {uncertain
              ? "Đây là gợi ý cần được xem thận trọng."
              : "Kết quả đã được đối chiếu với dữ liệu PhumData."}
          </p>
        </div>
        <div className="confidence-meter">
          <strong>{confidence}%</strong>
          <small>độ tin cậy</small>
        </div>
      </div>
      <Card className="scan-result__summary">
        <span className="section-kicker">
          Diễn giải từ dữ liệu đã kiểm chứng
        </span>
        <p>{result.synthesis.summary}</p>
        {result.synthesis.culturalMeaning && (
          <>
            <h2>Ý nghĩa văn hóa</h2>
            <p>{result.synthesis.culturalMeaning}</p>
          </>
        )}
      </Card>
      {uncertain && (
        <Card className="scan-uncertainty">
          <AlertTriangle size={20} />
          <div>
            <h2>Vì sao chưa chắc chắn?</h2>
            <p>
              {result.synthesis.uncertaintyNote ??
                "Hình ảnh hoặc dữ liệu đối chiếu chưa đủ để đưa ra kết luận chắc chắn."}
            </p>
            {result.alternativeEntityIds.length > 0 && (
              <p>
                Có {result.alternativeEntityIds.length} ứng viên khác cần được
                xem xét.
              </p>
            )}
          </div>
        </Card>
      )}
      {result.alternativeEntityIds.length > 0 && (
        <Card className="scan-candidates">
          <strong>Các ứng viên khác</strong>
          {result.alternativeEntityIds.slice(0, 3).map((id, index) => (
            <div key={id}>
              <Link href={`/culture/${id}`}>
                Ứng viên {index + 1} <ArrowRight size={14} />
              </Link>
              <Button
                variant="ghost"
                onClick={() => respond("SELECTED_CANDIDATE", id)}
              >
                Chọn kết quả này
              </Button>
            </div>
          ))}
        </Card>
      )}
      <div className="scan-evidence">
        <Card>
          <ShieldCheck size={20} />
          <div>
            <strong>
              {result.synthesis.citationIds.length} nguồn tham chiếu
            </strong>
            <span>
              {result.citationCoverageComplete
                ? "Phạm vi trích dẫn đầy đủ"
                : "Cần kiểm tra thêm nguồn"}
            </span>
          </div>
        </Card>
        <Card>
          <Sparkles size={20} />
          <div>
            <strong>{result.synthesis.verificationLabel}</strong>
            <span>Mức xác minh PhumData</span>
          </div>
        </Card>
      </div>
      <div className="scan-next-actions">
        {result.entityId && (
          <Link
            href={`/culture/${result.entityId}`}
            className="ps-btn ps-btn--primary"
          >
            Khám phá tiếp <ArrowRight size={16} />
          </Link>
        )}
        {result.synthesis.nextActions.includes("OPEN_MAP") && (
          <Link
            href={result.entityId ? `/map?selected=${result.entityId}` : "/map"}
            className="ps-btn ps-btn--secondary"
          >
            <MapPin size={16} /> Mở bản đồ
          </Link>
        )}
        {result.synthesis.nextActions.includes("VIEW_RELATED_TERM") && (
          <Link href="/handbook" className="ps-btn ps-btn--secondary">
            Mở cẩm nang
          </Link>
        )}
        {result.synthesis.nextActions.includes("START_QUIZ") && (
          <Link href="/quiz" className="ps-btn ps-btn--secondary">
            Làm quiz liên quan
          </Link>
        )}
        <Button variant="secondary" onClick={onReset}>
          <RotateCcw size={16} /> Quét ảnh khác
        </Button>
      </div>
      <Card className="scan-feedback">
        <strong>Kết quả này có hữu ích không?</strong>
        <div>
          <Button
            variant="secondary"
            onClick={() => respond("CORRECT", result.entityId ?? undefined)}
          >
            Đúng
          </Button>
          <Button variant="secondary" onClick={() => respond("INCORRECT")}>
            Sai
          </Button>
          <Button variant="ghost" onClick={() => respond("UNSURE")}>
            Không chắc
          </Button>
          {uncertain && (
            <Button
              variant="secondary"
              onClick={() => respond("REQUEST_REVIEW")}
            >
              Gửi người kiểm duyệt
            </Button>
          )}
        </div>
        {feedback && <p role="status">{feedback}</p>}
      </Card>
      {result.synthesis.nextActions.length > 0 && (
        <div className="scan-action-labels">
          {result.synthesis.nextActions.map((action) => (
            <Badge key={action}>{NEXT_ACTION_LABELS[action] ?? action}</Badge>
          ))}
        </div>
      )}
    </div>
  );
}
