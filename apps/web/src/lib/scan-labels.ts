/** Nhan hien thi tieng Viet cho ket qua Scanner (@phumspace/contracts::SCAN_DECISIONS/NEXT_ACTIONS). */
export const DECISION_LABELS: Record<string, string> = {
  MATCH: "Đã nhận diện",
  SUGGEST: "Có thể là",
  UNKNOWN: "Chưa xác định",
  HUMAN_REVIEW: "Đang chờ kiểm duyệt",
};

export const NEXT_ACTION_LABELS: Record<string, string> = {
  OPEN_MAP: "Xem trên bản đồ",
  PLAY_AUDIO: "Nghe thuyết minh",
  START_QUIZ: "Làm quiz",
  SAVE_ITEM: "Lưu lại",
  VIEW_RELATED_TERM: "Xem từ vựng liên quan",
  RETAKE_PHOTO: "Chụp lại",
};
