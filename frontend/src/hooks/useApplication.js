import { useMutation, useQuery, useQueryClient } from 'react-query';
import { 
    createApplication, fetchApplications, fetchHistoryofApplication, 
    fetchApplicationById, updateApplicationByAdvisor, 
    updateApplicationByCoordinator, updateApplicationByStudent, 
    addApplicationComment, getApplicationComments,
    clearStudentApplicationHistory, clearAdvisorApplicationHistory,
    clearCoordinatorApplicationHistory, hideStudentApplication,
    hideAdvisorApplication, hideCoordinatorApplication
} from '../api/application';

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
        cacheTime: 10000,
        staleTime: 60000, // Add a stale time to reduce unnecessary refetches
        refetchOnWindowFocus: false // Don't refetch when window gains focus
    });
};

export const useHistoryofApplications = (params) => {
    return useQuery(['historyofApplications', { params }], () => fetchHistoryofApplication(params), {
        cacheTime: 10000,
        staleTime: 60000, // Add a stale time to reduce unnecessary refetches
        refetchOnWindowFocus: false // Don't refetch when window gains focus
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

export const useAddComment = () => {
    const queryClient = useQueryClient();
    return useMutation(addApplicationComment, {
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries(['applicationComments', variables.id]);
            queryClient.invalidateQueries(['application', variables.id]);
        },
        onError: (error) => {
            console.error('Comment addition failed:', error.response?.data || error.message);
        }
    });
};

export const useApplicationComments = (id) => {
    return useQuery(['applicationComments', id], () => getApplicationComments(id), {
        enabled: !!id,
        cacheTime: 5000
    });
};

export const useClearStudentApplicationHistory = () => {
    const queryClient = useQueryClient();
    return useMutation(clearStudentApplicationHistory, {
        onSuccess: () => {
            queryClient.invalidateQueries('historyofApplications');
        },
        onError: (error) => {
            console.error('Failed to clear student application history:', error.response?.data || error.message);
        }
    });
};

export const useClearAdvisorApplicationHistory = () => {
    const queryClient = useQueryClient();
    return useMutation(clearAdvisorApplicationHistory, {
        onSuccess: () => {
            queryClient.invalidateQueries('historyofApplications');
        },
        onError: (error) => {
            console.error('Failed to clear advisor application history:', error.response?.data || error.message);
        }
    });
};

export const useClearCoordinatorApplicationHistory = () => {
    const queryClient = useQueryClient();
    return useMutation(clearCoordinatorApplicationHistory, {
        onSuccess: () => {
            queryClient.invalidateQueries('historyofApplications');
        },
        onError: (error) => {
            console.error('Failed to clear coordinator application history:', error.response?.data || error.message);
        }
    });
};

export const useHideStudentApplication = () => {
    const queryClient = useQueryClient();
    return useMutation(hideStudentApplication, {
        onSuccess: () => {
            queryClient.invalidateQueries('historyofApplications');
        },
        onError: (error) => {
            console.error('Failed to hide student application:', error.response?.data || error.message);
        }
    });
};

export const useHideAdvisorApplication = () => {
    const queryClient = useQueryClient();
    return useMutation(hideAdvisorApplication, {
        onSuccess: () => {
            queryClient.invalidateQueries('historyofApplications');
        },
        onError: (error) => {
            console.error('Failed to hide advisor application:', error.response?.data || error.message);
        }
    });
};

export const useHideCoordinatorApplication = () => {
    const queryClient = useQueryClient();
    return useMutation(hideCoordinatorApplication, {
        onSuccess: () => {
            queryClient.invalidateQueries('historyofApplications');
        },
        onError: (error) => {
            console.error('Failed to hide coordinator application:', error.response?.data || error.message);
        }
    });
};