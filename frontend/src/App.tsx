// File: src/App.tsx
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Header from './components/layout/Header';
import MainLayout from './components/layout/MainLayout';
import ProtectedRoute from './components/routes/ProtectedRoute';
import GuestRoute from './components/routes/GuestRoute';

// Components
import LoadingScreen from './components/ui/LoadingScreen';

// Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/dashboard/Dashboard';
import PollList from './pages/polls/PollList.tsx';
import PollOptionsManager from './pages/pollOptionsManager/PollOptionsManager.tsx';
import Ballot from './pages/ballot/Ballot';

export default function App() {
    const { isAuthenticated, loading } = useAuth();

    if (loading) return <LoadingScreen />;

    return (
        <div className="min-h-screen flex flex-col">
            <Header />

            <Routes>
                {/* ROOT REDIRECT */}
                <Route path="/" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} />

                {/* PUBLIC ROUTES
                    Accessible by anyone (Guests + Auth Users)
                */}
                <Route path="/p/:id" element={<Ballot />} />

                {/* GUEST ONLY ROUTES
                    Redirects to dashboard if already logged in
                */}
                <Route element={<GuestRoute />}>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                </Route>

                {/* PROTECTED ROUTES
                    Redirects to login if not authenticated
                */}
                <Route element={<ProtectedRoute />}>
                    <Route element={<MainLayout />}>
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/polls" element={<PollList />} />
                        <Route path="/polls/:pollId/manage" element={<PollOptionsManager />} />
                        {/* Internal ballot access if needed */}
                        <Route path="/ballot/:id" element={<Ballot />} />
                    </Route>
                </Route>

                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </div>
    );
}