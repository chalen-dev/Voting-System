// File: src/pages/ballot/Ballot.tsx

import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Check, Loader2, AlertCircle, Info, ArrowLeft, Lock, Clock, Calendar } from 'lucide-react';
import { useBallot } from '../../features/poll/hooks/useBallot';
import { showConfirmation } from '../../helpers/swalHelpers';
import { type Poll, type Option } from '../../features/poll/poll';

// 1. Extend the Poll type to include the missing description property
interface ExtendedPoll extends Poll {
    description?: string | null;
}

export default function Ballot() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { poll, isLoading, castVote } = useBallot(id);

    // 2. Cast using the new ExtendedPoll interface
    const typedPoll = poll as ExtendedPoll | undefined;

    const [selectedOption, setSelectedOption] = useState<number | null>(null);

    // Time-based Logic
    const pollStatus = useMemo(() => {
        if (!typedPoll) return null;

        const now = new Date();
        const start = typedPoll.start_time ? new Date(typedPoll.start_time) : null;
        const end = typedPoll.end_time ? new Date(typedPoll.end_time) : null;

        if (typedPoll.status === 'closed') return 'MANUALLY_CLOSED';
        if (start && now < start) return 'NOT_STARTED';
        if (end && now > end) return 'EXPIRED';

        return 'OPEN';
    }, [typedPoll]);

    const handleVoteSubmit = async () => {
        if (!selectedOption || !typedPoll) return;

        const selectedValue = typedPoll.options?.find((o: Option) => o.id === selectedOption)?.value;

        const confirm = await showConfirmation(
            'Confirm Your Vote',
            `Are you sure you want to vote for "${selectedValue}"?`,
            true,
            'question',
            'Cast Vote'
        );

        if (confirm) {
            await castVote.mutateAsync(selectedOption);
        }
    };

    // UI: Loading State
    if (isLoading) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] animate-pulse">
            <Loader2 className="animate-spin text-brand-500 mb-4" size={40} />
            <p className="text-sm font-black uppercase tracking-widest opacity-40">Loading Ballot...</p>
        </div>
    );

    // UI: Not Found State
    if (!typedPoll) return (
        <div className="max-w-md mx-auto mt-20 p-8 bg-rose-500/5 border border-rose-500/20 rounded-3xl text-center">
            <AlertCircle className="mx-auto text-rose-500 mb-4" size={48} />
            <h2 className="text-xl font-bold text-rose-500">Poll Not Found</h2>
            <p className="text-sm opacity-70 mt-2">The link might be broken or the poll was deleted.</p>
            <button onClick={() => navigate('/')} className="mt-6 text-sm font-bold underline">Home</button>
        </div>
    );

    // UI: Not Started Yet
    if (pollStatus === 'NOT_STARTED') return (
        <div className="max-w-md mx-auto mt-20 p-8 bg-brand-500/5 border border-brand-500/20 rounded-3xl text-center">
            <Calendar className="mx-auto text-brand-500 mb-4" size={48} />
            <h2 className="text-xl font-bold text-brand-500">Not Started</h2>
            <p className="text-sm opacity-70 mt-2">
                This poll is scheduled to open on: <br/>
                <span className="font-bold">{new Date(typedPoll.start_time!).toLocaleString()}</span>
            </p>
        </div>
    );

    // UI: Ended / Expired / Manually Closed
    if (pollStatus === 'EXPIRED' || pollStatus === 'MANUALLY_CLOSED') return (
        <div className="max-w-md mx-auto mt-20 p-8 bg-amber-500/5 border border-amber-500/20 rounded-3xl text-center">
            <Lock className="mx-auto text-amber-500 mb-4" size={48} />
            <h2 className="text-xl font-bold text-amber-500">Voting Finished</h2>
            <p className="text-sm opacity-70 mt-2">
                {pollStatus === 'EXPIRED' ? 'The deadline for this poll has passed.' : 'This poll has been closed by the creator.'}
            </p>
            <button onClick={() => navigate('/')} className="mt-6 text-sm font-bold underline">Go Back</button>
        </div>
    );

    // UI: Normal Voting State
    return (
        <div className="max-w-3xl mx-auto p-6 space-y-8 animate-page-in">
            {/* Header */}
            <div className="space-y-4">
                <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-xs font-black uppercase opacity-50 hover:opacity-100 transition-opacity">
                    <ArrowLeft size={14} /> Back
                </button>
                <div className="bg-brand-500/10 border border-brand-500/20 p-6 rounded-3xl">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-0.5 bg-brand-500 text-[10px] font-black uppercase text-white rounded-full">Live Now</span>
                        {typedPoll.end_time && (
                            <span className="text-[10px] opacity-50 flex items-center gap-1 uppercase font-bold">
                                <Clock size={10} /> Ends {new Date(typedPoll.end_time).toLocaleDateString()}
                            </span>
                        )}
                    </div>
                    <h1 className="text-3xl font-black text-[var(--text-heading)]">{typedPoll.title}</h1>

                    {/* 3. Description now renders without TS errors */}
                    {typedPoll.description && (
                        <p className="text-sm opacity-60 mt-2">{typedPoll.description}</p>
                    )}
                </div>
            </div>

            {/* Options Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {typedPoll.options?.map((option: Option) => {
                    const isSelected = selectedOption === option.id;
                    return (
                        <button
                            key={option.id}
                            onClick={() => setSelectedOption(option.id)}
                            className={`relative flex flex-col text-left p-2 rounded-2xl border-2 transition-all duration-300
                                ${isSelected ? 'border-brand-500 bg-brand-500/5 ring-4 ring-brand-500/10' : 'border-[var(--border-color)] bg-[var(--bg-surface)] hover:border-brand-500/50'}`}
                        >
                            <div className="aspect-video w-full rounded-xl bg-[var(--bg-main)] overflow-hidden border border-[var(--border-color)] flex items-center justify-center">
                                {option.image_url ? (
                                    <img src={option.image_url} alt="" className="w-full h-full object-cover" />
                                ) : (
                                    <Info className="opacity-10" size={40} />
                                )}
                            </div>
                            <div className="p-4 flex items-center justify-between">
                                <span className="font-bold text-lg">{option.value}</span>
                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${isSelected ? 'bg-brand-500 border-brand-500' : 'border-[var(--border-color)]'}`}>
                                    {isSelected && <Check size={14} className="text-white" />}
                                </div>
                            </div>
                        </button>
                    );
                })}
            </div>

            {/* Sticky Action Bar */}
            <div className="sticky bottom-8 bg-[var(--bg-surface)] border border-[var(--border-color)] p-4 rounded-2xl shadow-2xl flex items-center justify-between gap-6">
                <div className="hidden sm:block">
                    <p className="text-xs font-black uppercase opacity-40">Your Selection</p>
                    <p className="font-bold truncate">{selectedOption ? typedPoll.options?.find(o => o.id === selectedOption)?.value : 'None picked'}</p>
                </div>
                <button
                    onClick={handleVoteSubmit}
                    disabled={!selectedOption || castVote.isPending}
                    className="flex-1 sm:flex-none px-8 py-4 bg-brand-600 hover:bg-brand-700 disabled:bg-gray-500 text-white font-black rounded-xl shadow-lg transition-all flex items-center justify-center gap-3"
                >
                    {castVote.isPending ? <Loader2 className="animate-spin" size={20} /> : 'Confirm Vote'}
                </button>
            </div>
        </div>
    );
}