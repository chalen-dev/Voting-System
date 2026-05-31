import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { showConfirmation, showToast } from '../../helpers/swalHelpers';
import { LayoutDashboard, Vote, LogOut, User } from 'lucide-react';

export default function LeftSidebar() {
    const { logout, user } = useAuth();
    const { theme } = useTheme();
    const location = useLocation();
    const isDark = theme === 'dark';

    const handleLogout = async () => {
        const confirmed = await showConfirmation(
            'Confirm Logout',
            `Are you sure you want to sign out, ${user?.first_name}?`,
            isDark,
            'question',
            'Logout'
        );

        if (confirmed) {
            await logout();
            showToast('Logged out.', 'info', isDark);
        }
    };

    const navItems = [
        { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
        { name: 'Polls', path: '/polls', icon: Vote },
    ];

    return (
        <aside className="w-64 flex flex-col bg-[var(--bg-surface)] border-r border-[var(--border-color)] h-[calc(100vh-64px)] sticky top-16 transition-all duration-300">
            {/* Navigation Section */}
            <nav className="flex-1 px-4 py-6 space-y-2">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                                isActive
                                    ? 'bg-brand-600 text-white shadow-lg shadow-indigo-500/20 scale-[1.02]'
                                    : 'text-[var(--text-main)] hover:bg-brand-50 dark:hover:bg-brand-900/10 hover:text-brand-600'
                            }`}
                        >
                            <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                            <span className="font-semibold">{item.name}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* Profile & Logout Section */}
            <div className="p-4 border-t border-[var(--border-color)] space-y-4">

                {/* Profile Card - Locked to theme variables */}
                <div className="flex items-center p-3 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-color)] shadow-sm">
                    <div className="w-10 h-10 rounded-full bg-brand-600 flex items-center justify-center text-white mr-3 shrink-0 shadow-sm">
                        <User size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-[var(--text-heading)] truncate">
                            {user?.first_name || 'User'}
                        </p>
                        <p className="text-[10px] uppercase tracking-wider text-brand-600 dark:text-brand-400 font-black">
                            Voter Account
                        </p>
                    </div>
                </div>

                {/* Sign Out Button */}
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-xl
                               text-rose-600 dark:text-rose-400 font-bold transition-all duration-200
                               border-2 border-rose-100 dark:border-rose-900/30
                               hover:bg-rose-600 hover:text-white dark:hover:bg-rose-500
                               hover:shadow-lg hover:shadow-rose-500/20 active:scale-95"
                >
                    <LogOut size={18} />
                    <span>Sign Out</span>
                </button>
            </div>
        </aside>
    );
}