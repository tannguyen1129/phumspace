import type { InputHTMLAttributes } from "react";
import { Search, X } from "lucide-react";

type SearchBarProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & { label?: string; onClear?: () => void };
export function SearchBar({ label = "Tìm kiếm", value, onClear, className, ...props }: SearchBarProps) {
  return <div className={["ps-search", className].filter(Boolean).join(" ")}><Search size={19} aria-hidden="true" className="ps-search__icon" /><input type="search" aria-label={label} value={value} {...props} />{onClear && value && <button type="button" className="ps-search__clear" onClick={onClear} aria-label="Xóa nội dung tìm kiếm"><X size={17} aria-hidden="true" /></button>}</div>;
}
