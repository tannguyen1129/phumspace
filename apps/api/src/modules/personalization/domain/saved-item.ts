export interface SavedItem {
  id: string;
  userId: string;
  entityId: string | null;
  termId: string | null;
  createdAt: Date;
}

export interface SavedItemView {
  id: string;
  entityId: string | null;
  termId: string | null;
  itemType: "ENTITY" | "TERM";
  title: string;
  subtitle: string | null;
  createdAt: Date;
}
