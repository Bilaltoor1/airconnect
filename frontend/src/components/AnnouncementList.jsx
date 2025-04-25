import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import AnnouncementBadges from './AnnouncementBadges';
import AnnouncementActions from './AnnouncementActions';
import { MessageSquare, ChevronDown, ChevronUp, ThumbsUp, ThumbsDown } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useLikeAnnouncement, useDislikeAnnouncement } from '../hooks/useAnnouncement';
import MediaDisplay from './MediaDisplay';
import UserAvatar from './UserAvatar';

const AnnouncementList = ({ announcements }) => {
  return (
    <div className="space-y-6">
      {announcements.map((announcement) => (
        <AnnouncementItem 
          key={announcement._id} 
          announcement={announcement} 
        />
      ))}
    </div>
  );
};

const AnnouncementItem = ({ announcement }) => {
  const [expanded, setExpanded] = useState(false);
  const { user } = useAuth();
  const { mutate: likeAnnouncement } = useLikeAnnouncement();
  const { mutate: dislikeAnnouncement } = useDislikeAnnouncement();
  const navigate = useNavigate();
  
  // Check if current user is the creator
  const isCreator = announcement?.user?._id === user?._id;
  
  // Check if user has liked or disliked
  const hasLiked = announcement.likes?.includes(user?._id);
  const hasDisliked = announcement.dislikes?.includes(user?._id);
  
  // Toggle expanded state or navigate to details page
  const toggleExpanded = () => {
    if (expanded) {
      setExpanded(false);
    } else {
      navigate(`/announcement/${announcement._id}`);
    }
  };
  
  // Handle like/dislike
  const handleLike = (e) => {
    e.stopPropagation();
    likeAnnouncement(announcement._id);
  };
  
  const handleDislike = (e) => {
    e.stopPropagation();
    dislikeAnnouncement(announcement._id);
  };
  
  return (
    <div className="bg-base-100 rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200">
      <div className="p-6">
        <div className="flex justify-between items-start">
          <div className="flex items-center space-x-4">
            <UserAvatar user={announcement.user} size="md" />
            
            <div>
              <h3 className="font-semibold text-lg">{announcement.user?.name}</h3>
              <div className="text-xs text-gray-500">
                {formatDistanceToNow(new Date(announcement.createdAt), { addSuffix: true })}
              </div>
              <AnnouncementBadges announcement={announcement} />
            </div>
          </div>
          
          {/* Show actions for creator */}
          {isCreator && (
            <div className="relative z-10">
              <AnnouncementActions announcement={announcement} />
            </div>
          )}
        </div>
        
        <p className={`mt-4 ${!expanded && 'line-clamp-3'}`}>{announcement.description}</p>
        
        {/* Display media if available */}
        {announcement.media && announcement.media.length > 0 && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
            {announcement.media.slice(0, expanded ? announcement.media.length : 1).map((media, index) => (
              <MediaDisplay key={index} media={media} />
            ))}
          </div>
        )}
        
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <button 
                onClick={handleLike}
                className={`p-1 rounded-full transition-colors ${hasLiked ? 'text-green-500' : 'text-gray-500 hover:text-green-500'}`}
              >
                <ThumbsUp size={16} className={`${hasLiked ? 'fill-green-500 text-green-500' : ''}`} />
              </button>
              <span className="text-sm">{announcement.likes?.length || 0}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={handleDislike}
                className={`p-1 rounded-full transition-colors ${hasDisliked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'}`}
              >
                <ThumbsDown size={16} className={`${hasDisliked ? 'fill-red-500 text-red-500' : ''}`} />
              </button>
              <span className="text-sm">{announcement.dislikes?.length || 0}</span>
            </div>
            
            <Link to={`/announcement/${announcement._id}`} className="flex items-center gap-1 text-gray-500 hover:text-green-500 transition-colors">
              <MessageSquare size={16} />
              <span className="text-sm">{announcement.commentsCount || 0}</span>
            </Link>
          </div>
          
          {/* More details button - now navigates directly to details page */}
          <button 
            className="flex items-center text-sm text-green-600 hover:text-green-700 transition-colors"
            onClick={toggleExpanded}
          >
            {expanded ? (
              <>
                <ChevronUp size={16} className="mr-1" />
                Show less
              </>
            ) : (
              <>
                <ChevronDown size={16} className="mr-1" />
                More details
              </>
            )}
          </button>
        </div>
        
        {/* Hidden buttons for AnnouncementActions to click programmatically */}
        <div className="hidden">
          <button id={`edit-announcement-${announcement._id}`}></button>
          <button id={`delete-announcement-${announcement._id}`}></button>
        </div>
      </div>
    </div>
  );
};

export default AnnouncementList;
