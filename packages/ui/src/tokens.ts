/**
 * Design tokens v1.1 — nguon: docs/PhumSpace_UX_Flow_Wireframe (muc "UI DESIGN SYSTEM V1.1").
 * Mau chi la ngon ngu thiet ke lay cam hung tu khong gian van hoa/kien truc, PHAI duoc
 * Cultural Reviewer xac nhan truoc khi tuyen bo la "mau Khmer chinh thuc".
 */
export const colors = {
  primaryDeepMaroon: "#5A2433",
  primaryDark: "#35171F",
  heritageGold: "#C79A3B",
  saffronAccent: "#D8782A",
  palmGreen: "#2F6653",
  ivorySurface: "#FFF9F0",
  sandSurface: "#F2E8D8",
  ink: "#1F2522",
} as const;

export type ColorToken = keyof typeof colors;

/** Heritage Gold KHONG duoc dung lam body text tren nen sang (UX-V11 note) — kiem tra o linter/review, khong tu dong chan o day. */
export const RULES = {
  heritageGoldNotForBodyText: true,
  noSacredIconsAsFunctionalUi: true,
} as const;

export const typography = {
  latin: {
    uiFontFamily: "'Be Vietnam Pro', 'Noto Sans', sans-serif",
  },
  khmer: {
    uiFontFamily: "'Noto Sans Khmer', sans-serif",
    displayFontFamily: "'Noto Serif Khmer', serif",
  },
  scale: {
    display: { size: 32, lineHeight: 40 },
    h1: { size: 28, lineHeight: 36 },
    h2: { size: 22, lineHeight: 30 },
    h3: { size: 18, lineHeight: 26 },
    body: { size: 16, lineHeight: 24 },
    small: { size: 14, lineHeight: 20 },
    caption: { size: 12, lineHeight: 18 },
  },
} as const;

export const layout = {
  gridUnit: 4,
  contentPaddingMobile: 16,
  cardRadius: 20,
  sectionGap: 28,
  minTouchTarget: 44,
  motionDurationMs: { min: 150, max: 250 },
} as const;

/** Thang khoang cach dua tren gridUnit (4px) — dung nhat quan thay vi so tuy y moi trang. */
export const spacing = {
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 24,
  6: 32,
  7: 48,
  8: 64,
} as const;

/** Do sau (elevation) tong am, dua tren primaryDark thay vi den thuan — hop bang mau di san. */
export const elevation = {
  sm: "0 1px 2px rgba(53, 23, 31, 0.08), 0 1px 1px rgba(53, 23, 31, 0.06)",
  md: "0 4px 10px rgba(53, 23, 31, 0.12), 0 2px 4px rgba(53, 23, 31, 0.08)",
  lg: "0 12px 24px rgba(53, 23, 31, 0.16), 0 4px 8px rgba(53, 23, 31, 0.1)",
} as const;

/** Ban kinh bo goc — cardRadius (20px) o tren la muc "lg" da dung tu M0, giu nguyen ten cu. */
export const radius = {
  sm: 8,
  md: 16,
  lg: 20,
} as const;

/** Bottom navigation toi da 4 tab (UX-V11) — Festival/Su kien nam trong Kham pha va Map layer. */
export const BOTTOM_NAV_TABS = ["explore", "map", "scan", "me"] as const;
export type BottomNavTab = (typeof BOTTOM_NAV_TABS)[number];
