// File: src/pages/dashboard/Dashboard.tsx

import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Vote, Users, Archive, Clock, ArrowUpRight, ArrowRight, Loader2 } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { pollApi } from "../../features/poll/pollApi";
import { type Poll, type Option } from "../../features/poll/poll";

export default function Dashboard() {
    const { user } = useAuth();

    // Fetch all polls directly via React Query and your pollApi
    const { data: polls = [], isLoading } = useQuery({
        queryKey: ['polls'],
        queryFn: pollApi.getAll
    });

    // Dynamically calculate our dashboard metrics
    const dashboardData = useMemo(() => {
        const now = new Date();

        let activeCount = 0;
        let closedCount = 0;
        let totalVotes = 0;
        let pendingBallotsCount = 0;

        const recentPolls = [...polls]
            .sort((a, b) => new Date(b.start_time || 0).getTime() - new Date(a.start_time || 0).getTime())
            .slice(0, 3); // Get top 3 newest polls

        polls.forEach((poll: Poll) => {
            // Count Votes
            if (poll.options) {
                totalVotes += poll.options.reduce((sum, opt: Option) => sum + (opt.votes_count || 0), 0);
            }

            // Determine if active
            const start = poll.start_time ? new Date(poll.start_time) : null;
            const end = poll.end_time ? new Date(poll.end_time) : null;

            const isOpen = poll.status === 'open' && (!start || now >= start) && (!end || now <= end);

            if (isOpen) {
                activeCount++;
                // Check if user has voted on this active poll using our Local Storage system
                if (!localStorage.getItem(`voted_poll_${poll.id}`)) {
                    pendingBallotsCount++;
                }
            } else {
                closedCount++;
            }
        });

        return { activeCount, closedCount, totalVotes, pendingBallotsCount, recentPolls };
    }, [polls]);

    const stats = [
        { label: "Active Polls", value: dashboardData.activeCount, icon: Vote, color: "text-brand-600", bg: "bg-brand-50 dark:bg-brand-900/20" },
        { label: "Total Votes Cast", value: dashboardData.totalVotes, icon: Users, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-900/20" },
        // Swapped "Participation" for "Closed Polls" since we don't have total registered users data
        { label: "Archived Polls", value: dashboardData.closedCount, icon: Archive, color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-900/20" },
    ];

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] animate-pulse">
                <Loader2 className="animate-spin text-brand-500 mb-4" size={40} />
                <p className="text-sm font-black uppercase tracking-widest opacity-40">Loading Dashboard...</p>
            </div>
        );
    }

    return (
        <div className="p-8 animate-page space-y-8 max-w-7xl mx-auto">
            {/* Header Section */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black text-[var(--text-heading)] tracking-tight">
                        Dashboard
                    </h1>
                    <p className="text-[var(--text-main)] mt-1 font-medium text-lg">
                        Welcome back, <span className="text-brand-600 dark:text-brand-500 font-bold">{user?.first_name || 'Voter'}</span>!
                    </p>
                </div>

                <div className="flex items-center space-x-2 text-sm font-bold px-4 py-2 bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-2xl text-[var(--text-main)] shadow-sm">
                    <Clock size={16} className="text-brand-600" />
                    <span>Updated just now</span>
                </div>
            </header>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {stats.map((stat, index) => (
                    <div key={index} className="p-6 bg-[var(--bg-surface)] rounded-[2rem] border border-[var(--border-color)] shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                            <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color}`}>
                                <stat.icon size={24} />
                            </div>
                            {stat.value > 0 && (
                                <span className="flex items-center text-emerald-500 text-xs font-bold">
                                    Active <ArrowUpRight size={14} />
                                </span>
                            )}
                        </div>
                        <p className="text-[var(--text-main)] font-semibold text-xs uppercase tracking-widest">{stat.label}</p>
                        <h2 className="text-3xl font-black text-[var(--text-heading)] mt-1">{stat.value}</h2>
                    </div>
                ))}
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Recent Polls */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center justify-between px-2">
                        <h3 className="text-xl font-bold text-[var(--text-heading)]">Recent Polls</h3>
                        <Link to="/polls" className="text-brand-600 dark:text-brand-400 font-bold text-sm hover:underline">
                            View All
                        </Link>
                    </div>

                    <div className="bg-[var(--bg-surface)] rounded-[2rem] border border-[var(--border-color)] overflow-hidden shadow-sm">
                        {dashboardData.recentPolls.length === 0 ? (
                            <div className="p-8 text-center text-[var(--text-main)] opacity-60 font-medium">
                                No polls available yet.
                            </div>
                        ) : (
                            dashboardData.recentPolls.map((poll) => {
                                const isClosed = poll.status === 'closed';

                                return (
                                    <Link
                                        key={poll.id}
                                        to={`/ballot/${poll.id}`}
                                        className="block p-6 border-b border-[var(--border-color)] last:border-0 hover:bg-brand-50/30 dark:hover:bg-brand-900/10 transition-colors cursor-pointer group"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="space-y-1">
                                                <h4 className="font-bold text-[var(--text-heading)] group-hover:text-brand-600 transition-colors">
                                                    {poll.title}
                                                </h4>
                                                <p className="text-xs text-[var(--text-main)]">
                                                    {poll.end_time ? `Ends ${new Date(poll.end_time).toLocaleDateString()}` : 'No deadline'}
                                                    {' • '}
                                                    {poll.options?.reduce((sum, opt) => sum + (opt.votes_count || 0), 0) || 0} votes
                                                </p>
                                            </div>
                                            <div className="flex items-center space-x-3">
                                                {isClosed ? (
                                                    <span className="px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 text-[10px] font-black uppercase">
                                                        Closed
                                                    </span>
                                                ) : (
                                                    <span className="px-3 py-1 rounded-full bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 text-[10px] font-black uppercase">
                                                        Active
                                                    </span>
                                                )}
                                                <ArrowRight size={16} className="text-brand-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Feature CTA */}
                <div className="space-y-4">
                    <h3 className="text-xl font-bold text-[var(--text-heading)] px-2">Action Center</h3>
                    <div className="bg-brand-600 rounded-[2rem] p-8 text-white shadow-xl shadow-brand-500/20 relative overflow-hidden group">
                        <div className="relative z-10">
                            <h4 className="text-2xl font-black italic">MAKE YOUR VOICE HEARD</h4>

                            {dashboardData.pendingBallotsCount > 0 ? (
                                <>
                                    <p className="text-brand-100 text-sm mt-3 leading-relaxed font-medium">
                                        You have <span className="font-black text-white underline decoration-2 underline-offset-4">{dashboardData.pendingBallotsCount} pending ballots</span> that require your immediate attention.
                                    </p>
                                    <Link to="/polls" className="block mt-8">
                                        <button className="w-full py-4 bg-white text-brand-600 font-black rounded-2xl hover:bg-brand-50 transition-all shadow-lg hover:scale-[1.02] active:scale-95">
                                            OPEN BALLOTS
                                        </button>
                                    </Link>
                                </>
                            ) : (
                                <>
                                    <p className="text-brand-100 text-sm mt-3 leading-relaxed font-medium">
                                        You are all caught up! There are currently no pending polls waiting for your vote.
                                    </p>
                                    <Link to="/polls" className="block mt-8">
                                        <button className="w-full py-4 bg-brand-700 text-white font-black rounded-2xl hover:bg-brand-800 transition-all shadow-lg hover:scale-[1.02] active:scale-95">
                                            VIEW ARCHIVE
                                        </button>
                                    </Link>
                                </>
                            )}
                        </div>
                        {/* Decorative background element */}
                        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full group-hover:scale-150 transition-transform duration-700"></div>
                    </div>
                </div>

            </div>
        </div>
    );
}