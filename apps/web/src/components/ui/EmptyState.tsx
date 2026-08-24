import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

type EmptyStateProps = {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
};

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="ps-empty-state">
      {Icon && <Icon size={32} aria-hidden="true" style={{ color: "var(--color-heritage-gold)" }} />}
      <p style={{ margin: 0, fontWeight: 600, color: "var(--color-ink)" }}>{title}</p>
      {description && <p style={{ margin: 0, fontSize: "var(--font-size-small)" }}>{description}</p>}
      {action}
    </div>
  );
}
