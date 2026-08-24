import type { LucideIcon } from "lucide-react";
import { AlertTriangle, CheckCircle2, LockKeyhole, WifiOff } from "lucide-react";
import type { ReactNode } from "react";
type Kind = "error" | "permission" | "offline" | "success";
const ICONS: Record<Kind, LucideIcon> = { error: AlertTriangle, permission: LockKeyhole, offline: WifiOff, success: CheckCircle2 };
export function FeedbackState({ kind = "error", title, description, action, reference }: { kind?: Kind; title: string; description: string; action?: ReactNode; reference?: string }) {
  const Icon = ICONS[kind];
  return <section className={`ps-feedback ps-feedback--${kind}`} role={kind === "error" ? "alert" : "status"}><span className="ps-feedback__icon"><Icon size={23} aria-hidden="true" /></span><div><h2>{title}</h2><p>{description}</p>{reference && <small>Mã tham chiếu: {reference}</small>}{action && <div className="ps-feedback__action">{action}</div>}</div></section>;
}
