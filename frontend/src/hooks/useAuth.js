import { useMutation, useQuery, useQueryClient } from 'react-query';
import * as authApi from '../api/auth';
import { useAuth } from "../context/AuthContext.jsx";
import { fetchStudentsWithoutBatch } from "../api/auth";
import axios from 'axios';
import toast from 'react-hot-toast';

// Add the API_URL definition or import
const API_URL = import.meta.env.MODE === "development" ? "http://localhost:3001/api/auth" : "/api/auth";

export const useSignup = () => {
    const queryClient = useQueryClient();
    return useMutation(authApi.signup, {
        onSuccess: (user) => {
            queryClient.setQueryData('user', user);
        },
    });
};

export const useLogin = () => {
    const queryClient = useQueryClient();
    const { setUser } = useAuth(); // Access the setUser function from context

    return useMutation(authApi.login, {
        onSuccess: (user) => {
            queryClient.setQueryData('user', user);
            setUser(user); // Set the user state immediately after login
        },
    });
};

export const useLogout = () => {
    const queryClient = useQueryClient();
    const { setUser } = useAuth(); // Access the setUser function from context

    return useMutation(authApi.logout, {
        onSuccess: () => {
            queryClient.removeQueries('user');
            setUser(null); // Clear the user state after logout
        },
        onError: (error) => {
            console.error('Logout failed:', error);
        }
    });
};


export const useVerifyEmail = () => {
    const queryClient = useQueryClient();
    return useMutation(authApi.verifyEmail, {
        onSuccess: (user) => {
            queryClient.setQueryData('user', user);
        },
    });
};

export const useCheckIsAdmin = () => {
    return useQuery('isAdmin', authApi.checkIsAdmin);
};

export const useCheckAuth = () => {
    return useQuery('user', authApi.checkAuth, {
        staleTime: 0,
        cacheTime: Infinity,
    });
};

export const useForgotPassword = () => {
    return useMutation(authApi.forgotPassword);
};

export const useResetPassword = () => {
    return useMutation(authApi.resetPassword);
};

export const useProfileSetup = () => {
    const queryClient = useQueryClient();
    const { setUser } = useAuth(); // Access the setUser function from context

    return useMutation(authApi.profileSetup, {
        onSuccess: (updatedUser) => {
            queryClient.setQueryData('user', updatedUser); // Update the user data in react-query cache
            setUser(updatedUser); // Update the user state in context
        },
        onError: (error) => {
            console.error('Profile setup failed:', error);
        },
    });
};

export const useUpdateUser = () => {
    const queryClient = useQueryClient();
    const { setUser } = useAuth();

    return useMutation(authApi.updateUser, {
        onSuccess: (updatedUser) => {
            queryClient.setQueryData('user', updatedUser);
            setUser(updatedUser);
        },
        onError: (error) => {
            console.error('User update failed:', error);
        },
    });
};
export const useChangePassword = () => {
    return useMutation(authApi.changePassword);
};
export const useGetStudentsWithoutBatch = () => {
    return useQuery(['studentsWithoutBatch'], fetchStudentsWithoutBatch);
};
export const useGetTeachers = () => {
    return useQuery(['teachers'], authApi.getTeachers);
};

export const usePendingTeachers = () => {
    const queryClient = useQueryClient();
   
    return useQuery(
        ['pendingTeachers'],
        async () => {
            try {
                const response = await axios.get(`${API_URL}/pending-teachers`, {
                    withCredentials: true, // Ensure cookies are sent with the request
                    headers: {
                        'Content-Type': 'application/json',
                    }
                });
                console.log('pending teachers response:', response.data);
                return response.data;
            } catch (error) {
                console.error('Pending teachers fetch error:', error);
                
                // More specific error message based on error type
                if (error.response) {
                    // The request was made and the server responded with a status code
                    throw new Error(`Server error: ${error.response.status} - ${error.response.data.message || 'Unknown error'}`);
                } else if (error.request) {
                    // The request was made but no response was received
                    throw new Error('No response from server. Please check your network connection.');
                } else {
                    // Something happened in setting up the request
                    throw new Error(`Request error: ${error.message}`);
                }
            }
        },
        {
            onError: (error) => {
                toast.error(`Failed to fetch pending teachers: ${error.message}`);
                console.error('Pending teachers error details:', error);
            },
            staleTime: 60000, // 1 minute
            retry: 2, // Retry failed requests up to 2 times
        }
    );
};

export const useVerifyTeacher = () => {
    const queryClient = useQueryClient();

    return useMutation(
        (data) => axios.post(`${API_URL}/verify-teacher`, data, {
            withCredentials: true, // Ensure cookies are sent with the request
            headers: {
                'Content-Type': 'application/json',
            }
        }),
        {
            onSuccess: () => {
                queryClient.invalidateQueries('pendingTeachers');
                queryClient.invalidateQueries('teachers');
            },
            onError: (error) => {
                console.error(error);
            }
        }
    );
};