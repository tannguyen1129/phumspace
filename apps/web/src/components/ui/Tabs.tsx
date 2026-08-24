import type { ReactNode } from "react";
export type TabItem = { id: string; label: string; icon?: ReactNode };
export function Tabs({ items, activeId, onChange, label }: { items: TabItem[]; activeId: string; onChange: (id: string) => void; label: string }) {
  return <div className="ps-tabs" role="tablist" aria-label={label}>{items.map((item) => <button key={item.id} type="button" role="tab" aria-selected={activeId === item.id} className="ps-tab" onClick={() => onChange(item.id)}>{item.icon}{item.label}</button>)}</div>;
}
