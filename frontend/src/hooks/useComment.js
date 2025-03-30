import { useInfiniteQuery, useMutation, useQueryClient } from 'react-query';
import axios from 'axios';

const API_URL = import.meta.env.MODE === "development" ? "http://localhost:3001/api/announcements" : "/api/announcements";

// Fetch comments for an announcement
export const fetchComments = async ({ announcementId, pageParam = 1 }) => {
    const response = await axios.get(`${API_URL}/${announcementId}/comments`, {
        params: { page: pageParam, limit: 10 }
    });
    return response.data;
};

// Add a comment to an announcement
export const addComment = async ({ announcementId, text }) => {
    const response = await axios.post(`${API_URL}/${announcementId}/comments`, { text });
    return response.data;
};

// Hook to fetch comments with infinite scroll
export const useComments = (announcementId) => {
    return useInfiniteQuery(
        ['comments', announcementId],
        ({ pageParam = 1 }) => fetchComments({ announcementId, pageParam }),
        {
            getNextPageParam: (lastPage, allPages) => {
                const fetchedItems = allPages.reduce((acc, page) => acc + page.comments.length, 0);
                return fetchedItems < lastPage.total ? allPages.length + 1 : undefined;
            },
            enabled: !!announcementId
        }
    );
};

// Hook to add a comment
export const useAddComment = () => {
    const queryClient = useQueryClient();
    
    return useMutation(addComment, {
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries(['comments', variables.announcementId]);
            queryClient.invalidateQueries(['announcements']); // To update comment counts in the listings
            queryClient.invalidateQueries(['announcement', { id: variables.announcementId }]); // Update single announcement view
        }
    });
};