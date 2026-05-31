// File: src/features/poll/hooks/usePollOptions.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../../api/axios';
import type { Poll } from '../poll';

export const usePollOptions = (pollId: string | undefined) => {
    const queryClient = useQueryClient();

    const { data: poll, isLoading } = useQuery<Poll>({
        queryKey: ['polls', pollId],
        queryFn: async () => {
            const res = await api.get(`/polls/${pollId}`);
            return res.data;
        },
        enabled: !!pollId,
    });

    const addOption = useMutation({
        mutationFn: async (formData: FormData) => {
            const res = await api.post('/options', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            return res.data;
        },
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: ['polls', pollId] });
        },
    });

    // --- NEW: Update Option Mutation ---
    const updateOption = useMutation({
        mutationFn: async ({ id, formData }: { id: number; formData: FormData }) => {
            // Spoofing PUT via POST for FormData compatibility
            formData.append('_method', 'PUT');
            const res = await api.post(`/options/${id}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            return res.data;
        },
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: ['polls', pollId] });
        },
    });

    const deleteOption = useMutation({
        mutationFn: async (optionId: number) => {
            await api.delete(`/options/${optionId}`);
        },
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: ['polls', pollId] });
        },
    });

    return {
        poll,
        isLoading,
        addOption,
        updateOption, // Export this
        deleteOption,
    };
};