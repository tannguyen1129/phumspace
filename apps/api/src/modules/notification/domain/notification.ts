import type { FollowTargetType, NotificationPriority } from "@phumspace/contracts";

export interface Follow {
  id: string;
  userId: string;
  targetType: FollowTargetType;
  targetId: string;
  createdAt: Date;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  body: string;
  priority: NotificationPriority;
  targetType: FollowTargetType | null;
  targetId: string | null;
  expiresAt: Date | null;
  createdAt: Date;
  readAt: Date | null;
}
