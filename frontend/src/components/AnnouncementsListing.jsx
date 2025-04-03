import { ThumbsUp, ThumbsDown, MessageSquare, User } from 'lucide-react';
import { useDislikeAnnouncement, useLikeAnnouncement } from "../hooks/useAnnouncement.js";
import { useAuth } from "../context/AuthContext.jsx";
import { formatDistanceToNow } from 'date-fns';
import AnnouncementActions from "./AnnouncementActions.jsx";
import CommentDialog from "@/components/CommentDialog.jsx";
import { useState } from "react";
import { Link } from "react-router-dom";
import AnnouncementBadges from './AnnouncementBadges';
import MediaDisplay from './MediaDisplay';
import UserAvatar from './UserAvatar';

const AnnouncementsListing = ({ announcements }) => {
    const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
    const likeMutation = useLikeAnnouncement();
    const dislikeMutation = useDislikeAnnouncement();
    const { user } = useAuth();

    const handleLike = (id) => {
        likeMutation.mutate(id);
    };

    const handleDislike = (id) => {
        dislikeMutation.mutate(id);
    };

    const handleOpenComments = (announcementId) => {
        setSelectedAnnouncement(announcementId);
    };

    const handleCloseComments = () => {
        setSelectedAnnouncement(null);
    };

    return (
        <div className="space-y-4 mt-6">
            {announcements?.map((announcement) => {
                const hasLiked = announcement.likes?.includes(user?._id); // Check if the user has liked this announcement
                const hasDisliked = announcement.dislikes?.includes(user?._id); // Check if the user has disliked this announcement

                return (
                    announcement.user?.role === 'teacher' && announcement.batchName ? (
                        <Link to={`/announcement/${announcement._id}`} key={announcement._id}>
                            <AnnouncementCard 
                                announcement={announcement} 
                                hasDisliked={hasDisliked}
                                handleDislike={handleDislike} 
                                handleLike={handleLike}
                                handleOpenComments={handleOpenComments} 
                                hasLiked={hasLiked}
                                currentUser={user}
                            />
                        </Link>
                    ) : (
                        <div key={announcement._id} className="p-4 bg-base-100 shadow-lg rounded-lg">
                            <AnnouncementCard 
                                announcement={announcement} 
                                hasDisliked={hasDisliked}
                                handleDislike={handleDislike} 
                                handleLike={handleLike}
                                handleOpenComments={handleCloseComments} 
                                hasLiked={hasLiked}
                                currentUser={user}
                            />
                        </div>
                    )
                );
            })}
            {selectedAnnouncement && (
                <CommentDialog
                    announcementId={selectedAnnouncement}
                    onClose={handleCloseComments}
                />
            )}
        </div>
    );
};

export default AnnouncementsListing;

const AnnouncementCard = ({ announcement, handleLike, hasLiked, handleDislike, hasDisliked, handleOpenComments, currentUser }) => {
    // Check if current user is the creator of this announcement
    const isCreator = currentUser && announcement?.user?._id === currentUser._id;
    
    return (
        <div className="flex flex-col">
            <div className="flex items-start space-x-4">
                <UserAvatar user={announcement.user} size="lg" />
                <div className="flex-1">
                    <div className="flex justify-between items-center">
                        <div>
                            <h3 className="font-bold">{announcement?.user?.name}</h3>
                            <AnnouncementBadges announcement={announcement} />
                        </div>
                        <div className='flex flex-col items-end'>
                            {isCreator && <AnnouncementActions announcement={announcement}/>}
                            <div className='text-xs'>
                                {formatDistanceToNow(new Date(announcement.createdAt), {addSuffix: true})}
                            </div>
                        </div>
                    </div>
                    <p className="mt-2">{announcement.description}</p>
                    
                    {/* Display media if available */}
                    {announcement.media && announcement.media.length > 0 && (
                        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {announcement.media.slice(0, 2).map((media, index) => (
                                <MediaDisplay key={index} media={media} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
            
            {/* Action buttons */}
            <div className="flex justify-end items-center space-x-4 mt-3">
                {/* Show comments button for all announcements */}
                <div 
                    className="flex items-center gap-1 cursor-pointer hover:text-green-500 transition-colors" 
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleOpenComments(announcement._id);
                    }}
                >
                    <MessageSquare className="w-5 h-5"/>
                    <span>{announcement?.commentsCount || 0}</span>
                </div>
                <button 
                    className="flex items-center space-x-1 hover:text-green-500 transition-colors" 
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleLike(announcement._id);
                    }}
                >
                    <ThumbsUp className={`w-5 h-5 ${hasLiked ? 'text-green-500 fill-green-500' : ''}`}/>
                    <span>{announcement.likes?.length || 0}</span>
                </button>
                <button 
                    className="flex items-center space-x-1 hover:text-red-500 transition-colors" 
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleDislike(announcement._id);
                    }}
                >
                    <ThumbsDown className={`w-5 h-5 ${hasDisliked ? 'text-red-500 fill-red-500' : ''}`}/>
                    <span>{announcement.dislikes?.length || 0}</span>
                </button>
            </div>
        </div>
    );
};