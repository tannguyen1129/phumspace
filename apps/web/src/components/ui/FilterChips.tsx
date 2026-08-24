export type FilterChip = { value: string; label: string; count?: number };
export function FilterChips({ items, value, onChange, label = "Bộ lọc" }: { items: FilterChip[]; value: string; onChange: (value: string) => void; label?: string }) {
  return <div className="ps-chips" role="group" aria-label={label}>{items.map((item) => <button key={item.value} type="button" className="ps-chip" aria-pressed={value === item.value} onClick={() => onChange(item.value)}>{item.label}{item.count !== undefined && <span>{item.count}</span>}</button>)}</div>;
}
