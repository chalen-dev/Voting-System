import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';

export interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

export default function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
    // Don't render the pagination if there's only 1 page or less
    if (totalPages <= 1) return null;

    // --- Pagination Logic ---
    const getPageNumbers = () => {
        const pages: (number | string)[] = [];
        const maxVisiblePages = 7;

        if (totalPages <= maxVisiblePages) {
            // Show all pages if total pages are 7 or fewer
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            // Complex pagination with ellipses
            if (currentPage <= 4) {
                // Near the start: 1 2 3 4 5 ... Last
                for (let i = 1; i <= 5; i++) pages.push(i);
                pages.push('...');
                pages.push(totalPages);
            } else if (currentPage >= totalPages - 3) {
                // Near the end: 1 ... Last-4 Last-3 Last-2 Last-1 Last
                pages.push(1);
                pages.push('...');
                for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
            } else {
                // In the middle: 1 ... Current-1 Current Current+1 ... Last
                pages.push(1);
                pages.push('...');
                pages.push(currentPage - 1);
                pages.push(currentPage);
                pages.push(currentPage + 1);
                pages.push('...');
                pages.push(totalPages);
            }
        }
        return pages;
    };

    return (
        <div className="flex items-center justify-center gap-1 mt-6 select-none">
            {/* Previous Button */}
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="flex items-center justify-center w-10 h-10 rounded-xl text-[var(--text-main)] hover:bg-brand-500/10 hover:text-brand-600 disabled:opacity-30 disabled:pointer-events-none transition-all active:scale-95"
                title="Previous Page"
            >
                <ChevronLeft size={20} />
            </button>

            {/* Page Numbers */}
            <div className="flex items-center gap-1">
                {getPageNumbers().map((page, index) => {
                    if (page === '...') {
                        return (
                            <div key={`ellipsis-${index}`} className="flex items-center justify-center w-10 h-10 text-[var(--text-main)] opacity-50">
                                <MoreHorizontal size={16} />
                            </div>
                        );
                    }

                    const pageNumber = page as number;
                    const isActive = pageNumber === currentPage;

                    return (
                        <button
                            key={pageNumber}
                            onClick={() => onPageChange(pageNumber)}
                            className={`flex items-center justify-center w-10 h-10 rounded-xl font-bold text-sm transition-all active:scale-95 ${
                                isActive
                                    ? 'bg-brand-600 text-white shadow-md shadow-brand-500/20'
                                    : 'text-[var(--text-main)] hover:bg-[var(--bg-main)] border border-transparent hover:border-[var(--border-color)]'
                            }`}
                        >
                            {pageNumber}
                        </button>
                    );
                })}
            </div>

            {/* Next Button */}
            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="flex items-center justify-center w-10 h-10 rounded-xl text-[var(--text-main)] hover:bg-brand-500/10 hover:text-brand-600 disabled:opacity-30 disabled:pointer-events-none transition-all active:scale-95"
                title="Next Page"
            >
                <ChevronRight size={20} />
            </button>
        </div>
    );
}