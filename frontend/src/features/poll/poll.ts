// File: src/features/poll/poll.ts

import { type LucideIcon } from 'lucide-react';

export type TabType = 'form' | 'filter' | 'action';

export interface TabConfig {
    id: TabType;
    label: string;
    icon: LucideIcon;
}

export interface Option {
    id: number;
    poll_uuid: string;
    value: string;
    image_url: string | null;
    votes_count?: number;
}

export interface Poll {
    id: string;
    title: string;
    status: 'open' | 'closed';
    start_time: string | null;
    end_time: string | null;
    options?: Option[];
}

// Formats a backend UTC string to a local string for the <input>
export const formatForDateTimeInput = (dateString: string | null): string => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    const tzoffset = (new Date()).getTimezoneOffset() * 60000;
    return (new Date(date.getTime() - tzoffset)).toISOString().slice(0, 16);
};

// NEW: Formats a local <input> string to a UTC string for the backend API
export const formatForApi = (localString: string | null): string | null => {
    if (!localString) return null;

    const date = new Date(localString);
    if (isNaN(date.getTime())) return null;

    // Calling .toISOString() on a Date object automatically converts it to UTC
    return date.toISOString();
};