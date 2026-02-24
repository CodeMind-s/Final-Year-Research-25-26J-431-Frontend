# Auth, Onboarding & Payment Implementation

This document covers the complete overhaul of the BRINEX frontend authentication system — from a simple email/password admin login to a full OTP-based auth flow supporting three user roles, role-specific onboarding, subscription/trial management, and PayHere payment integration.

---

## Table of Contents

- [Overview](#overview)
- [User Roles](#user-roles)
- [Architecture](#architecture)
- [Phase 0: Foundation (Types & Config)](#phase-0-foundation)
- [Phase 1: Service Layer](#phase-1-service-layer)
- [Phase 2: Auth State Management](#phase-2-auth-state-management)
- [Phase 3: Auth Pages](#phase-3-auth-pages)
- [Phase 4: Onboarding](#phase-4-onboarding)
- [Phase 5: Plans & Payment](#phase-5-plans--payment)
- [Phase 6: Home Page Redesign](#phase-6-home-page-redesign)
- [Phase 7: Route Protection](#phase-7-route-protection)
- [File Summary](#file-summary)
- [Auth Flow Diagrams](#auth-flow-diagrams)
- [API Endpoints](#api-endpoints)
- [Testing & Verification](#testing--verification)

---

## Overview

The previous system used a single `LoginForm` component with email/password authentication, primarily designed for admin users. The new system introduces:

- **OTP-based authentication** for Landowner, Distributor, and Laboratory roles
- **Email/password login** preserved for Admin users
- **Role-specific onboarding** forms after first login
- **Subscription plans** with trial period management
- **PayHere payment gateway** integration for paid subscriptions
- **Enhanced route protection** with onboarding and subscription guards

## User Roles

| Role | Auth Method | Identifier | Onboarding Fields | Subscription |
|------|-------------|------------|-------------------|--------------|
| **LANDOWNER** | Phone OTP | +94 phone number | NIC, Address, Total Beds | Free + Pro (14-day trial) |
| **DISTRIBUTOR** | Phone OTP | +94 phone number | Company Name, Reg #, Address | Free + Pro (14-day trial) |
| **LABORATORY** | Email OTP | Email address | Lab Name, Reg #, Address | Lab Plan (mandatory) |
| **ADMIN** | Email/Password | Email + password | None | N/A |

---

## Architecture

```
src/
├── dtos/
│   ├── auth.dto.ts          # Auth types, OTP DTOs, onboarding DTOs
│   └── payment.dto.ts       # Payment types (checkout, payment records)
├── lib/
│   └── api.config.ts        # API endpoint definitions
├── services/
│   ├── auth.controller.ts   # Auth API calls (OTP + admin login + onboarding)
│   └── payment.controller.ts # Payment API calls (checkout + history)
├── context/
│   └── auth.context.tsx     # Global auth state (signIn, verifyOtp, login, logout)
├── hooks/
│   ├── useAuth.ts           # Auth context consumer hook
│   └── usePayhere.ts        # PayHere SDK integration hook
├── components/
│   ├── common/
│   │   └── ProtectedRoute.tsx # Route guard (auth + onboarding + subscription)
│   └── home/
│       └── HomeSection.tsx    # Home page with login entry points
└── app/
    └── (auth)/
        ├── layout.tsx                   # Centered auth layout
        ├── auth/login/page.tsx          # Phone OTP login (Landowner/Distributor)
        ├── auth/laboratory/page.tsx     # Email OTP login (Laboratory)
        ├── auth/admin/page.tsx          # Email/password login (Admin)
        ├── auth/onboarding/page.tsx     # Role-specific onboarding forms
        ├── auth/plans/page.tsx          # Plan selection + checkout
        ├── payments/success/page.tsx    # Payment success confirmation
        └── payments/cancel/page.tsx     # Payment cancellation
```

---

## Phase 0: Foundation

### `src/dtos/auth.dto.ts`

Added new roles to the `UserRole` enum:

```typescript
export enum UserRole {
  SUPERADMIN = 'SUPERADMIN',
  ADMIN = 'ADMIN',
  SALTSOCIETY = 'SALTSOCIETY',
  SELLER = 'SELLER',
  LANDOWNER = 'LANDOWNER',
  DISTRIBUTOR = 'DISTRIBUTOR',   // NEW
  LABORATORY = 'LABORATORY',     // NEW
  VIEWER = 'VIEWER',
}
```

Updated the `User` interface with subscription/trial fields:

```typescript
export interface User {
  id: string;
  email?: string;           // Optional (lab/admin have it)
  phone?: string;            // Optional (landowner/distributor have it)
  role: UserRole;
  name?: string;
  avatar?: string;
  isOnboarded: boolean;      // NEW
  plan?: string;             // NEW
  isSubscribed: boolean;     // NEW
  isVerified: boolean;       // NEW
  isTrialActive: boolean;    // NEW
  trialStartDate?: string;   // NEW
  trialEndDate?: string;     // NEW
}
```

New DTOs added: `SignInRequest`, `SignInResponse`, `VerifyOtpRequest`, `VerifyOtpResponse`, `PersonalDetailsResponse`, `LandOwnerOnboardingRequest`, `LaboratoryOnboardingRequest`, `DistributorOnboardingRequest`.

### `src/dtos/payment.dto.ts` (New)

```typescript
CheckoutRequest  { planKey, billingCycle }
CheckoutResponse { merchant_id, order_id, hash, amount, currency, ... }
Payment          { id, orderId, amount, currency, status, planKey, billingCycle }
```

### `src/lib/api.config.ts`

New endpoints added under `ENDPOINTS`:

```typescript
AUTH: {
  SIGN_IN: '/auth/sign-in',
  VERIFY_OTP: '/auth/verify-otp',
  PERSONAL_DETAILS: '/auth/personal-details',
  ONBOARDING_LANDOWNER: '/auth/onboarding/landowner',
  ONBOARDING_LABORATORY: '/auth/onboarding/laboratory',
  ONBOARDING_DISTRIBUTOR: '/auth/onboarding/distributor',
  // ... existing endpoints preserved
},
PAYMENTS: {
  CHECKOUT: '/payments/checkout',
  HISTORY: '/payments',
},
```

---

## Phase 1: Service Layer

### `src/services/auth.controller.ts`

New methods added to `AuthController`:

| Method | HTTP | Endpoint | Purpose |
|--------|------|----------|---------|
| `signIn(request)` | POST | `/auth/sign-in` | Send OTP to phone/email |
| `verifyOtp(request)` | POST | `/auth/verify-otp` | Verify OTP, get tokens |
| `getPersonalDetails()` | GET | `/auth/personal-details` | Get authenticated user info |
| `onboardLandowner(request)` | POST | `/auth/onboarding/landowner` | Submit landowner profile |
| `onboardLaboratory(request)` | POST | `/auth/onboarding/laboratory` | Submit laboratory profile |
| `onboardDistributor(request)` | POST | `/auth/onboarding/distributor` | Submit distributor profile |

Existing `login()`, `logout()`, `refreshToken()`, `getCurrentUser()`, `validateToken()` methods preserved.

### `src/services/payment.controller.ts` (New)

| Method | HTTP | Endpoint | Purpose |
|--------|------|----------|---------|
| `checkout(request)` | POST | `/payments/checkout` | Create PayHere checkout session |
| `getPayments()` | GET | `/payments` | Fetch payment history |

---

## Phase 2: Auth State Management

### `src/context/auth.context.tsx`

The `AuthContext` now exposes:

```typescript
interface AuthContextType extends AuthState {
  signIn: (request: SignInRequest) => Promise<SignInResponse>;
  verifyOtp: (request: VerifyOtpRequest) => Promise<void>;
  login: (credentials: LoginRequest) => Promise<void>;  // Admin only
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  error: string | null;
}
```

**Post-OTP-verify routing logic:**

```
verifyOtp success
  ├── !isOnboarded          → /auth/onboarding
  ├── LABORATORY + !isSubscribed → /auth/plans
  ├── isTrialActive || isSubscribed → dashboard (by role)
  └── else (trial expired)  → /auth/plans
```

**Dashboard routing by role:**

| Role | Dashboard Path |
|------|---------------|
| LANDOWNER | `/compass/landowner-dashboard` |
| DISTRIBUTOR / SELLER | `/compass/seller-dashboard` |
| LABORATORY | `/vision/dashboard/camera` |
| ADMIN / SUPERADMIN | `/vision/dashboard/camera` |
| SALTSOCIETY | `/crystal/dashboard/production` |

---

## Phase 3: Auth Pages

### Auth Layout — `src/app/(auth)/layout.tsx`

Minimal centered layout wrapping all auth pages:

```
min-h-screen → centered → max-w-md container
```

### Common Login — `/auth/login`

- **Tabbed UI**: Landowner | Distributor tabs
- **Step 1**: Phone input with `+94` prefix → "Send OTP"
- **Step 2**: 6-digit OTP input → "Verify"
- Link to Laboratory login at bottom

### Laboratory Login — `/auth/laboratory`

- **Step 1**: Email input → "Send OTP"
- **Step 2**: 6-digit OTP input → "Verify"
- Link to Landowner/Distributor login at bottom

### Admin Login — `/auth/admin`

- Traditional email + password form
- Calls `authController.login()` (existing endpoint)
- Redirects to admin dashboard on success

### Module Entry Page Redirects

The old `LoginForm` component was deleted and the module entry pages now redirect:

| Page | Redirects To |
|------|-------------|
| `/vision` | `/auth/laboratory` |
| `/compass` | `/auth/login` |
| `/crystal` | `/auth/login` |

---

## Phase 4: Onboarding

### Onboarding Page — `/auth/onboarding`

Protected page that requires authentication and `!isOnboarded`. Renders a role-specific form:

**Landowner Form:**
- NIC Number
- Address
- Total Salt Beds

**Laboratory Form:**
- Laboratory Name
- Registration Number
- Address

**Distributor Form:**
- Company Name
- Registration Number
- Address

On successful submission, calls the appropriate onboarding endpoint, refreshes user data, then redirects to `/auth/plans`.

---

## Phase 5: Plans & Payment

### Plans Page — `/auth/plans`

Displays subscription options based on user role:

**Landowner / Distributor:**
- Free plan (basic access) with "Continue" option
- Pro plan at LKR 1,500/mo or LKR 15,000/yr
- Trial status banner (active with days remaining, or expired)

**Laboratory:**
- Lab Plan only at LKR 2,500/mo or LKR 25,000/yr
- Must subscribe — no skip option

Features a Monthly/Annual billing toggle.

### PayHere Integration — `src/hooks/usePayhere.ts`

Custom hook that:
1. Dynamically loads the PayHere SDK script (`payhere.js`)
2. Exposes `startPayment(checkoutData)` function
3. Handles `onCompleted`, `onDismissed`, `onError` callbacks
4. Supports sandbox mode (default: `true`)

**Payment flow:**
```
User clicks Subscribe
  → POST /payments/checkout (get PayHere session data)
  → payhere.startPayment(sessionData)
  → PayHere modal opens
  → onCompleted → refreshUser → redirect to dashboard
  → onDismissed → reset loading state
  → onError → show error message
```

### Payment Result Pages

- **`/payments/success`** — Confirmation with "Go to Dashboard" button; refreshes user on mount
- **`/payments/cancel`** — Cancellation notice with "Back to Plans" and "Go to Home" options

---

## Phase 6: Home Page Redesign

### `src/components/home/HomeSection.tsx`

Added login entry points below the hero text:

- **"Login as Landowner / Distributor"** button → `/auth/login` (green)
- **"Login as Laboratory"** button → `/auth/laboratory` (blue)
- **"Admin Login"** link → `/auth/admin` (subtle text link)

---

## Phase 7: Route Protection

### `src/components/common/ProtectedRoute.tsx`

New props added:

```typescript
interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole[];
  requireOnboarded?: boolean;    // NEW — redirects to /auth/onboarding
  requireSubscription?: boolean; // NEW — redirects to /auth/plans
  redirectTo?: string;
}
```

**Guard logic (in order):**

1. Not authenticated → redirect to `redirectTo` (default: `/`)
2. Role mismatch → redirect to `/unauthorized`
3. `requireOnboarded` + `!user.isOnboarded` → redirect to `/auth/onboarding`
4. `requireSubscription` + `!user.isSubscribed` + `!user.isTrialActive` → redirect to `/auth/plans`

**Usage in dashboard layouts:**

```tsx
<ProtectedRoute
  requiredRole={[UserRole.LABORATORY]}
  requireOnboarded
  requireSubscription
>
  <VisionDashboard />
</ProtectedRoute>
```

---

## File Summary

### New Files (11)

| File | Purpose |
|------|---------|
| `src/dtos/payment.dto.ts` | Payment types |
| `src/services/payment.controller.ts` | Payment API calls |
| `src/app/(auth)/layout.tsx` | Auth layout |
| `src/app/(auth)/auth/login/page.tsx` | Phone OTP login |
| `src/app/(auth)/auth/laboratory/page.tsx` | Email OTP login |
| `src/app/(auth)/auth/admin/page.tsx` | Admin email/password login |
| `src/app/(auth)/auth/onboarding/page.tsx` | Onboarding forms |
| `src/app/(auth)/auth/plans/page.tsx` | Plan selection + checkout |
| `src/app/(auth)/payments/success/page.tsx` | Payment success |
| `src/app/(auth)/payments/cancel/page.tsx` | Payment cancel |
| `src/hooks/usePayhere.ts` | PayHere SDK hook |

### Modified Files (8)

| File | Changes |
|------|---------|
| `src/dtos/auth.dto.ts` | New roles, User shape, OTP DTOs, onboarding DTOs |
| `src/lib/api.config.ts` | New auth + payment endpoints |
| `src/services/auth.controller.ts` | OTP + onboarding methods added |
| `src/context/auth.context.tsx` | Rewritten for OTP + admin flows |
| `src/hooks/useAuth.ts` | Updated JSDoc |
| `src/components/home/HomeSection.tsx` | Login buttons added |
| `src/components/common/ProtectedRoute.tsx` | Onboarding + subscription guards |
| `src/app/(vision)/vision/page.tsx` | Redirect to `/auth/laboratory` |

### Removed Files (3)

| File | Action |
|------|--------|
| `src/components/common/loginForm.tsx` | Deleted (replaced by auth pages) |
| `src/app/(compass)/compass/page.tsx` | Replaced with redirect |
| `src/app/(crystal)/crystal/page.tsx` | Replaced with redirect |

### Unchanged (Reused as-is)

- `src/lib/http-client.ts` — Axios HTTP client with interceptors
- `src/services/base-controller.ts` — Base API controller class
- `src/lib/storage.utils.ts` — Token + user localStorage utilities
- `src/components/ui/*` — All shadcn UI components (tabs, input-otp, button, card, etc.)

---

## Auth Flow Diagrams

### Landowner / Distributor Flow

```
Home Page
  → "Login as Landowner / Distributor"
  → /auth/login (select tab)
  → Enter phone → Send OTP
  → Enter 6-digit OTP → Verify
  → [New user?] → /auth/onboarding → fill form → submit
  → /auth/plans → view trial status / subscribe
  → Dashboard
```

### Laboratory Flow

```
Home Page
  → "Login as Laboratory"
  → /auth/laboratory
  → Enter email → Send OTP
  → Enter 6-digit OTP → Verify
  → [New user?] → /auth/onboarding → fill form → submit
  → /auth/plans → MUST subscribe (no skip)
  → PayHere checkout → payment success
  → Dashboard
```

### Admin Flow

```
Home Page
  → "Admin Login" (small link)
  → /auth/admin
  → Enter email + password → Sign In
  → Admin Dashboard
```

---

## API Endpoints

### Auth Endpoints

| Method | Endpoint | Body | Response |
|--------|----------|------|----------|
| POST | `/auth/sign-in` | `{ phone?, email?, role }` | `{ message }` |
| POST | `/auth/verify-otp` | `{ phone?, email?, otp, role }` | `{ user, accessToken, refreshToken? }` |
| GET | `/auth/personal-details` | — | `{ user }` |
| POST | `/auth/onboarding/landowner` | `{ nic, address, totalBeds, documentUrls? }` | `User` |
| POST | `/auth/onboarding/laboratory` | `{ laboratoryName, registrationNumber, address, documentUrls? }` | `User` |
| POST | `/auth/onboarding/distributor` | `{ companyName, registrationNumber, address, documentUrls? }` | `User` |
| POST | `/auth/login` | `{ email, password }` | `{ user, accessToken, refreshToken? }` |
| POST | `/auth/logout` | `{ refreshToken? }` | — |

### Payment Endpoints

| Method | Endpoint | Body | Response |
|--------|----------|------|----------|
| POST | `/payments/checkout` | `{ planKey, billingCycle }` | PayHere checkout data |
| GET | `/payments` | — | `Payment[]` |

---

## Testing & Verification

### Test Scenarios

1. **Common Login**: Home → "Login as Landowner" → phone → OTP → verify → onboarding (if new) → dashboard
2. **Lab Login**: `/auth/laboratory` → email → OTP → verify → onboarding → must buy plan → dashboard
3. **Admin Login**: `/auth/admin` → email + password → admin dashboard
4. **Onboarding**: New user → role-specific form → submit → plans page
5. **Trial Display**: Plans page shows "14-day trial active" with remaining days, or "Trial expired"
6. **Payment**: Subscribe → PayHere modal → test card `4916217501611292` → success → dashboard
7. **Guards**: Unauthenticated → login; Un-onboarded → onboarding; Unsubscribed lab → plans

### PayHere Sandbox Testing

The PayHere hook defaults to sandbox mode (`sandbox: true`). Use these test credentials:

- **Test Card**: `4916217501611292`
- **Expiry**: Any future date
- **CVV**: Any 3 digits

Set `sandbox: false` in production by passing it to the `usePayhere` hook.
