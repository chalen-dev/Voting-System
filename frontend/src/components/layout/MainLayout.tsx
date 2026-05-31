import { Outlet } from 'react-router-dom';
import LeftSidebar from './LeftSidebar';

export default function MainLayout() {
    return (
        <div className="flex min-h-[calc(100vh-64px)] bg-[var(--bg-main)] transition-colors duration-200">
            {/* Sidebar stays fixed on the left */}
            <LeftSidebar />

            {/* Outlet renders the specific page (Dashboard, Polls, etc.) */}
            <main className="flex-1 overflow-y-auto">
                <Outlet />
            </main>
        </div>
    );
}