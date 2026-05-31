// File: src/features/poll/PollTable.tsx

import { Edit2, ExternalLink, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { type Poll } from './poll';

interface PollTableProps {
    isLoading: boolean;
    filteredPolls: Poll[];
    selectedIds: string[];
    setSelectedIds: (ids: string[]) => void;
    toggleSelect: (id: string) => void;
    handleEditClick: (poll: Poll) => void;
    handleDelete: (id: string) => void;
}

export default function PollTable({
    isLoading,
    filteredPolls,
    selectedIds,
    setSelectedIds,
    toggleSelect,
    handleEditClick,
    handleDelete,
}: PollTableProps) {
    const navigate = useNavigate();

    return (
        <section className="space-y-4">
            <div className="bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-3xl overflow-hidden shadow-sm">
                {isLoading ? (
                    <div className="p-8 text-center text-sm font-bold opacity-50 uppercase tracking-widest">
                        Loading Polls...
                    </div>
                ) : (
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-[var(--border-color)] bg-[var(--bg-main)]/50">
                                <th className="px-6 py-5 w-10">
                                    <input
                                        type="checkbox"
                                        className="w-5 h-5 rounded border-[var(--border-color)] text-brand-600 focus:ring-brand-500/20 cursor-pointer"
                                        onChange={(e) =>
                                            setSelectedIds(e.target.checked ? filteredPolls.map(p => p.id) : [])
                                        }
                                        checked={filteredPolls.length > 0 && selectedIds.length === filteredPolls.length}
                                    />
                                </th>
                                <th className="px-6 py-5 text-xs font-black uppercase tracking-widest text-[var(--text-main)]">Identification</th>
                                <th className="px-6 py-5 text-xs font-black uppercase tracking-widest text-[var(--text-main)]">Options</th>
                                <th className="px-6 py-5 text-xs font-black uppercase tracking-widest text-[var(--text-main)]">Status</th>
                                <th className="px-6 py-5 text-xs font-black uppercase tracking-widest text-[var(--text-main)] text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--border-color)]">
                            {filteredPolls.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-10 text-center opacity-50 text-sm">
                                        No polls found. Create one above!
                                    </td>
                                </tr>
                            ) : filteredPolls.map((poll) => (
                                <tr
                                    key={poll.id}
                                    className={`hover:bg-brand-500/5 transition-colors group ${selectedIds.includes(poll.id) ? 'bg-brand-500/[0.03]' : ''}`}
                                >
                                    {/* Checkbox */}
                                    <td className="px-6 py-6">
                                        <input
                                            type="checkbox"
                                            checked={selectedIds.includes(poll.id)}
                                            onChange={() => toggleSelect(poll.id)}
                                            className="w-5 h-5 rounded border-[var(--border-color)] text-brand-600 cursor-pointer"
                                        />
                                    </td>

                                    {/* Title + date */}
                                    <td
                                        className="px-6 py-6 font-bold text-[var(--text-heading)] group-hover:text-brand-600 cursor-pointer transition-colors"
                                        onClick={() => handleEditClick(poll)}
                                    >
                                        {poll.title}
                                        <div className="text-[10px] opacity-40 font-medium uppercase tracking-tighter mt-1">
                                            {poll.start_time ? new Date(poll.start_time).toLocaleDateString() : 'N/A'} to {poll.end_time ? new Date(poll.end_time).toLocaleDateString() : 'N/A'}
                                        </div>
                                    </td>

                                    {/* Options with image previews */}
                                    <td className="px-6 py-6">
                                        {poll.options && poll.options.length > 0 ? (
                                            <div className="flex flex-wrap gap-2">
                                                {poll.options.map((option) => (
                                                    <div
                                                        key={option.id}
                                                        className="flex items-center gap-1.5 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-xl px-2 py-1"
                                                    >
                                                        {option.image_url ? (
                                                            <img
                                                                src={option.image_url}
                                                                alt={option.value}
                                                                className="w-6 h-6 rounded-lg object-cover flex-shrink-0"
                                                            />
                                                        ) : (
                                                            <div className="w-6 h-6 rounded-lg bg-[var(--border-color)] flex-shrink-0" />
                                                        )}
                                                        <span className="text-xs font-medium text-[var(--text-main)] max-w-[80px] truncate">
                                                            {option.value}
                                                        </span>
                                                        {option.votes_count !== undefined && (
                                                            <span className="text-[10px] font-black text-brand-600">
                                                                {option.votes_count}
                                                            </span>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <span className="text-xs opacity-40">No options</span>
                                        )}
                                    </td>

                                    {/* Status badge */}
                                    <td className="px-6 py-6">
                                        <span className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase border ${
                                            poll.status === 'open'
                                                ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                                                : 'bg-slate-500/10 text-slate-500 border-slate-500/20'
                                        }`}>
                                            {poll.status}
                                        </span>
                                    </td>

                                    {/* Action buttons */}
                                    <td className="px-6 py-6 text-right">
                                        <div className="flex justify-end gap-1">
                                            <button
                                                onClick={() => handleEditClick(poll)}
                                                className="p-2.5 hover:bg-amber-500 hover:text-white rounded-xl text-amber-600 transition-all active:scale-90"
                                                title="Edit Poll Details"
                                            >
                                                <Edit2 size={18} />
                                            </button>
                                            <button
                                                onClick={() => navigate(`/polls/${poll.id}/manage`)}
                                                className="p-2.5 hover:bg-brand-600 hover:text-white rounded-xl text-brand-600 transition-all active:scale-90"
                                                title="Manage Poll Options"
                                            >
                                                <ExternalLink size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(poll.id)}
                                                className="p-2.5 hover:bg-rose-500 hover:text-white rounded-xl text-rose-600 transition-all active:scale-90"
                                                title="Delete Poll"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </section>
    );
}