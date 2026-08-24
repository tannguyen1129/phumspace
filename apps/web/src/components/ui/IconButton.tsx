import type { ButtonHTMLAttributes } from "react";
import type { LucideIcon } from "lucide-react";

type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  icon: LucideIcon;
  label: string;
  active?: boolean;
};

/** aria-label bat buoc (khong co children text) — giu chuan a11y da co tu M6. */
export function IconButton({ icon: Icon, label, active = false, className, ...rest }: IconButtonProps) {
  const classes = ["ps-icon-btn", active ? "ps-icon-btn--active" : "", className].filter(Boolean).join(" ");
  return (
    <button type="button" className={classes} aria-label={label} title={label} {...rest}>
      <Icon size={20} aria-hidden="true" />
    </button>
  );
}
