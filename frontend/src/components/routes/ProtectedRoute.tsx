// src/components/common/ProtectedRoute.tsx
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export default function ProtectedRoute() {
    const { isAuthenticated, loading } = useAuth();

    if (loading) return <div className="p-8 text-center">Loading...</div>;
    return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}