import type { ReactNode } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

type PageHeaderProps = {
  title: string;
  subtitle?: string;
  backHref?: string;
  actions?: ReactNode;
  eyebrow?: string;
};

export function PageHeader({ title, subtitle, backHref, actions, eyebrow = "PhumSpace" }: PageHeaderProps) {
  return (
    <header className="ps-page-header">
      {backHref && (
        <Link href={backHref} className="ps-page-header__back">
          <ChevronLeft size={16} aria-hidden="true" />
          Quay lại
        </Link>
      )}
      <div className="ps-page-header__row">
        <div>
          <span className="ps-page-header__eyebrow">{eyebrow}</span>
          <h1>{title}</h1>
          {subtitle && <p>{subtitle}</p>}
        </div>
        {actions && <div className="ps-page-header__actions">{actions}</div>}
      </div>
    </header>
  );
}
