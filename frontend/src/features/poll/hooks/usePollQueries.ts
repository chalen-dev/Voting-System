import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { pollApi, type PollPayload } from '../pollApi';
import { showToast } from '../../../helpers/swalHelpers';

export const usePolls = () => {
    return useQuery({
        queryKey: ['polls'],
        queryFn: pollApi.getAll,
    });
};

export const usePollMutations = () => {
    const queryClient = useQueryClient();

    const onSuccess = (message: string) => {
        queryClient.invalidateQueries({ queryKey: ['polls'] });
        showToast(message);
    };

    const createMutation = useMutation({
        mutationFn: (payload: PollPayload) => pollApi.create(payload),
        onSuccess: () => onSuccess('Poll initialized successfully!'),
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, payload }: { id: string; payload: PollPayload }) =>
            pollApi.update(id, payload),
        onSuccess: () => onSuccess('Poll updated successfully!'),
    });

    const deleteMutation = useMutation({
        mutationFn: pollApi.delete,
        onSuccess: () => onSuccess('Poll deleted successfully!'),
    });

    const bulkStatusMutation = useMutation({
        mutationFn: ({ ids, status }: { ids: string[]; status: 'open' | 'closed' }) =>
            pollApi.bulkStatus(ids, status),
        onSuccess: (_, variables) =>
            onSuccess(`${variables.ids.length} polls marked as ${variables.status}!`),
    });

    const bulkDeleteMutation = useMutation({
        mutationFn: pollApi.bulkDelete,
        onSuccess: (_, ids) => onSuccess(`${ids.length} polls deleted!`),
    });

    return {
        createMutation,
        updateMutation,
        deleteMutation,
        bulkStatusMutation,
        bulkDeleteMutation,
    };
};