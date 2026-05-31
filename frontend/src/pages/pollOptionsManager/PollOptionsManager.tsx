// File: src/pages/pollOptionsManager/PollOptionsManager.tsx

import { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    Plus,
    Image as ImageIcon,
    Trash2,
    Loader2,
    X,
    Pencil,
    RotateCcw,
    Share2
} from 'lucide-react';
import { usePollOptions } from '../../features/poll/hooks/usePollOptions.ts';
import { showConfirmation, showToast } from '../../helpers/swalHelpers.ts';
import SharePollModal from '../../features/poll/modals/SharePollModal.tsx';

// 1. Unified Interface for consistency
interface PollOption {
    id: number;
    poll_uuid: string;
    value: string;
    image_path?: string | null;
    image_url?: string | null;
    votes_count?: number;
}

export default function PollOptionsManager() {
    const { pollId } = useParams<{ pollId: string }>();
    const navigate = useNavigate();
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Form State
    const [value, setValue] = useState('');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [editingId, setEditingId] = useState<number | null>(null);

    // Modal State
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);

    const { poll, isLoading, addOption, deleteOption, updateOption } = usePollOptions(pollId);

    // Derived state to check if poll is closed
    const isPollClosed = poll?.status === 'closed';

    const triggerOpenPollAlert = async () => {
        await showConfirmation(
            'Action Denied',
            'You cannot edit options on an open poll.',
            false, // Don't show cancel button, just an OK button
            'error',
            'Got it'
        );
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!isPollClosed) {
            triggerOpenPollAlert();
            return;
        }

        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            setPreviewUrl(window.URL.createObjectURL(file));
        }
    };

    const resetForm = () => {
        setValue('');
        setImageFile(null);
        setPreviewUrl(null);
        setEditingId(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleSaveOption = async () => {
        if (!isPollClosed) {
            triggerOpenPollAlert();
            return;
        }

        if (!value.trim() || !pollId) return;

        const formData = new FormData();
        formData.append('poll_uuid', pollId);
        formData.append('value', value);
        if (imageFile) {
            formData.append('image', imageFile);
        }

        try {
            if (editingId) {
                await updateOption.mutateAsync({ id: editingId, formData });
                showToast('Option updated successfully!', 'success', true);
            } else {
                await addOption.mutateAsync(formData);
                showToast('Option added successfully!', 'success', true);
            }
            resetForm();
        } catch {
            showToast('Failed to save option.', 'error', true);
        }
    };

    const handleDelete = async (id: number) => {
        if (!isPollClosed) {
            triggerOpenPollAlert();
            return;
        }

        const isConfirmed = await showConfirmation(
            'Delete Option?',
            'Are you sure you want to remove this option? This cannot be undone.',
            true,
            'warning',
            'Yes, delete it'
        );

        if (isConfirmed) {
            try {
                await deleteOption.mutateAsync(id);
                showToast('Option deleted!', 'success', true);
                if (editingId === id) resetForm();
            } catch {
                showToast('Failed to delete option.', 'error', true);
            }
        }
    };

    const startEdit = (opt: PollOption) => {
        if (!isPollClosed) {
            triggerOpenPollAlert();
            return;
        }

        setEditingId(opt.id);
        setValue(opt.value);
        setPreviewUrl(opt.image_url || null);
        setImageFile(null);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    if (isLoading) return (
        <div className="p-20 text-center animate-pulse">
            <div className="text-sm font-black uppercase opacity-20 tracking-widest">Loading Poll Details...</div>
        </div>
    );

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8 animate-page">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/polls')}
                        className="p-3 bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-xl hover:bg-brand-500/10 hover:text-brand-500 transition-all"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-2xl font-black text-[var(--text-heading)] flex items-center gap-3">
                            {poll?.title || 'Manage Options'}
                            {!isPollClosed && (
                                <span className="text-[10px] bg-rose-500/10 text-rose-500 px-2 py-1 rounded-md uppercase tracking-wider">
                                    Read Only (Poll Open)
                                </span>
                            )}
                        </h1>
                        <p className="text-sm text-[var(--text-main)] opacity-70">
                            {poll?.options?.length || 0} choices configured
                        </p>
                    </div>
                </div>

                {/* Share Button */}
                <button
                    onClick={() => setIsShareModalOpen(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl shadow-lg shadow-brand-500/20 transition-all active:scale-95"
                >
                    <Share2 size={18} />
                    Share Poll
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Form Section */}
                <div className="lg:col-span-1 space-y-4">
                    <div className={`bg-[var(--bg-surface)] border ${editingId ? 'border-amber-500/50' : 'border-[var(--border-color)]'} rounded-3xl p-6 space-y-6 sticky top-8 transition-colors ${!isPollClosed ? 'opacity-70 grayscale pointer-events-none' : ''}`}>
                        <div className="flex items-center justify-between">
                            <h2 className="font-bold text-lg">
                                {editingId ? 'Edit Option' : 'Create New Option'}
                            </h2>
                            {editingId && (
                                <button
                                    onClick={resetForm}
                                    className="text-[10px] font-black uppercase text-amber-500 hover:underline flex items-center gap-1"
                                >
                                    <RotateCcw size={12} /> Cancel Edit
                                </button>
                            )}
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-black uppercase opacity-60 mb-2">Option Text</label>
                                <input
                                    type="text"
                                    value={value}
                                    onChange={(e) => setValue(e.target.value)}
                                    placeholder="e.g., React"
                                    disabled={!isPollClosed}
                                    className="w-full bg-[var(--bg-main)] border border-[var(--border-color)] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-black uppercase opacity-60 mb-2">Image</label>
                                <input type="file" className="hidden" ref={fileInputRef} onChange={handleFileChange} accept="image/*" disabled={!isPollClosed} />

                                {!previewUrl ? (
                                    <div onClick={() => isPollClosed && fileInputRef.current?.click()} className={`border-2 border-dashed border-[var(--border-color)] rounded-xl p-8 flex flex-col items-center justify-center text-center transition-all ${isPollClosed ? 'cursor-pointer hover:border-brand-500 hover:bg-brand-500/5' : 'cursor-not-allowed opacity-50'}`}>
                                        <ImageIcon size={32} className="opacity-40 mb-2" />
                                        <span className="text-sm font-medium">Click to upload</span>
                                    </div>
                                ) : (
                                    <div className="relative rounded-xl overflow-hidden border border-[var(--border-color)] group">
                                        <img src={previewUrl} alt="Preview" className="w-full h-40 object-cover" />
                                        <button
                                            onClick={() => { setImageFile(null); setPreviewUrl(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                                            disabled={!isPollClosed}
                                            className="absolute top-2 right-2 p-1.5 bg-rose-500 text-white rounded-lg shadow-lg hover:bg-rose-600 transition-colors disabled:opacity-50"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                )}
                            </div>

                            <button
                                onClick={handleSaveOption}
                                disabled={addOption.isPending || updateOption.isPending || !value.trim() || !isPollClosed}
                                className={`w-full ${editingId ? 'bg-amber-600 hover:bg-amber-700' : 'bg-brand-600 hover:bg-brand-700'} text-white font-bold rounded-xl py-4 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors`}
                            >
                                {(addOption.isPending || updateOption.isPending) ? (
                                    <Loader2 className="animate-spin" size={18} />
                                ) : editingId ? (
                                    <RotateCcw size={18} />
                                ) : (
                                    <Plus size={18} />
                                )}
                                {editingId ? 'Update Option' : 'Add Option'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* List Section */}
                <div className="lg:col-span-2">
                    <div className="bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-3xl p-6 min-h-[400px]">
                        <h2 className="font-bold text-lg mb-6">Current Options</h2>

                        {poll?.options?.length === 0 ? (
                            <div className="py-20 text-center opacity-40 text-sm font-bold uppercase tracking-widest border-2 border-dashed border-[var(--border-color)] rounded-2xl">
                                No options yet. Create one on the left!
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {poll?.options?.map((option: PollOption) => {
                                    const rawImage = option.image_url || option.image_path;
                                    const finalImageSrc = rawImage?.startsWith('http')
                                        ? rawImage
                                        : (rawImage ? `http://localhost:8000/storage/${rawImage}` : null);

                                    return (
                                        <div key={option.id} className={`border ${editingId === option.id ? 'border-amber-500 bg-amber-500/5' : 'border-[var(--border-color)] bg-[var(--bg-main)]'} rounded-xl p-4 flex items-center gap-4 group transition-all ${isPollClosed ? 'hover:border-brand-500' : 'opacity-80'}`}>
                                            <div className="w-16 h-16 bg-[var(--bg-surface)] rounded-lg flex items-center justify-center border border-[var(--border-color)] overflow-hidden shrink-0">
                                                {finalImageSrc ? (
                                                    <img src={finalImageSrc} alt={option.value} className="w-full h-full object-cover" />
                                                ) : (
                                                    <ImageIcon size={20} className="opacity-20" />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-bold truncate" title={option.value}>{option.value}</h3>
                                                <p className="text-[10px] font-black uppercase opacity-40 mt-1">{option.votes_count || 0} Votes</p>
                                            </div>

                                            <div className={`flex items-center gap-1 transition-opacity ${isPollClosed ? 'opacity-0 group-hover:opacity-100' : 'hidden'}`}>
                                                <button
                                                    onClick={() => startEdit(option)}
                                                    className="p-2 text-amber-500 hover:bg-amber-500/10 rounded-lg"
                                                    title="Edit"
                                                >
                                                    <Pencil size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(option.id)}
                                                    disabled={deleteOption.isPending}
                                                    className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-lg disabled:opacity-50"
                                                    title="Delete"
                                                >
                                                    {deleteOption.isPending ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Share Modal */}
            <SharePollModal
                isOpen={isShareModalOpen}
                onClose={() => setIsShareModalOpen(false)}
                pollId={pollId!}
                pollTitle={poll?.title}
            />
        </div>
    );
}