// File: src/features/poll/PollTabs.tsx

import { type RefObject } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Plus, ChevronDown, ChevronUp, Filter, Lock, Unlock,
    Trash, CheckSquare, AlertCircle, Edit2, Loader2, ExternalLink, Info
} from 'lucide-react';
import { Text } from '../../components/input/Text';
import { Select } from '../../components/input/Select';
import { SearchInput } from '../../components/input/SearchInput';
import { type TabType, type TabConfig } from './poll';

interface PollTabsProps {
    isPanelOpen: boolean;
    setIsPanelOpen: (v: boolean) => void;
    activeTab: TabType;
    setActiveTab: (v: TabType) => void;

    editingPollId: string | null;
    pollTitle: string;
    setPollTitle: (v: string) => void;
    startDate: string;
    setStartDate: (v: string) => void;
    endDate: string;
    setEndDate: (v: string) => void;
    pollStatus: string;
    setPollStatus: (v: string) => void;
    errorMessage: string;
    setErrorMessage: (v: string) => void;
    handleClearForm: () => void;
    handleCreatePoll: () => void;
    handleUpdatePoll: () => void;

    titleInputRef: RefObject<HTMLInputElement | null>;
    isSubmitting: boolean;

    // NEW: poll id that was just created
    justCreatedPollId: string | null;
    onManageOptions: () => void;
    
    searchText: string;
    setSearchText: (v: string) => void;
    statusFilter: string;
    setStatusFilter: (v: string) => void;
    sortFilter: string;
    setSortFilter: (v: string) => void;

    selectedIds: string[];
    handleBulkStatusChange: (status: 'open' | 'closed') => void;
    handleBulkDelete: () => void;
}

export default function PollTabs({
    isPanelOpen, setIsPanelOpen, activeTab, setActiveTab,
    editingPollId, pollTitle, setPollTitle, startDate, setStartDate, endDate, setEndDate,
    pollStatus, setPollStatus, errorMessage, setErrorMessage, handleClearForm,
    handleCreatePoll, handleUpdatePoll, titleInputRef, isSubmitting,
    justCreatedPollId, onManageOptions,
    searchText, setSearchText, statusFilter, setStatusFilter, sortFilter, setSortFilter,
    selectedIds, handleBulkStatusChange, handleBulkDelete
}: PollTabsProps) {

    const navigate = useNavigate();

    const tabs: TabConfig[] = [
        { id: 'form', label: editingPollId ? 'Edit' : 'Create', icon: editingPollId ? Edit2 : Plus },
        { id: 'filter', label: 'Filter', icon: Filter },
        { id: 'action', label: 'Actions', icon: CheckSquare },
    ];

    const showManageOptions = !!(editingPollId || justCreatedPollId);
    const manageTargetId = editingPollId || justCreatedPollId;
    const showTitleHint = !editingPollId && !justCreatedPollId && pollTitle.trim().length > 0;

    return (
        <section className="bg-[var(--bg-surface)] rounded-3xl border border-[var(--border-color)] shadow-sm overflow-hidden transition-all duration-300">
            <div className="flex items-center justify-between px-6 py-2 border-b border-[var(--border-color)] bg-[var(--bg-main)]/30">
                <div className="flex gap-1">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => { setActiveTab(tab.id); setIsPanelOpen(true); }}
                            className={`flex items-center gap-2 px-4 py-3 text-xs font-black uppercase tracking-widest transition-all border-b-2 ${
                                activeTab === tab.id
                                    ? 'border-brand-600 text-brand-600'
                                    : 'border-transparent text-[var(--text-main)] opacity-50 hover:opacity-100'
                            }`}
                        >
                            <tab.icon size={14} />
                            {tab.label}
                        </button>
                    ))}
                </div>
                <button
                    onClick={() => setIsPanelOpen(!isPanelOpen)}
                    className="p-2 text-[var(--text-main)] hover:bg-[var(--bg-main)] rounded-xl transition-all"
                >
                    {isPanelOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </button>
            </div>

            <div className={`transition-all duration-300 ${isPanelOpen ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'} overflow-hidden`}>
                <div className="p-8">

                    {activeTab === 'form' && (
                        <div className="flex flex-col gap-6 animate-in slide-in-from-left-4 duration-300">

                            {/* Edit mode banner */}
                            {editingPollId && (
                                <div className="flex items-center gap-3 p-4 bg-brand-500/10 border border-brand-500/20 text-brand-600 rounded-2xl text-sm font-bold">
                                    <Info size={18} />
                                    <span>Edit Mode Active: You are modifying an existing poll. Changes will overwrite current data.</span>
                                </div>
                            )}

                            {/* Just created banner */}
                            {justCreatedPollId && (
                                <div className="flex items-center gap-3 p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 rounded-2xl text-sm font-bold animate-in fade-in zoom-in duration-200">
                                    <Info size={18} />
                                    <span>Poll initialized! Click <strong>Manage Options</strong> to add choices and images.</span>
                                </div>
                            )}

                            {errorMessage && (
                                <div className="flex items-center gap-3 p-4 bg-rose-500/10 border border-rose-500/20 text-rose-600 rounded-2xl text-sm font-bold">
                                    <AlertCircle size={18} />
                                    <span>{errorMessage}</span>
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                <div className="md:col-span-4">
                                    <Text
                                        ref={titleInputRef}
                                        name="pollTitle"
                                        label="Poll Title"
                                        placeholder="e.g., Budget Approval 2026"
                                        value={pollTitle}
                                        onChange={(e) => {
                                            setPollTitle(e.target.value);
                                            if (errorMessage) setErrorMessage('');
                                        }}
                                        inputClassName={`w-full px-5 py-4 rounded-2xl bg-[var(--bg-main)] border focus:ring-brand-500/20 ${
                                            errorMessage && !pollTitle.trim() ? 'border-rose-500' : 'border-[var(--border-color)]'
                                        }`}
                                    />
                                    {/* Hint: shown only while typing before first submit */}
                                    {showTitleHint && (
                                        <p className="mt-2 text-xs text-[var(--text-main)] opacity-50 font-medium">
                                            Click <strong>Initialize</strong> first — then you can manage options for this poll.
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <Text
                                        type="datetime-local"
                                        name="startDate"
                                        label="Start Time"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        inputClassName="w-full px-5 py-4 rounded-2xl bg-[var(--bg-main)] border-[var(--border-color)] focus:ring-brand-500/20"
                                    />
                                </div>
                                <div>
                                    <Text
                                        type="datetime-local"
                                        name="endDate"
                                        label="End Time"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        inputClassName="w-full px-5 py-4 rounded-2xl bg-[var(--bg-main)] border-[var(--border-color)] focus:ring-brand-500/20"
                                    />
                                </div>
                                <div>
                                    {/* FIX 2: Closed is now first — default selection is Closed */}
                                    <Select
                                        name="pollStatus"
                                        label={editingPollId ? 'Status' : 'Initial Status'}
                                        value={pollStatus}
                                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setPollStatus(e.target.value)}
                                        options={[
                                            { value: 'closed', label: 'Closed' },
                                            { value: 'open', label: 'Open' },
                                        ]}
                                        selectClassName="w-full pl-5 pr-12 py-4 rounded-2xl bg-[var(--bg-main)] border-[var(--border-color)] focus:ring-brand-500/20"
                                    />
                                </div>

                                <div className="md:col-span-4 flex flex-col md:flex-row items-center gap-4 mt-2 pt-6 border-t border-[var(--border-color)]/50">
                                    {/* Manage Options: shown after create OR during edit */}
                                    {showManageOptions && (
                                        <button
                                            onClick={() => {
                                                onManageOptions();
                                                navigate(`/polls/${manageTargetId}/manage`);
                                            }}
                                            disabled={isSubmitting}
                                            className="w-full md:flex-1 flex items-center justify-center gap-2 bg-brand-500/10 text-brand-600 font-black py-4 rounded-2xl hover:bg-brand-500/20 active:scale-95 transition-all disabled:opacity-50"
                                        >
                                            <ExternalLink size={18} /> MANAGE OPTIONS
                                        </button>
                                    )}

                                    {/* Cancel: only in edit mode */}
                                    {editingPollId && (
                                        <button
                                            onClick={handleClearForm}
                                            disabled={isSubmitting}
                                            className="w-full md:flex-1 bg-slate-500/10 text-slate-600 font-black py-4 rounded-2xl hover:bg-slate-500/20 active:scale-95 transition-all disabled:opacity-50"
                                        >
                                            CANCEL
                                        </button>
                                    )}

                                    <button
                                        onClick={editingPollId ? handleUpdatePoll : handleCreatePoll}
                                        disabled={isSubmitting}
                                        className={`w-full ${showManageOptions ? 'md:flex-1' : ''} flex items-center justify-center gap-2 bg-brand-600 text-white font-black py-4 rounded-2xl shadow-lg shadow-brand-500/20 active:scale-95 transition-all disabled:opacity-70 disabled:cursor-not-allowed`}
                                    >
                                        {isSubmitting ? (
                                            <><Loader2 size={18} className="animate-spin" /><span>PROCESSING...</span></>
                                        ) : (
                                            editingPollId ? 'SAVE CHANGES' : 'INITIALIZE'
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'filter' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-bottom-2 duration-300">
                            <div className="md:col-span-2">
                                <SearchInput value={searchText} onChange={setSearchText} label="Keyword Search" placeholder="Filter by title or ID..." />
                            </div>
                            <div>
                                <Select
                                    name="status" label="Status" value={statusFilter}
                                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setStatusFilter(e.target.value)}
                                    options={[{ value: 'all', label: 'All Statuses' }, { value: 'open', label: 'Open' }, { value: 'closed', label: 'Closed' }]}
                                    selectClassName="w-full pl-5 pr-12 py-4 rounded-2xl bg-[var(--bg-main)] border-[var(--border-color)] focus:ring-brand-500/20"
                                />
                            </div>
                            <div>
                                <Select
                                    name="sort" label="Sort By" value={sortFilter}
                                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSortFilter(e.target.value)}
                                    options={[{ value: 'newest', label: 'Newest First' }, { value: 'oldest', label: 'Oldest First' }]}
                                    selectClassName="w-full pl-5 pr-12 py-4 rounded-2xl bg-[var(--bg-main)] border-[var(--border-color)] focus:ring-brand-500/20"
                                />
                            </div>
                        </div>
                    )}

                    {activeTab === 'action' && (
                        <div className="flex flex-col md:flex-row items-center gap-4 animate-in slide-in-from-right-4 duration-300">
                            <div className="flex-1">
                                <h3 className="text-lg font-bold text-[var(--text-heading)]">
                                    {selectedIds.length > 0 ? `${selectedIds.length} Polls Selected` : 'No Selection'}
                                </h3>
                                <p className="text-sm text-[var(--text-main)] opacity-70">Perform bulk modifications on selected records.</p>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <button onClick={() => handleBulkStatusChange('open')} disabled={!selectedIds.length || isSubmitting}
                                    className="flex items-center gap-2 px-6 py-4 bg-emerald-500/10 text-emerald-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-600 hover:text-white disabled:opacity-30 transition-all border border-emerald-500/20">
                                    <Unlock size={14} /> Open
                                </button>
                                <button onClick={() => handleBulkStatusChange('closed')} disabled={!selectedIds.length || isSubmitting}
                                    className="flex items-center gap-2 px-6 py-4 bg-amber-500/10 text-amber-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-amber-600 hover:text-white disabled:opacity-30 transition-all border border-amber-500/20">
                                    <Lock size={14} /> Closed
                                </button>
                                <button onClick={handleBulkDelete} disabled={!selectedIds.length || isSubmitting}
                                    className="flex items-center gap-2 px-6 py-4 bg-rose-500/10 text-rose-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-rose-600 hover:text-white disabled:opacity-30 transition-all border border-rose-500/20">
                                    <Trash size={14} /> Delete
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}