// File: src/features/poll/modals/SharePollModal.tsx

import { useState } from 'react';
import { X, Copy, Check, Download, QrCode, Link as LinkIcon } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import { showToast } from '../../../helpers/swalHelpers.ts';

interface SharePollModalProps {
    isOpen: boolean;
    onClose: () => void;
    pollId: string;
    pollTitle?: string;
}

export default function SharePollModal({ isOpen, onClose, pollId, pollTitle }: SharePollModalProps) {
    const [isCopied, setIsCopied] = useState(false);

    if (!isOpen) return null;

    // The public-facing route for voters
    const shareUrl = `${window.location.origin}/p/${pollId}`;

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(shareUrl);
            setIsCopied(true);
            showToast('Link copied to clipboard!', 'success', true);
            setTimeout(() => setIsCopied(false), 2000);
        } catch { // FIX: Removed the unused 'err' binding
            showToast('Failed to copy link.', 'error', true);
        }
    };

    const handleDownloadQR = () => {
        const canvas = document.getElementById(`qr-code-${pollId}`) as HTMLCanvasElement;
        if (canvas) {
            const pngUrl = canvas
                .toDataURL('image/png')
                .replace('image/png', 'image/octet-stream');

            const downloadLink = document.createElement('a');
            downloadLink.href = pngUrl;
            downloadLink.download = `QR-${pollTitle?.replace(/\s+/g, '-').toLowerCase() || 'poll'}.png`;
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);

            showToast('QR Code saved!', 'success', true);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="relative bg-[var(--bg-surface)] border border-[var(--border-color)] w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-[var(--border-color)]">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-brand-500/10 text-brand-500 rounded-xl">
                            <QrCode size={20} />
                        </div>
                        <h2 className="font-black text-lg text-[var(--text-heading)]">Share Poll</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-[var(--bg-main)] rounded-xl transition-colors text-[var(--text-main)] opacity-70 hover:opacity-100"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="p-8 space-y-8 text-center">
                    {/* QR Code Display */}
                    <div className="inline-flex flex-col items-center gap-4">
                        <div className="p-4 bg-white rounded-2xl border-4 border-white shadow-lg shadow-black/5">
                            <QRCodeCanvas
                                id={`qr-code-${pollId}`}
                                value={shareUrl}
                                size={180}
                                level="H"
                                marginSize={0} // FIX: Replaced deprecated 'includeMargin' with 'marginSize'
                            />
                        </div>

                        <button
                            onClick={handleDownloadQR}
                            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-brand-500 hover:text-brand-600 transition-colors"
                        >
                            <Download size={14} />
                            Download JPG/PNG
                        </button>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-xs font-black uppercase opacity-40">
                            <LinkIcon size={12} />
                            <span>Public Voting URL</span>
                        </div>

                        <div className="flex items-center gap-2">
                            <input
                                type="text"
                                readOnly
                                value={shareUrl}
                                className="flex-1 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-xl px-4 py-3 text-sm font-medium focus:outline-none text-[var(--text-main)] overflow-hidden text-ellipsis"
                            />
                            <button
                                onClick={handleCopyLink}
                                className={`h-12 w-12 flex items-center justify-center rounded-xl transition-all ${
                                    isCopied
                                        ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                                        : 'bg-brand-600 hover:bg-brand-700 text-white shadow-lg shadow-brand-500/20'
                                }`}
                            >
                                {isCopied ? <Check size={20} /> : <Copy size={20} />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Footer Tip */}
                <div className="p-4 bg-[var(--bg-main)]/50 border-t border-[var(--border-color)] text-center">
                    <p className="text-[10px] font-medium opacity-40 uppercase tracking-tight">
                        Voters don't need an account to use this link
                    </p>
                </div>
            </div>
        </div>
    );
}