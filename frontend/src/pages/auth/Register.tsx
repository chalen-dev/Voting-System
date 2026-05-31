// File: src/pages/auth/Register.tsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {showToast} from "../../helpers/swalHelpers.ts";

export default function Register() {
    const { register } = useAuth();
    const navigate = useNavigate();

    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // FIX: Using SyntheticEvent with SubmitEvent to avoid deprecation
    const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement, SubmitEvent>) => {
        e.preventDefault();
        setError(null);
        setIsSubmitting(true);

        try {
            await register(firstName, lastName, email, password);
            showToast('Account created successfully!', 'success');
            navigate('/dashboard');
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Failed to create an account.';
            setError(msg);
            showToast(msg, 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 transition-colors duration-200">
            <div className="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">
                <div className="text-center">
                    <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">Create account</h2>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        Already have an account?{' '}
                        <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400">
                            Sign in instead
                        </Link>
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    {error && (
                        <div className="p-3 text-sm text-red-600 bg-red-50 dark:bg-red-900/30 dark:text-red-400 rounded-lg border border-red-200 dark:border-red-800">
                            {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        <input
                            type="text"
                            placeholder="First Name"
                            className="w-full px-4 py-3 border rounded-lg bg-transparent text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            value={firstName}
                            onChange={(e) => {
                                setFirstName(e.target.value);
                                if (error) setError(null);
                            }}
                            required
                        />
                        <input
                            type="text"
                            placeholder="Last Name"
                            className="w-full px-4 py-3 border rounded-lg bg-transparent text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            value={lastName}
                            onChange={(e) => {
                                setLastName(e.target.value);
                                if (error) setError(null);
                            }}
                            required
                        />
                        <input
                            type="email"
                            placeholder="Email"
                            className="w-full px-4 py-3 border rounded-lg bg-transparent text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            value={email}
                            onChange={(e) => {
                                setEmail(e.target.value);
                                if (error) setError(null);
                            }}
                            required
                        />
                        <input
                            type="password"
                            placeholder="Password"
                            className="w-full px-4 py-3 border rounded-lg bg-transparent text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            value={password}
                            onChange={(e) => {
                                setPassword(e.target.value);
                                if (error) setError(null);
                            }}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-3 text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 rounded-lg transition-all font-semibold shadow-md"
                    >
                        {isSubmitting ? 'Creating account...' : 'Register'}
                    </button>
                </form>
            </div>
        </div>
    );
}