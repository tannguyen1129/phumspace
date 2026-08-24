/**
 * Dieu huong bottom nav (M-01..M-20, UX Flow). Tu chua danh sach tab thay vi import
 * gia tri runtime tu @phumspace/ui, de tranh phu thuoc Vite/Vitest phai transform
 * package workspace dang TS source ngay trong test — @phumspace/ui van la nguon
 * chuan cho type BottomNavTab (import type — bi xoa luc bien dich, khong anh huong runtime).
 */
import type { BottomNavTab } from "@phumspace/ui";

export const ALL_BOTTOM_NAV_TABS: readonly BottomNavTab[] = ["explore", "map", "scan", "me"];

const HREF_MAP: Record<BottomNavTab, string> = {
  explore: "/",
  map: "/map",
  scan: "/scan",
  me: "/me",
};

const LABEL_MAP: Record<BottomNavTab, string> = {
  explore: "Khám phá",
  map: "Bản đồ",
  scan: "Quét",
  me: "Tôi",
};

export function getBottomNavHref(tab: BottomNavTab): string {
  return HREF_MAP[tab];
}

export function getBottomNavLabel(tab: BottomNavTab): string {
  return LABEL_MAP[tab];
}

const EXPLORE_PATHS = ["/handbook", "/festivals", "/quiz", "/contribute", "/organizations", "/moderation", "/admin"];

export function isBottomNavTabActive(tab: BottomNavTab, pathname: string): boolean {
  if (tab === "explore") return pathname === "/" || EXPLORE_PATHS.some((path) => pathname.startsWith(path));
  const href = HREF_MAP[tab];
  return pathname === href || pathname.startsWith(`${href}/`);
}
