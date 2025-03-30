import {useMutation, useQuery, useQueryClient} from 'react-query';
import {
    createAnnouncementFilter,
    fetchAllAnnouncementsFilter,
    fetchAnnouncementsFilter,
    fetchBatchFilter,
    updateAnnouncementFilter,
    deleteAnnouncementFilter
} from "../api/annoucement-filter.js";
import toast from 'react-hot-toast';

export const useCreateAnnouncementFilter = () => {
    const queryClient = useQueryClient();

    return useMutation(createAnnouncementFilter, {
        onSuccess: () => {
            queryClient.invalidateQueries(['announcements-filter']);
            toast.success('Section created successfully');
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Failed to create section');
            console.error('Announcement creation failed:', error.response?.data || error.message);
        }
    });
};

export const useUpdateAnnouncementFilter = () => {
    const queryClient = useQueryClient();

    return useMutation(updateAnnouncementFilter, {
        onSuccess: () => {
            queryClient.invalidateQueries(['announcements-filter']);
            queryClient.invalidateQueries(['all-announcements-filter']);
            toast.success('Section updated successfully');
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Failed to update section');
            console.error('Announcement update failed:', error.response?.data || error.message);
        }
    });
};

export const useDeleteAnnouncementFilter = () => {
    const queryClient = useQueryClient();

    return useMutation(deleteAnnouncementFilter, {
        onSuccess: () => {
            queryClient.invalidateQueries(['announcements-filter']);
            queryClient.invalidateQueries(['all-announcements-filter']);
            toast.success('Section deleted successfully');
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Failed to delete section');
            console.error('Announcement deletion failed:', error.response?.data || error.message);
        }
    });
};

export const useAnnouncementsFilter = () => {
    return useQuery(['announcements-filter'], () => fetchAnnouncementsFilter())
};

export const useAllAnnouncementsFilter = () => {
    return useQuery(['all-announcements-filter'], () => fetchAllAnnouncementsFilter());
};

export const useBatchFilter = () => {
    return useQuery(['batch-filter'], () => fetchBatchFilter());
};