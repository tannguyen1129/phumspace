/** Nhan hien thi tieng Viet cho PlaceType (@phumspace/contracts::PLACE_TYPES) — giu dong bo thu cong. */
export const PLACE_TYPE_LABELS: Record<string, string> = {
  PAGODA: "Chùa",
  MUSEUM: "Bảo tàng",
  LAKE: "Hồ/Ao",
  MARKET: "Chợ",
  CRAFT_VILLAGE: "Làng nghề",
  FESTIVAL_GROUND: "Khu lễ hội",
  RESTAURANT: "Ẩm thực",
  OTHER: "Khác",
};

export function getPlaceTypeLabel(placeType: string): string {
  return PLACE_TYPE_LABELS[placeType] ?? placeType;
}

export const VERIFICATION_LABELS: Record<string, string> = {
  UNVERIFIED: "Chưa xác minh",
  COMMUNITY_CONFIRMED: "Cộng đồng xác nhận",
  SOURCE_VERIFIED: "Đã đối chiếu nguồn",
  EXPERT_REVIEWED: "Chuyên gia đã xem xét",
};

export function getVerificationLabel(level: string): string {
  return VERIFICATION_LABELS[level] ?? level;
}
