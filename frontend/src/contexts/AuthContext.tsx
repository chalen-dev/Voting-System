import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// ---------- Types ----------
export interface User {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<User>;
    register: (firstName: string, lastName: string, email: string, password: string) => Promise<User>;
    logout: () => Promise<void>;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ---------- Provider ----------
export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);

    const logout = useCallback(async () => {
        if (token) {
            try {
                await fetch(`${API_URL}/logout`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Accept': 'application/json'
                    }
                });
            } catch (err) {
                console.error("Logout API call failed", err);
            }
        }
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
    }, [token]);

    useEffect(() => {
        const initAuth = async () => {
            if (token) {
                try {
                    const res = await fetch(`${API_URL}/me`, {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Accept': 'application/json'
                        }
                    });

                    if (res.ok) {
                        const userData = await res.json();
                        setUser(userData);
                    } else {
                        // Token might be expired or invalid
                        await logout();
                    }
                } catch (err) {
                    console.error("Auth initialization failed", err);
                    await logout();
                }
            }
            setLoading(false);
        };

        // Handle the floating promise to satisfy linter
        void initAuth();
    }, [token, logout]);

    const login = async (email: string, password: string): Promise<User> => {
        const res = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Login failed');

        localStorage.setItem('token', data.token);
        setToken(data.token);
        setUser(data.user);

        return data.user; // Return user for immediate use in UI (like Toasts)
    };

    const register = async (first_name: string, last_name: string, email: string, password: string): Promise<User> => {
        const res = await fetch(`${API_URL}/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                first_name,
                last_name,
                email,
                password,
                password_confirmation: password
            })
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Registration failed');

        localStorage.setItem('token', data.token);
        setToken(data.token);
        setUser(data.user);

        return data.user;
    };

    const value: AuthContextType = {
        user,
        token,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        loading,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}