// src/components/common/GuestRoute.tsx
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export default function GuestRoute() {
    const { isAuthenticated, loading } = useAuth();

    if (loading) return <div className="p-8 text-center">Loading...</div>;
    return isAuthenticated ? <Navigate to="/dashboard" replace /> : <Outlet />;
}