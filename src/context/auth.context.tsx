/**
 * Authentication Context
 * Global authentication state management using React Context
 */

'use client';

import React, { createContext, useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authController } from '@/services/auth.controller';
import {
    User,
    UserRole,
    AuthState,
    LoginRequest,
    SignInRequest,
    SignInResponse,
    VerifyOtpRequest,
} from '@/dtos/auth.dto';
import { ApiError } from '@/lib/api-error';
import { tokenStorage, storage } from '@/lib/storage.utils';

/**
 * Auth context type
 */
interface AuthContextType extends AuthState {
    signIn: (request: SignInRequest) => Promise<SignInResponse>;
    verifyOtp: (request: VerifyOtpRequest) => Promise<void>;
    login: (credentials: LoginRequest) => Promise<void>;
    logout: () => void;
    refreshUser: () => Promise<void>;
    error: string | null;
}

/**
 * Create context
 */
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Auth Provider Props
 */
interface AuthProviderProps {
    children: React.ReactNode;
}

/**
 * Get dashboard path for a given user role
 */
function getDashboardPath(role: UserRole): string {
    switch (role) {
        case UserRole.LANDOWNER:
            return '/compass/landowner-dashboard';
        case UserRole.DISTRIBUTOR:
        case UserRole.SELLER:
            return '/compass/seller-dashboard';
        case UserRole.LABORATORY:
            return '/laboratory/dashboard';
        case UserRole.SUPERADMIN:
        case UserRole.ADMIN:
            return '/superadmin/dashboard';
        case UserRole.SALTSOCIETY:
            return '/salt-society/dashboard';
        default:
            return '/';
    }
}

/**
 * Auth Provider Component
 */
export function AuthProvider({ children }: AuthProviderProps) {
    const router = useRouter();
    const [state, setState] = useState<AuthState>({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: true,
    });
    const [error, setError] = useState<string | null>(null);

    /**
     * Initialize auth state on mount
     */
    useEffect(() => {
        initializeAuth();
    }, []);

    /**
     * Initialize authentication state from localStorage
     */
    const initializeAuth = () => {
        try {
            const token = tokenStorage.getToken();
            const storedUser = storage.get<User>('auth_user');

            if (!token) {
                setState({
                    user: null,
                    token: null,
                    isAuthenticated: false,
                    isLoading: false,
                });
                return;
            }

            if (storedUser) {
                setState({
                    user: storedUser,
                    token,
                    isAuthenticated: true,
                    isLoading: false,
                });
            } else {
                tokenStorage.clearTokens();
                setState({
                    user: null,
                    token: null,
                    isAuthenticated: false,
                    isLoading: false,
                });
            }
        } catch {
            tokenStorage.clearTokens();
            storage.remove('auth_user');
            setState({
                user: null,
                token: null,
                isAuthenticated: false,
                isLoading: false,
            });
        }
    };

    /**
     * Send OTP (phone or email based)
     */
    const signIn = useCallback(async (request: SignInRequest): Promise<SignInResponse> => {
        try {
            setError(null);
            return await authController.signIn(request);
        } catch (err) {
            const errorMessage = err instanceof ApiError
                ? err.message
                : 'Failed to send OTP. Please try again.';
            setError(errorMessage);
            throw err;
        }
    }, []);

    /**
     * Verify OTP and handle post-auth routing
     */
    const verifyOtp = useCallback(async (request: VerifyOtpRequest) => {
        try {
            setError(null);
            setState((prev) => ({ ...prev, isLoading: true }));

            const response = await authController.verifyOtp(request);

            // Token is stored by controller, now fetch user details
            const user = await authController.getPersonalDetails();

            setState({
                user,
                token: response.accessToken,
                isAuthenticated: true,
                isLoading: false,
            });

            storage.set('auth_user', user);

            // Post-OTP routing logic
            if (!response.isOnboarded) {
                router.push('/auth/onboarding');
                return;
            }

            if (user.role === UserRole.LABORATORY && !user.isSubscribed) {
                router.push('/auth/plans');
                return;
            }

            if (user.isTrialActive || user.isSubscribed) {
                router.push(getDashboardPath(user.role));
                return;
            }

            // Trial expired, not subscribed
            router.push('/auth/plans');
        } catch (err) {
            const errorMessage = err instanceof ApiError
                ? err.message
                : 'OTP verification failed. Please try again.';
            setError(errorMessage);
            setState({
                user: null,
                token: null,
                isAuthenticated: false,
                isLoading: false,
            });
            throw err;
        }
    }, [router]);

    /**
     * Admin login with email/password
     */
    const login = useCallback(async (credentials: LoginRequest) => {
        try {
            setError(null);
            setState((prev) => ({ ...prev, isLoading: true }));

            const response = await authController.login(credentials);

            // Token stored by controller, fetch full user details
            const user = await authController.getPersonalDetails();

            setState({
                user,
                token: response.accessToken,
                isAuthenticated: true,
                isLoading: false,
            });

            storage.set('auth_user', user);

            router.push(getDashboardPath(user.role));
        } catch (err) {
            const errorMessage = err instanceof ApiError
                ? err.message
                : 'Login failed. Please try again.';
            setError(errorMessage);
            setState({
                user: null,
                token: null,
                isAuthenticated: false,
                isLoading: false,
            });
            throw err;
        }
    }, [router]);

    /**
     * Logout function
     */
    const logout = useCallback(() => {
        authController.logout();
        setState({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
        });
        setError(null);
        router.push('/');
    }, [router]);

    /**
     * Refresh user data from GET /auth/personal-details
     */
    const refreshUser = useCallback(async () => {
        try {
            const user = await authController.getPersonalDetails();
            setState((prev) => ({ ...prev, user }));
            storage.set('auth_user', user);
        } catch (err) {
            console.error('Failed to refresh user:', err);
            logout();
        }
    }, [logout]);

    const value: AuthContextType = {
        ...state,
        signIn,
        verifyOtp,
        login,
        logout,
        refreshUser,
        error,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
