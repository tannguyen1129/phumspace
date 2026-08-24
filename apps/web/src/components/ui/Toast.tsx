import type { ReactNode } from "react";
import { AlertCircle, CheckCircle2, Info, X } from "lucide-react";
type ToastKind = "success" | "error" | "info";
const ICONS = { success: CheckCircle2, error: AlertCircle, info: Info };
export function Toast({ kind = "info", children, onDismiss }: { kind?: ToastKind; children: ReactNode; onDismiss?: () => void }) {
  const Icon = ICONS[kind]; return <div className={`ps-toast ps-toast--${kind}`} role={kind === "error" ? "alert" : "status"}><Icon size={19} aria-hidden="true" /><div>{children}</div>{onDismiss && <button type="button" onClick={onDismiss} aria-label="Đóng thông báo"><X size={17} /></button>}</div>;
}
