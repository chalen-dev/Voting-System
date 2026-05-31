// File: src/features/poll/pollApi.ts
import api from '../../api/axios';
import { type Poll } from './poll';

export interface OptionPayload {
    value: string;
    image?: File | null;
}

export interface PollPayload {
    title: string;
    start_time: string | null;
    end_time: string | null;
    status: string;
    options?: OptionPayload[];
}

/**
 * Build a FormData object from a PollPayload.
 * Used when options may have image files attached.
 */
const buildFormData = (payload: PollPayload): FormData => {
    const form = new FormData();

    form.append('title', payload.title);
    form.append('status', payload.status);

    if (payload.start_time) form.append('start_time', payload.start_time);
    if (payload.end_time) form.append('end_time', payload.end_time);

    const options = payload.options?.length
        ? payload.options
        : [{ value: 'Option 1' }, { value: 'Option 2' }];

    options.forEach((opt, index) => {
        form.append(`options[${index}]`, opt.value);
        if (opt.image) {
            form.append(`images[${index}]`, opt.image);
        }
    });

    return form;
};

export const pollApi = {
    // Fetch all polls
    getAll: async (): Promise<Poll[]> => {
        const { data } = await api.get('/polls');
        return Array.isArray(data) ? data : (data?.data || []);
    },

    // Create a new poll (supports images via FormData)
    create: async (payload: PollPayload): Promise<Poll> => {
        const form = buildFormData(payload);
        const { data } = await api.post('/polls', form, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return data;
    },

    // Update an existing poll
    update: async (id: string, payload: PollPayload): Promise<Poll> => {
        // Laravel doesn't support FormData on PUT, use POST with _method spoofing
        const form = buildFormData(payload);
        form.append('_method', 'PUT');
        const { data } = await api.post(`/polls/${id}`, form, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return data;
    },

    // Delete a single poll
    delete: async (id: string): Promise<void> => {
        await api.delete(`/polls/${id}`);
    },

    // Bulk status update
    bulkStatus: async (ids: string[], status: 'open' | 'closed'): Promise<void> => {
        await api.post('/polls/bulk-status', { ids, status });
    },

    // Bulk delete
    bulkDelete: async (ids: string[]): Promise<void> => {
        await api.delete('/polls/bulk-destroy', { data: { ids } });
    },
};