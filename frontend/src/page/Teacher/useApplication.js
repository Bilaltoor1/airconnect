import { useMutation, useQuery, useQueryClient } from 'react-query';
import { createApplication, fetchApplications, fetchHistoryofApplication, fetchApplicationById, updateApplicationByAdvisor, updateApplicationByCoordinator, updateApplicationByStudent } from '../api/application';

export const useCreateApplication = () => {
    const queryClient = useQueryClient();
    return useMutation(createApplication, {
        onSuccess: () => {
            queryClient.invalidateQueries('applications');
        },
        onError: (error) => {
            console.error('Application creation failed:', error.response?.data || error.message);
        }
    });
};

export const useApplications = (params) => {
    return useQuery(['applications', { params }], () => fetchApplications(params), {
        cacheTime: 10000
    });
};

export const useHistoryofApplications = (params) => {
    return useQuery(['historyofApplications', { params }], () => fetchHistoryofApplication(params), {
        cacheTime: 10000
    });
};

export const useApplication = (id) => {
    return useQuery(['application', id], () => fetchApplicationById(id), {
        cacheTime: 10000
    });
};

export const useUpdateApplicationByAdvisor = () => {
    const queryClient = useQueryClient();
    return useMutation(updateApplicationByAdvisor, {
        onSuccess: () => {
            queryClient.invalidateQueries('applications');
        },
        onError: (error) => {
            console.error('Application update by advisor failed:', error.response?.data || error.message);
        }
    });
};

export const useUpdateApplicationByCoordinator = () => {
    const queryClient = useQueryClient();
    return useMutation(updateApplicationByCoordinator, {
        onSuccess: () => {
            queryClient.invalidateQueries('applications');
        },
        onError: (error) => {
            console.error('Application update by coordinator failed:', error.response?.data || error.message);
        }
    });
};

export const useUpdateApplicationByStudent = () => {
    const queryClient = useQueryClient();
    return useMutation(updateApplicationByStudent, {
        onSuccess: () => {
            queryClient.invalidateQueries('applications');
            queryClient.invalidateQueries('historyofApplications');
        },
        onError: (error) => {
            console.error('Application update by student failed:', error.response?.data || error.message);
        }
    });
};