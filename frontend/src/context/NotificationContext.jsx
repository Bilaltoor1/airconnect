import React, { createContext, useContext, useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { fetchNotifications, markAsRead, markAllAsRead, deleteNotification } from '../api/notification';
import { useAuth } from './AuthContext';
import { getSocket, getSocketStatus } from '../services/socket.service';
import { toast } from 'react-hot-toast';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
    const { user, isAuthenticated } = useAuth();
    const [unreadCount, setUnreadCount] = useState(0);
    const queryClient = useQueryClient();
    const [socketReady, setSocketReady] = useState(false);
    
    // Monitor socket status to re-attach listener if needed
    useEffect(() => {
        if (!isAuthenticated || !user) return;
        
        const checkSocketAndSetupListeners = () => {
            const socket = getSocket();
            if (!socket) {
                console.warn('Socket not available for notifications');
                setSocketReady(false);
                return false;
            }
            
            if (!socket.connected) {
                console.warn('Socket exists but not connected');
                setSocketReady(false);
                return false;
            }
            
            // If we've already set up on this socket, don't do it again
            if (socketReady && socket.hasListeners('notification')) {
                return true;
            }
            
            console.log('Setting up notification listeners on socket ID:', socket.id);
            
            // Clear any existing listeners and set up new ones
            socket.off('notification');
            socket.on('notification', (notification) => {
                console.log('🚨 NOTIFICATION RECEIVED:', notification);
                
                // Add the new notification to the cache
                queryClient.setQueryData(['notifications'], (oldData) => {
                    if (!oldData) return { notifications: [notification], unread: 1, total: 1 };
                    
                    return {
                        ...oldData,
                        notifications: [notification, ...oldData.notifications],
                        unread: oldData.unread + 1,
                        total: oldData.total + 1
                    };
                });
                
                // Update unread count
                setUnreadCount(prev => prev + 1);
                
                // Display toast notification
                toast.success(notification.message, {
                    icon: '🔔',
                    duration: 5000,
                });
            });
            
            // Ensure we're in the correct room
            if (user._id) {
                console.log(`Joining notification room for user: ${user._id}`);
                socket.emit('joinRoom', { userId: user._id });
            }
            
            setSocketReady(true);
            return true;
        };
        
        // Try to setup listeners immediately
        const success = checkSocketAndSetupListeners();
        
        // If not successful, poll until we can set them up
        let interval;
        if (!success) {
            console.log('Initial socket setup unsuccessful, will retry...');
            interval = setInterval(() => {
                const success = checkSocketAndSetupListeners();
                if (success) {
                    console.log('Socket setup successful on retry');
                    clearInterval(interval);
                }
            }, 5000);
        }
        
        return () => {
            if (interval) clearInterval(interval);
            const socket = getSocket();
            if (socket) {
                socket.off('notification');
            }
            setSocketReady(false);
        };
    }, [isAuthenticated, user, queryClient]);
    
    // Fetch notifications
    const { data, isLoading, error, refetch } = useQuery(
        ['notifications'],
        () => fetchNotifications(),
        {
            enabled: !!isAuthenticated && !!user,
            onSuccess: (data) => {
                setUnreadCount(data.unread || 0);
            }
        }
    );
    
    // Mark a notification as read
    const markNotificationAsRead = useMutation(markAsRead, {
        onSuccess: () => {
            queryClient.invalidateQueries(['notifications']);
            setUnreadCount(prev => Math.max(0, prev - 1));
        }
    });
    
    // Mark all notifications as read
    const markAllNotificationsAsRead = useMutation(markAllAsRead, {
        onSuccess: () => {
            queryClient.invalidateQueries(['notifications']);
            setUnreadCount(0);
        }
    });
    
    // Delete a notification
    const deleteNotificationMutation = useMutation(deleteNotification, {
        onSuccess: () => {
            queryClient.invalidateQueries(['notifications']);
        }
    });
    
    const value = {
        notifications: data?.notifications || [],
        unreadCount,
        isLoading,
        error,
        refetch,
        markAsRead: (id) => markNotificationAsRead.mutate(id),
        markAllAsRead: () => markAllNotificationsAsRead.mutate(),
        deleteNotification: (id) => deleteNotificationMutation.mutate(id)
    };
    
    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotifications must be used within a NotificationProvider');
    }
    return context;
};
