"use client";

import { useEffect } from "react";
import { fetchMe, getAccessToken } from "../lib/api-client";

/**
 * FR-PER-004: accessibility preferences nguoi dung tu cau hinh (khong suy luan tu du lieu
 * nhay cam nao khac) — ap dung qua thuoc tinh tren <html> de CSS toan cuc doc duoc.
 */
export function AccessibilityPreferencesEffect() {
  useEffect(() => {
    if (!getAccessToken()) return;
    fetchMe()
      .then((user) => {
        document.documentElement.setAttribute(
          "data-large-text",
          String(Boolean(user.accessibilityPreferences?.largeText))
        );
        document.documentElement.setAttribute(
          "data-reduced-motion",
          String(Boolean(user.accessibilityPreferences?.reducedMotion))
        );
      })
      .catch(() => undefined);
  }, []);

  return null;
}
