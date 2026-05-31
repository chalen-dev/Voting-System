// File: src/features/poll/hooks/useBallot.ts

import { useQuery, useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import api from '../../../api/axios'; // Fixed path and filename
import { showToast } from '../../../helpers/swalHelpers'; // Fixed path

// Optional: Define an interface for the Error response from your Laravel backend
interface ApiErrorResponse {
    message?: string;
}

export function useBallot(pollId?: string) {
    // 1. Fetch the poll with its options
    const { data: poll, isLoading, error } = useQuery({
        queryKey: ['ballot', pollId],
        queryFn: async () => {
            const { data } = await api.get(`/polls/${pollId}`);
            return data;
        },
        enabled: !!pollId,
        retry: false,
    });

    // 2. Cast Vote Mutation
    const castVote = useMutation({
        mutationFn: async (optionId: number) => {
            const { data } = await api.post('/votes', {
                poll_uuid: pollId,
                option_id: optionId,
            });
            return data;
        },
        onSuccess: () => {
            showToast('Vote cast successfully!', 'success');
        },
        onError: (err: AxiosError<ApiErrorResponse>) => {
            // Replaced 'any' with AxiosError for better type safety
            const message = err.response?.data?.message || 'Failed to cast vote.';
            showToast(message, 'error');
        },
    });

    return {
        poll,
        isLoading,
        error,
        castVote,
    };
}