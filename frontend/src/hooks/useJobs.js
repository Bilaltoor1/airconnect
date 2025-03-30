import { useMutation, useQuery, useQueryClient } from 'react-query';
import * as jobsApi from '../api/jobs';

export const useCreateJob = () => {
    const queryClient = useQueryClient();
    return useMutation(jobsApi.createJob, {
        onSuccess: (newJob) => {
            queryClient.invalidateQueries('jobs'); // Invalidate jobs query to refetch the jobs list
        },
        onError: (error) => {
            console.error('Job creation failed:', error);
        },
    });
};

export const useJobs = (params) => {
    return useQuery(['jobs', params], () => jobsApi.fetchJobs(params), {
        cacheTime: 10000,
    });
};

export const useDeleteJob = () => {
    const queryClient = useQueryClient();
    return useMutation(jobsApi.deleteJob, {
        onSuccess: () => {
            queryClient.invalidateQueries('jobs'); // Invalidate jobs query to refetch the jobs list
        },
        onError: (error) => {
            console.error('Job deletion failed:', error);
        },
    });
};

export const useUpdateJob = () => {
    const queryClient = useQueryClient();
    return useMutation(jobsApi.updateJob, {
        onSuccess: () => {
            queryClient.invalidateQueries('jobs'); // Invalidate jobs query to refetch the jobs list
        },
        onError: (error) => {
            console.error('Job update failed:', error);
        },
    });
};