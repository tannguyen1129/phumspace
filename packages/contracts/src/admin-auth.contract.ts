export interface AdminLoginRequestContract {
  idToken: string;
}

export interface AdminSessionContract {
  status: string;
  message: string;
}

export interface StaffProfileContract {
  id: string;
  email: string;
  displayName?: string;
  roles: ('REVIEWER' | 'EDITOR' | 'ADMIN')[];
  sessionExpiresAt: string;
  lastLoginAt?: string;
}

export interface AdminSecuritySessionContract {
  sessionId: string;
  staffEmail: string;
  roles: string[];
  createdAt: string;
  lastSeenAt: string;
  expiresAt: string;
}

export interface AdminAuthErrorContract {
  errorCode:
    | 'ADMIN_ID_TOKEN_REQUIRED'
    | 'ADMIN_ID_TOKEN_INVALID'
    | 'ADMIN_STAFF_NOT_PROVISIONED'
    | 'ADMIN_STAFF_SUSPENDED'
    | 'ADMIN_SESSION_REQUIRED'
    | 'ADMIN_SESSION_INVALID'
    | 'ADMIN_SESSION_EXPIRED'
    | 'ADMIN_ACCESS_DENIED'
    | 'ADMIN_ROLE_REQUIRED'
    | 'ADMIN_LOGIN_RATE_LIMITED';
  message: string;
  timestamp: string;
}
