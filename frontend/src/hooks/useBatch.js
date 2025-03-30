import { useQuery, useMutation, useQueryClient } from 'react-query';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.MODE === "development" ? "http://localhost:3001/api/batches" : "/api/batches";

export const fetchBatches = async () => {
    const response = await axios.get(`${API_URL}/all`);
    return response.data;
};

export const createBatch = async (batchData) => {
    const response = await axios.post(`${API_URL}/create`, batchData);
    return response.data;
};
export const fetchBatchDetails = async (batchId) => {
    const response = await axios.get(`${API_URL}/${batchId}`);
    return response.data;
};

export const useBatches = () => {
    return useQuery('batches', fetchBatches);
};
export const fetchBatchSummary = async () => {
    const response = await axios.get(`${API_URL}/summary`);
    return response.data;
};
export const useBatchDetails = (batchId) => {
    return useQuery(['batch', batchId], () => fetchBatchDetails(batchId));
};
export const updateBatch = async (batchId, batchData) => {
    const response = await axios.put(`${API_URL}/update/${batchId}`, batchData);
    return response.data;
};

export const removeBatch = async (batchId) => {
    const response = await axios.delete(`${API_URL}/remove/${batchId}`);
    return response.data;
};
export const useAddStudentToBatch = () => {
    const queryClient = useQueryClient();
    return useMutation(
        ({ studentId, batchId }) => axios.post(`${API_URL}/add-student`, { studentId, batchId }),
        {
            onSuccess: (data, variables) => {
                queryClient.invalidateQueries('batches');
                queryClient.invalidateQueries(['batch', variables.batchId]);
                queryClient.invalidateQueries(['studentsWithoutBatch']);
            },
        }
    );
};

export const useRemoveStudentFromBatch = () => {
    const queryClient = useQueryClient();
    return useMutation(
        ({ studentId, batchId }) => axios.post(`${API_URL}/remove-student`, { studentId, batchId }),
        {
            onSuccess: (data, variables) => {
                queryClient.invalidateQueries('batches');
                queryClient.invalidateQueries(['batch', variables.batchId]);
                queryClient.invalidateQueries(['studentsWithoutBatch']);
                toast.success('Student removed successfully');
            },
            onError: () => {
                toast.error('Failed to remove student');
            }
        }
    );
};

export const useAddTeacherToBatch = () => {
    const queryClient = useQueryClient();
    return useMutation(
        ({ teacherId, batchId }) => axios.post(`${API_URL}/add-teacher`, { teacherId, batchId }),
        {
            onSuccess: (data, variables) => {
                queryClient.invalidateQueries('batches');
                queryClient.invalidateQueries(['batch', variables.batchId]);
              },
        }
    );
};

export const useRemoveTeacherFromBatch = () => {
    const queryClient = useQueryClient();
    return useMutation(
        ({ teacherId, batchId }) => axios.post(`${API_URL}/remove-teacher`, { teacherId, batchId }),
        {
            onSuccess: (data, variables) => {
                queryClient.invalidateQueries('batches');
                queryClient.invalidateQueries(['batch', variables.batchId]);
                toast.success('Teacher removed successfully');
            },
            onError: () => {
                toast.error('Failed to remove teacher');
            }
        }
    );
};

export const useAddAdvisorToBatch = () => {
    const queryClient = useQueryClient();
    return useMutation(
        ({ advisorId, batchId }) => axios.post(`${API_URL}/add-advisor`, { advisorId, batchId }),
        {
            onSuccess: (data, variables) => {
                queryClient.invalidateQueries('batches');
                queryClient.invalidateQueries(['batch', variables.batchId]);
            },
        }
    );
};

export const useUpdateBatch = () => {
    const queryClient = useQueryClient();
    return useMutation(({ batchId, batchData }) => updateBatch(batchId, batchData), {
        onSuccess: () => {
            queryClient.invalidateQueries('batches');
            queryClient.invalidateQueries(['batchSummary']);
            toast.success('Batch updated successfully');
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Failed to update batch');
        }
    });
};

export const useRemoveBatch = () => {
    const queryClient = useQueryClient();
    return useMutation((batchId) => removeBatch(batchId), {
        onSuccess: () => {
            queryClient.invalidateQueries('batches');
            queryClient.invalidateQueries(['batchSummary']);
            toast.success('Batch removed successfully');
        },
        onError: (error) => {
            console.log(error)
            toast.error(error.response?.data?.message || 'Failed to remove batch');
        }
    });
};

export const useCreateBatch = () => {
    const queryClient = useQueryClient();
    return useMutation(createBatch, {
        onSuccess: () => {
            queryClient.invalidateQueries('batches');
            queryClient.invalidateQueries(['batchSummary']);
            toast.success('Batch created successfully');
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Failed to create batch');
        }
    })};
export const useBatchSummary = () => {
    return useQuery(['batchSummary'], fetchBatchSummary);
};

export const fetchBatchFilter = async () => {
    const response = await axios.get(`${API_URL}/all`);
    return response.data;
};

export const useBatchFilter = () => {
    return useQuery(['batch-filter'], fetchBatchFilter);
};