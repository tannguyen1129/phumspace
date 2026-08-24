import type { ReactNode } from "react";

type FieldProps = { label: string; htmlFor: string; hint?: string; error?: string; optional?: boolean; children: ReactNode };

export function Field({ label, htmlFor, hint, error, optional, children }: FieldProps) {
  return <div className={`ps-field${error ? " ps-field--error" : ""}`}><label className="ps-field-label" htmlFor={htmlFor}><span>{label}</span>{optional && <span className="ps-field-optional">Không bắt buộc</span>}</label>{children}{(error || hint) && <p className={error ? "ps-field-error" : "ps-field-hint"}>{error ?? hint}</p>}</div>;
}
