import React, { useState } from 'react';
import { Bell } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useNotifications } from '../context/NotificationContext';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';

const NotificationBell = () => {
    const [isOpen, setIsOpen] = useState(false);
    const { 
        notifications, 
        unreadCount, 
        markAsRead, 
        markAllAsRead,
        deleteNotification
    } = useNotifications();
    
    const toggleNotifications = () => {
        setIsOpen(!isOpen);
    };
    
    const handleNotificationClick = (notification) => {
        if (!notification.read) {
            markAsRead(notification._id);
        }
        
        setIsOpen(false);
    };
    
    const handleClearAll = () => {
        markAllAsRead();
    };
    
    const getNotificationLink = (notification) => {
        switch (notification.type) {
            case 'announcement':
                return `/announcement/${notification.relatedId}`;
            case 'job':
                return `/job-listings`;
            case 'comment':
                return `/announcement/${notification.relatedId}`;
            case 'application_submitted':
            case 'application_advisor_action':
            case 'application_coordinator_action':
                return `/applications/${notification.relatedId}`;
            default:
                return '#';
        }
    };
    
    const getNotificationIcon = (notification) => {
        switch (notification.type) {
            case 'announcement':
                return '📢';
            case 'job':
                return '💼';
            case 'application_submitted':
                return '📝';
            case 'application_advisor_action':
                return '👨‍🏫';
            case 'application_coordinator_action':
                return '🏢';
            default:
                return '🔔';
        }
    };
    
    return (
        <div className="relative">
            <button 
                className="relative p-2 rounded-full hover:bg-base-300 transition-colors"
                onClick={toggleNotifications}
            >
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>
            
            <AnimatePresence>
                {isOpen && (
                    <motion.div 
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 mt-2 w-80 bg-base-100 shadow-lg rounded-lg overflow-hidden z-50"
                    >
                        <div className="p-4 border-b flex justify-between items-center">
                            <h3 className="font-semibold">Notifications</h3>
                            {notifications.length > 0 && (
                                <button 
                                    className="text-xs text-blue-500 hover:text-blue-700"
                                    onClick={handleClearAll}
                                >
                                    Mark all as read
                                </button>
                            )}
                        </div>
                        
                        <div className="max-h-96 overflow-y-auto">
                            {notifications.length === 0 ? (
                                <div className="p-4 text-center text-gray-500">
                                    No notifications
                                </div>
                            ) : (
                                notifications.map((notification) => (
                                    <Link
                                        key={notification._id}
                                        to={getNotificationLink(notification)}
                                        className={`block p-4 border-b hover:bg-base-200 transition-colors ${
                                            !notification.read ? 'bg-base-200/50' : ''
                                        }`}
                                        onClick={() => handleNotificationClick(notification)}
                                    >
                                        <div className="flex items-start gap-3">
                                            {notification.sender?.profileImage ? (
                                                <img 
                                                    src={notification.sender.profileImage} 
                                                    alt={notification.sender.name}
                                                    className="w-10 h-10 rounded-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-10 h-10 rounded-full bg-primary text-primary-content flex items-center justify-center">
                                                    {getNotificationIcon(notification)}
                                                </div>
                                            )}
                                            
                                            <div className="flex-1">
                                                <div className="font-medium">{notification.title}</div>
                                                <p className="text-sm text-gray-600 dark:text-gray-300">
                                                    {notification.message}
                                                </p>
                                                <div className="text-xs text-gray-500 mt-1">
                                                    {format(new Date(notification.created), 'MMM dd, yyyy • HH:mm')}
                                                </div>
                                            </div>
                                            
                                            {!notification.read && (
                                                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                            )}
                                        </div>
                                    </Link>
                                ))
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default NotificationBell;
