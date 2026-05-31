// File: src/pages/polls/PollList.tsx

import { useState, useMemo, useRef } from 'react';
import axios from 'axios';
import { showConfirmation, showClickableToast } from '../../helpers/swalHelpers';
import { type Poll, type TabType, formatForDateTimeInput, formatForApi } from '../../features/poll/poll';
import { usePolls, usePollMutations } from '../../features/poll/hooks/usePollQueries';

import PollTabs from '../../features/poll/PollTabs';
import PollTable from '../../features/poll/PollTable';
import Pagination from '../../components/navigation/Pagination';

export default function PollList() {
    const titleInputRef = useRef<HTMLInputElement>(null);

    // --- UI State ---
    const [isPanelOpen, setIsPanelOpen] = useState(true);
    const [activeTab, setActiveTab] = useState<TabType>('form');
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    // --- Pagination State ---
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // --- Form States ---
    const [editingPollId, setEditingPollId] = useState<string | null>(
        sessionStorage.getItem('editingPollId'));
    const [pollTitle, setPollTitle] = useState(
        sessionStorage.getItem('editingPollTitle') || '');
    const [startDate, setStartDate] = useState(
        sessionStorage.getItem('editingStartDate') || '');
    const [endDate, setEndDate] = useState(
        sessionStorage.getItem('editingEndDate') || '');
    // FIX 2: Default status is now 'closed'
    const [pollStatus, setPollStatus] = useState(
        sessionStorage.getItem('editingPollStatus') || 'closed');
    const [errorMessage, setErrorMessage] = useState('');

    // FIX 1: Track the last created poll so Manage Options appears right after init
    const [justCreatedPollId, setJustCreatedPollId] = useState<string | null>(null);

    // --- Filter States ---
    const [searchText, setSearchText] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [sortFilter, setSortFilter] = useState('newest');

    // --- TanStack Query ---
    const { data: polls = [], isLoading } = usePolls();
    const {
        createMutation,
        updateMutation,
        deleteMutation,
        bulkStatusMutation,
        bulkDeleteMutation
    } = usePollMutations();

    // --- Filter Handlers ---
    const handleSearchChange = (val: string) => { setSearchText(val); setCurrentPage(1); };
    const handleStatusFilterChange = (val: string) => { setStatusFilter(val); setCurrentPage(1); };
    const handleSortFilterChange = (val: string) => { setSortFilter(val); setCurrentPage(1); };

    const handleClearForm = () => {
        setEditingPollId(null);
        setJustCreatedPollId(null);
        setPollTitle('');
        setStartDate('');
        setEndDate('');
        setPollStatus('closed'); // reset to closed
        setErrorMessage('');
        sessionStorage.removeItem('editingPollId');
        sessionStorage.removeItem('editingPollTitle');
        sessionStorage.removeItem('editingStartDate');
        sessionStorage.removeItem('editingEndDate');
        sessionStorage.removeItem('editingPollStatus');
    };

    const handleEditClick = (poll: Poll) => {
        setJustCreatedPollId(null); // clear any post-create state
        setEditingPollId(poll.id);
        setPollTitle(poll.title);
        setStartDate(formatForDateTimeInput(poll.start_time));
        setEndDate(formatForDateTimeInput(poll.end_time));
        setPollStatus(poll.status);
        setActiveTab('form');
        setIsPanelOpen(true);
        sessionStorage.setItem('editingPollId', poll.id);
        sessionStorage.setItem('editingPollTitle', poll.title);
        sessionStorage.setItem('editingStartDate', formatForDateTimeInput(poll.start_time));
        sessionStorage.setItem('editingEndDate', formatForDateTimeInput(poll.end_time));
        sessionStorage.setItem('editingPollStatus', poll.status);
        showClickableToast(
            'Edit Mode Active',
            poll.title,
            () => {
                titleInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                setTimeout(() => { titleInputRef.current?.focus(); }, 500);
            }
        );
    };

    const toggleSelect = (id: string) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    const handleMutationError = (error: unknown, fallback: string) => {
        if (axios.isAxiosError(error)) {
            setErrorMessage(error.response?.data?.message || fallback);
        } else {
            setErrorMessage(fallback);
        }
    };

    // --- Mutation Handlers ---
    const handleCreatePoll = () => {
        setErrorMessage('');
        if (!pollTitle.trim()) return setErrorMessage('Please provide a poll title.');
        createMutation.mutate({
            title: pollTitle,
            start_time: formatForApi(startDate),
            end_time: formatForApi(endDate),
            status: pollStatus,
        }, {
            onSuccess: (createdPoll) => {
                // Keep form filled and switch directly to edit mode
                // so user can see what was created and make changes
                setEditingPollId(createdPoll.id);
                setJustCreatedPollId(createdPoll.id);
                setErrorMessage('');
                sessionStorage.setItem('editingPollId', createdPoll.id);
                sessionStorage.setItem('editingPollTitle', pollTitle);
                sessionStorage.setItem('editingStartDate', startDate);
                sessionStorage.setItem('editingEndDate', endDate);
                sessionStorage.setItem('editingPollStatus', pollStatus);
            },
            onError: (err) => handleMutationError(err, 'Failed to create poll.')
        });
    };

    const handleUpdatePoll = () => {
        if (!editingPollId) return;
        setErrorMessage('');
        updateMutation.mutate({
            id: editingPollId,
            payload: {
                title: pollTitle,
                start_time: formatForApi(startDate),
                end_time: formatForApi(endDate),
                status: pollStatus,
            }
        }, {
            onSuccess: handleClearForm,
            onError: (err) => handleMutationError(err, 'Failed to update poll.')
        });
    };

    const handleDelete = async (id: string) => {
        const isConfirmed = await showConfirmation('Delete Poll', 'Are you sure?', false, 'warning', 'Yes, delete it');
        if (!isConfirmed) return;
        deleteMutation.mutate(id, {
            onSuccess: () => {
                if (editingPollId === id) handleClearForm();
                if (justCreatedPollId === id) setJustCreatedPollId(null);
                if (paginatedPolls.length === 1 && currentPage > 1) setCurrentPage(prev => prev - 1);
            }
        });
    };

    const handleBulkStatusChange = (status: 'open' | 'closed') => {
        bulkStatusMutation.mutate({ ids: selectedIds, status }, { onSuccess: () => setSelectedIds([]) });
    };

    const handleBulkDelete = async () => {
        // First confirmation — yellow warning
        const firstConfirm = await showConfirmation(
            '⚠️ Warning',
            `You are about to delete ${selectedIds.length} poll${selectedIds.length > 1 ? 's' : ''}. Are you sure you want to proceed?`,
            false, 'warning', 'Yes, proceed'
        );
        if (!firstConfirm) return;

        // Second confirmation — red danger
        const secondConfirm = await showConfirmation(
            '🗑️ Final Warning',
            `This will permanently delete ${selectedIds.length} poll${selectedIds.length > 1 ? 's' : ''} and remove ALL votes and options associated with them. This cannot be undone.`,
            false, 'error', `Yes, delete ${selectedIds.length} poll${selectedIds.length > 1 ? 's' : ''}`
        );
        if (!secondConfirm) return;

    bulkDeleteMutation.mutate(selectedIds, {
        onSuccess: () => {
            if (selectedIds.includes(editingPollId || '')) handleClearForm();
            if (justCreatedPollId && selectedIds.includes(justCreatedPollId)) setJustCreatedPollId(null);
            setSelectedIds([]);
            setCurrentPage(1);
        }
    });
};
    // --- Filtering Logic ---
    const filteredPolls = useMemo(() => {
        return polls
            .filter((poll) => {
                const matchesSearch = poll.title.toLowerCase().includes(searchText.toLowerCase()) || poll.id.toLowerCase().includes(searchText.toLowerCase());
                const matchesStatus = statusFilter === 'all' || poll.status === statusFilter;
                return matchesSearch && matchesStatus;
            })
            .sort((a, b) => {
                const dateA = a.start_time ? new Date(a.start_time).getTime() : 0;
                const dateB = b.start_time ? new Date(b.start_time).getTime() : 0;
                return sortFilter === 'newest' ? dateB - dateA : dateA - dateB;
            });
    }, [polls, searchText, statusFilter, sortFilter]);

    const totalPages = Math.ceil(filteredPolls.length / itemsPerPage);
    const paginatedPolls = filteredPolls.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8 animate-page">
            <PollTabs
                isPanelOpen={isPanelOpen}
                setIsPanelOpen={setIsPanelOpen}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                editingPollId={editingPollId}
                pollTitle={pollTitle}
                setPollTitle={setPollTitle}
                startDate={startDate}
                setStartDate={setStartDate}
                endDate={endDate}
                setEndDate={setEndDate}
                pollStatus={pollStatus}
                setPollStatus={setPollStatus}
                errorMessage={errorMessage}
                setErrorMessage={setErrorMessage}
                handleClearForm={handleClearForm}
                handleCreatePoll={handleCreatePoll}
                handleUpdatePoll={handleUpdatePoll}
                titleInputRef={titleInputRef}
                isSubmitting={createMutation.isPending || updateMutation.isPending}
                justCreatedPollId={justCreatedPollId}
                searchText={searchText}
                setSearchText={handleSearchChange}
                statusFilter={statusFilter}
                setStatusFilter={handleStatusFilterChange}
                sortFilter={sortFilter}
                setSortFilter={handleSortFilterChange}
                selectedIds={selectedIds}
                handleBulkStatusChange={handleBulkStatusChange}
                handleBulkDelete={handleBulkDelete}
                onManageOptions={() => setJustCreatedPollId(null)}
            />

            <div>
                <PollTable
                    isLoading={isLoading}
                    filteredPolls={paginatedPolls}
                    selectedIds={selectedIds}
                    setSelectedIds={setSelectedIds}
                    toggleSelect={toggleSelect}
                    handleEditClick={handleEditClick}
                    handleDelete={handleDelete}
                />
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                />
            </div>
        </div>
    );
}