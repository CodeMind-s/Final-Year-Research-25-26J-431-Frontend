/**
 * API Configuration
 * Central configuration for all API-related settings
 */

// Brinex Lab Agent endpoints (Phase 7).
// The agent runs on each laboratory PC. Production builds use these defaults;
// override via NEXT_PUBLIC_LAB_AGENT_URL / _HEALTH_URL for staging or non-
// localhost deployments. The "wss://localhost" requirement is browser-imposed
// because the dashboard is served from HTTPS and ws:// would be blocked as
// mixed content.
export const LAB_AGENT_URL =
  process.env.NEXT_PUBLIC_LAB_AGENT_URL ?? "wss://localhost:5005";
export const LAB_AGENT_HEALTH_URL =
  process.env.NEXT_PUBLIC_LAB_AGENT_HEALTH_URL ??
  "https://localhost:5005/health";

export const API_CONFIG = {
  // Base URL for API requests
  BASE_URL:
    process.env.NEXT_PUBLIC_API_BASE_URL || "https://49mbsvf2-3400.asse.devtunnels.ms/api/v1",

  // Request timeout in milliseconds
  TIMEOUT: 30000,

  // Retry configuration
  RETRY: {
    MAX_RETRIES: 3,
    RETRY_DELAY: 1000, // milliseconds
    RETRY_STATUS_CODES: [408, 429, 500, 502, 503, 504],
  },

  // Token configuration
  TOKEN: {
    STORAGE_KEY: "auth_token",
    REFRESH_TOKEN_KEY: "refresh_token",
    TOKEN_PREFIX: "Bearer",
  },

  // API Endpoints
  ENDPOINTS: {
    AUTH: {
      LOGIN: "/auth/login",
      SIGN_UP: "/auth/sign-up",
      SIGN_IN: "/auth/sign-in",
      VERIFY_OTP: "/auth/verify-otp",
      PERSONAL_DETAILS: "/auth/personal-details",
      ONBOARDING_LANDOWNER: "/auth/onboarding/landowner",
      ONBOARDING_LABORATORY: "/auth/onboarding/laboratory",
      ONBOARDING_DISTRIBUTOR: "/auth/onboarding/distributor",
    },
    USER: {
      CREATE: "/user/create",
      UPDATE: "/user/update",
      DELETE: "/user/delete",
      GET: "/user",
    },
    PAYMENTS: {
      CHECKOUT: "/payments/checkout",
      HISTORY: "/payments",
      ALL: "/payments/all",
    },
    SUBSCRIPTIONS: {
      ALL: "/auth/subscriptions",
    },
    ADMIN: {
      USERS_LIST: "/user/all/users",
      USER_BY_ID: "/user",
      USER_CREATE: "/user/create",
      USER_DELETE: "/user",
      USER_VERIFY: "/user",
      USER_PROFILE: "/user",
    },
    PLANS: {
      LIST: "/auth/plans",
      BY_KEY: "/auth/plans",
      CREATE: "/auth/plans",
      UPDATE: "/auth/plans",
      DELETE: "/auth/plans",
    },
    AUDIT_LOGS: {
      LIST: "/audit-logs",
      BY_USER: "/audit-logs/user",
      BY_SERVICE: "/audit-logs/service",
      BY_ID: "/audit-logs",
    },
  },

  // Headers
  HEADERS: {
    CONTENT_TYPE: "application/json",
    ACCEPT: "application/json",
  },
} as const;

/**
 * Environment-specific settings
 */
export const ENV = {
  isDevelopment: process.env.NODE_ENV === "development",
  isProduction: process.env.NODE_ENV === "production",
  isTest: process.env.NODE_ENV === "test",
} as const;

/**
 * API Response Status Codes
 */
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
} as const;
