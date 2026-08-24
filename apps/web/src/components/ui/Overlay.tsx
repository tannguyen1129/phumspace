"use client";
import { useEffect, type ReactNode } from "react";
import { X } from "lucide-react";
type OverlayProps = { open: boolean; title: string; description?: string; onClose: () => void; children: ReactNode; variant?: "dialog" | "drawer" | "sheet" };
export function Overlay({ open, title, description, onClose, children, variant = "dialog" }: OverlayProps) {
  useEffect(() => { if (!open) return; const close = (event: KeyboardEvent) => event.key === "Escape" && onClose(); document.addEventListener("keydown", close); document.body.style.overflow = "hidden"; return () => { document.removeEventListener("keydown", close); document.body.style.overflow = ""; }; }, [open, onClose]);
  if (!open) return null;
  return <div className="ps-overlay" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}><section className={`ps-overlay__panel ps-overlay__panel--${variant}`} role="dialog" aria-modal="true" aria-labelledby="ps-overlay-title"><header><div><h2 id="ps-overlay-title">{title}</h2>{description && <p>{description}</p>}</div><button type="button" className="ps-icon-btn" onClick={onClose} aria-label="Đóng"><X size={20} /></button></header><div className="ps-overlay__content">{children}</div></section></div>;
}
