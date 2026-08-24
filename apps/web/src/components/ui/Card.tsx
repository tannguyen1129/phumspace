import type { CSSProperties, ElementType, ReactNode } from "react";

type CardProps = {
  children: ReactNode;
  as?: ElementType;
  interactive?: boolean;
  style?: CSSProperties;
  className?: string;
};

export function Card({ children, as: Tag = "div", interactive = false, style, className }: CardProps) {
  const classes = ["ps-card", interactive ? "ps-card--interactive" : "", className]
    .filter(Boolean)
    .join(" ");
  return (
    <Tag className={classes} style={style}>
      {children}
    </Tag>
  );
}
