import { useState } from 'react';
import { useComments, useAddComment } from '@/hooks/useComment';
import { Send, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { formatDistanceToNow } from 'date-fns';

const CommentDialog = ({ announcementId, onClose }) => {
    const { data: commentsData, fetchNextPage, hasNextPage, isLoading } = useComments(announcementId);
    const [text, setText] = useState('');
    const { user } = useAuth();
    const { mutate: addComment, isLoading: isSubmitting } = useAddComment();

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!text.trim()) return;
        
        addComment({ announcementId, text }, {
            onSuccess: () => {
                setText('');
            }
        });
    };

    return (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex justify-center items-center p-4">
            <div className="bg-base-100 rounded-lg max-w-2xl w-full shadow-xl max-h-[90vh] flex flex-col">
                <div className="p-4 border-b border-base-200 flex justify-between items-center">
                    <h3 className="text-lg font-bold">Comments</h3>
                    <button onClick={onClose} className="btn btn-sm btn-ghost">
                        <X size={20} />
                    </button>
                </div>
                
                <div className="overflow-auto flex-1 p-4">
                    {isLoading ? (
                        <div className="flex justify-center p-4">
                            <span className="loading loading-spinner"></span>
                        </div>
                    ) : commentsData?.pages[0]?.comments.length === 0 ? (
                        <p className="text-center py-6 text-gray-500">No comments yet. Be the first to comment!</p>
                    ) : (
                        <div className="space-y-4">
                            {commentsData?.pages.map((page, i) => (
                                <div key={i} className="space-y-4">
                                    {page.comments.map(comment => (
                                        <div key={comment._id} className="flex gap-3">
                                            <div className="avatar">
                                                <div className="w-10 h-10 rounded-full">
                                                    <img
                                                        src={comment.user?.profileImage || `https://avatar.iran.liara.run/username?username=${comment?.user?.name}`}
                                                        alt={comment.user?.name || "User"}
                                                        className="object-cover w-full h-full"
                                                    />
                                                </div>
                                            </div>
                                            <div className="bg-base-200 p-3 rounded-lg flex-grow">
                                                <div className="flex justify-between">
                                                    <p className="font-semibold">{comment.user?.name}</p>
                                                    <p className="text-xs text-gray-500">
                                                        {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                                                    </p>
                                                </div>
                                                <p className="mt-1 whitespace-pre-line">{comment.text}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ))}
                            
                            {hasNextPage && (
                                <div className="text-center pt-2">
                                    <button 
                                        onClick={() => fetchNextPage()}
                                        className="btn btn-sm btn-outline"
                                    >
                                        Load more
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
                
                <div className="border-t border-base-200 p-4">
                    <form onSubmit={handleSubmit} className="flex gap-2">
                        <div className="avatar">
                            <div className="w-10 h-10 rounded-full">
                                <img
                                    src={user?.profileImage || `https://avatar.iran.liara.run/username?username=${user?.name}`}
                                    alt={user?.name || "User"}
                                    className="object-cover w-full h-full"
                                />
                            </div>
                        </div>
                        <div className="relative flex-1">
                            <input
                                type="text"
                                placeholder="Write a comment..."
                                className="input input-bordered w-full pr-10"
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                            />
                            <button 
                                type="submit" 
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-green-600 hover:text-green-700 transition-colors disabled:text-gray-400"
                                disabled={!text.trim() || isSubmitting}
                            >
                                <Send size={18} />
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CommentDialog;