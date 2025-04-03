import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAnnouncement, useLikeAnnouncement, useDislikeAnnouncement } from "@/hooks/useAnnouncement.js";
import { useComments, useAddComment } from '@/hooks/useComment';
import AnnouncementBadges from '@/components/AnnouncementBadges';
import { useAuth } from '@/context/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import { ThumbsUp, ThumbsDown, Send, ArrowLeft, Loader } from 'lucide-react';
import MediaDisplay from '@/components/MediaDisplay';
import UserAvatar from '@/components/UserAvatar';

function AnnouncementDetail() {
    const { id } = useParams();
    const { data: announcement, isLoading } = useAnnouncement(id);
    const [text, setText] = useState('');
    const { data: commentsData, fetchNextPage, hasNextPage } = useComments(id);
    const addCommentMutation = useAddComment();
    const likeMutation = useLikeAnnouncement();
    const dislikeMutation = useDislikeAnnouncement();
    const { user } = useAuth();
    
    const handleAddComment = () => {
        if (!text.trim()) return;
        addCommentMutation.mutate({ announcementId: id, text });
        setText('');
    };
    
    const handleLike = () => {
        likeMutation.mutate(id);
    };
    
    const handleDislike = () => {
        dislikeMutation.mutate(id);
    };
    
    // Check if user has liked or disliked
    const hasLiked = announcement?.likes?.includes(user?._id);
    const hasDisliked = announcement?.dislikes?.includes(user?._id);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <Loader size={24} className="animate-spin text-green-500" />
            </div>
        );
    }

    if (!announcement) {
        return <div className="text-center py-10">No announcement found.</div>;
    }

    return (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 pb-16">
            <Link to="/" className="inline-flex items-center text-green-600 hover:text-green-700 mb-6 transition-colors">
                <ArrowLeft size={18} className="mr-1" />
                Back to Announcements
            </Link>
            
            <div className="bg-base-100 rounded-xl shadow-md overflow-hidden">
                {/* Announcement header */}
                <div className="p-6">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                            <UserAvatar 
                                user={announcement.user} 
                                size="lg" 
                                className="tooltip" 
                                data-tip={announcement.user?.name}
                            />
                            <div>
                                <h3 className="font-bold text-lg">{announcement.user?.name}</h3>
                                <div className="text-sm text-gray-500">
                                    {formatDistanceToNow(new Date(announcement.createdAt), { addSuffix: true })}
                                </div>
                            </div>
                        </div>
                        
                        <div className="flex space-x-2">
                            <button 
                                onClick={handleLike}
                                className={`p-2 rounded-full transition-all ${hasLiked ? 
                                    'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' : 
                                    'hover:bg-base-200'}`}
                            >
                                <ThumbsUp size={20} className={hasLiked ? 'fill-green-500' : ''} />
                            </button>
                            <button 
                                onClick={handleDislike}
                                className={`p-2 rounded-full transition-all ${hasDisliked ? 
                                    'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' : 
                                    'hover:bg-base-200'}`}
                            >
                                <ThumbsDown size={20} className={hasDisliked ? 'fill-red-500' : ''} />
                            </button>
                        </div>
                    </div>
                    
                    {/* Badges */}
                    <div className="mt-3">
                        <AnnouncementBadges announcement={announcement} />
                    </div>
                    
                    {/* Likes and dislikes counter */}
                    <div className="mt-4 flex items-center text-sm text-gray-500">
                        <span>{announcement.likes?.length || 0} likes</span>
                        <span className="mx-2">•</span>
                        <span>{announcement.dislikes?.length || 0} dislikes</span>
                    </div>
                    
                    {/* Main content */}
                    <div className="mt-4">
                        <p className="text-base-content whitespace-pre-line">{announcement?.description}</p>
                    </div>
                    
                    {/* Media display */}
                    {announcement.media && announcement.media.length > 0 && (
                        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                            {announcement.media.map((media, index) => (
                                <MediaDisplay key={index} media={media} />
                            ))}
                        </div>
                    )}
                </div>
                
                {/* Comment section */}
                <div className="border-t border-base-300 p-6">
                    <h2 className="text-lg font-bold mb-4">Comments ({commentsData?.pages[0]?.total || 0})</h2>
                    
                    {/* Add comment */}
                    <div className="flex gap-3">
                        <UserAvatar 
                            user={user} 
                            size="md" 
                            className="tooltip" 
                            data-tip={user?.name}
                        />
                        <div className="flex-grow">
                            <div className="relative">
                                <textarea
                                    value={text}
                                    onChange={(e) => setText(e.target.value)}
                                    placeholder="Write a comment..."
                                    className="textarea textarea-bordered w-full focus:ring-2 focus:ring-green-500 pr-12"
                                    rows={3}
                                />
                                <button 
                                    onClick={handleAddComment}
                                    disabled={!text.trim() || addCommentMutation.isLoading}
                                    className="absolute bottom-3 right-3 p-2 text-green-600 hover:text-green-700 disabled:text-gray-400 disabled:cursor-not-allowed"
                                >
                                    <Send size={18} />
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    {/* Display comments */}
                    <div className="space-y-6 mt-8">
                        {commentsData?.pages.map((page, pageIndex) => (
                            <div key={pageIndex} className="space-y-6">
                                {page.comments.map((comment) => (
                                    <div key={comment._id} className="flex gap-3">
                                        <UserAvatar 
                                            user={comment.user} 
                                            size="md" 
                                            className="tooltip" 
                                            data-tip={comment.user?.name}
                                        />
                                        <div className="flex-grow bg-base-200 p-3 rounded-lg">
                                            <div className="flex justify-between items-start">
                                                <p className="font-semibold">{comment.user.name}</p>
                                                <p className="text-xs text-gray-500">{formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}</p>
                                            </div>
                                            <p className="mt-1 whitespace-pre-line">{comment.text}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                    
                    {/* Load more comments */}
                    {hasNextPage && (
                        <div className="flex justify-center mt-6">
                            <button 
                                onClick={() => fetchNextPage()} 
                                className="btn btn-outline hover:bg-green-500 hover:text-white hover:border-green-500"
                            >
                                Load More Comments
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default AnnouncementDetail;