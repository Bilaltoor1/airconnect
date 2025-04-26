import {useMutation, useQuery, useQueryClient} from 'react-query';
import {
    createAnnouncement, deleteAnnouncement,
    dislikeAnnouncement, fetchAnnouncement,
    fetchAnnouncements,
    likeAnnouncement,
    updateAnnouncement
} from '../api/announcement';
import {toast} from "react-hot-toast";

export const useCreateAnnouncement = () => {
    const queryClient = useQueryClient();

    return useMutation(createAnnouncement, {
        onSuccess: () => {
            queryClient.invalidateQueries(['announcements']);
        },
        onError: (error) => {
            console.error('Announcement creation failed:', error.response?.data || error.message);
            toast.error(error.response?.data?.message || 'Announcement creation failed'); // Display error message
        }
    });
};
export const useAnnouncements = (params) => {
    return useQuery(['announcements', {params}], () => fetchAnnouncements(params), {
        placeholderData: (previousData) => {
            return previousData || {announcements: [], total: 0};
        },
        cacheTime: 10000
    });
};
export const useAnnouncement = (id) => {
    return useQuery(['announcement', {id}], () => fetchAnnouncement(id));
};

export const useLikeAnnouncement = () => {
    const queryClient = useQueryClient();
    return useMutation(likeAnnouncement, {
        onSuccess: () => {
            queryClient.invalidateQueries(['announcements']);
        },
        onError: (error) => {
            console.error('Like operation failed:', error.response?.data || error.message);
        }
    });
};

export const useDislikeAnnouncement = () => {
    const queryClient = useQueryClient();
    return useMutation(dislikeAnnouncement, {
        onSuccess: () => {
            queryClient.invalidateQueries(['announcements']);
        },
        onError: (error) => {
            console.error('Dislike operation failed:', error.response?.data || error.message);
        }
    });
};

export const useDeleteAnnouncement = () => {
    const queryClient = useQueryClient();
    return useMutation((id) => {
        console.log('ID in useDeleteAnnouncement:', id); // Add this line
        return deleteAnnouncement(id);
    }, {
        onSuccess: () => {
            queryClient.invalidateQueries(['announcements']);
        },
        onError: (error) => {
            console.error('Delete operation failed:', error.response?.data || error.message);
        }
    });
};
export const useUpdateAnnouncement = () => {
    const queryClient = useQueryClient();
    return useMutation((data) => {
        console.log('Data in useUpdateAnnouncement:', data); // Add this line
        // The formData is being properly passed, but we need to use data.formData instead of data
        return updateAnnouncement(data.id, data.formData);
    }, {
        onSuccess: () => {
            queryClient.invalidateQueries(['announcements']);
            queryClient.invalidateQueries(['announcement']); // Also invalidate single announcement queries
        },
        onError: (error) => {
            console.error('Update operation failed:', error.response?.data || error.message);
        }
    });
};