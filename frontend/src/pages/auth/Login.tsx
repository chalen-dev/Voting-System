// File: src/pages/auth/Login.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth, type User } from '../../contexts/AuthContext'; // Added User type import
import { useTheme } from '../../contexts/ThemeContext';
import { Text } from '../../components/input/Text';
import { Password } from '../../components/input/Password';
import { showToast } from "../../helpers/swalHelpers.ts";

export default function Login() {
    const { login, isAuthenticated, loading: authLoading } = useAuth();
    const { theme } = useTheme();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const isDark = theme === 'dark';

    useEffect(() => {
        if (isAuthenticated && !authLoading) {
            navigate('/dashboard');
        }
    }, [isAuthenticated, authLoading, navigate]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (error) setError(null);
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        try {
            // Capture the user returned from the login function
            const loggedInUser: User = await login(formData.email, formData.password);

            // Personalized welcome message
            showToast(`Welcome, ${loggedInUser.first_name}!`, 'success', isDark);

            navigate('/dashboard');
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Invalid email or password.';
            setError(msg);
            showToast(msg, 'error', isDark);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (authLoading) return null;

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 py-12 transition-colors duration-200">
            <div className="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 animate-page">
                <div className="text-center">
                    <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">Welcome Back</h2>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        Don't have an account?{' '}
                        <Link to="/register" className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400">
                            Register here
                        </Link>
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <Text
                            label="Email Address"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                        <Password
                            label="Password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    {error && (
                        <div className="p-3 text-sm text-red-600 bg-red-50 dark:bg-red-900/30 dark:text-red-400 rounded-lg border border-red-200 dark:border-red-800">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-3 text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 rounded-lg disabled:opacity-50 transition-all font-semibold shadow-lg"
                    >
                        {isSubmitting ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>
            </div>
        </div>
    );
}