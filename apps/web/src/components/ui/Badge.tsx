import type { ReactNode } from "react";

type BadgeVariant = "neutral" | "success" | "warning" | "verified" | "danger";

type BadgeProps = {
  variant?: BadgeVariant;
  icon?: ReactNode;
  children: ReactNode;
};

export function Badge({ variant = "neutral", icon, children }: BadgeProps) {
  return (
    <span className={`ps-badge ps-badge--${variant}`}>
      {icon}
      {children}
    </span>
  );
}
