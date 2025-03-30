import { useState } from 'react';
import { FileText, File, FileImage, FileVideo, FileAudio, FileSpreadsheet, FileArchive } from 'lucide-react';
import ImagePreviewModal from './ImagePreviewModal';

const MediaDisplay = ({ media, className = "" }) => {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState(null);

  if (!media) return null;

  const getFileExtension = (url) => {
    // Extract filename from URL and get extension
    const fileName = url.split('/').pop();
    return fileName.split('.').pop().toLowerCase();
  };

  const getFileIcon = (url) => {
    const extension = getFileExtension(url);
    
    // Document types
    if (['pdf', 'doc', 'docx'].includes(extension)) return <FileText size={48} className="text-blue-500" />;
    if (['xls', 'xlsx', 'csv'].includes(extension)) return <FileSpreadsheet size={48} className="text-green-600" />;
    if (['ppt', 'pptx'].includes(extension)) return <FileText size={48} className="text-orange-500" />;
    if (['txt', 'rtf'].includes(extension)) return <FileText size={48} className="text-gray-500" />;
    if (['zip', 'rar', '7z'].includes(extension)) return <FileArchive size={48} className="text-purple-500" />;
    
    // Audio types
    if (['mp3', 'wav', 'ogg'].includes(extension)) return <FileAudio size={48} className="text-yellow-500" />;
    
    // Default file icon
    return <File size={48} className="text-gray-500" />;
  };

  const isImage = (url) => {
    const extension = getFileExtension(url);
    return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(extension);
  };

  const isVideo = (url) => {
    const extension = getFileExtension(url);
    return ['mp4', 'webm', 'ogg', 'mov', 'avi'].includes(extension);
  };

  const isDocument = (url) => {
    return !isImage(url) && !isVideo(url);
  };

  const openPreview = (media) => {
    setSelectedMedia(media);
    setPreviewOpen(true);
  };

  return (
    <>
      <div className={`rounded-lg overflow-hidden bg-base-200 ${className}`}>
        {isImage(media) ? (
          <div className="cursor-pointer" onClick={() => openPreview(media)}>
            <img src={media} alt="Attachment" className="w-full h-auto object-cover" />
          </div>
        ) : isVideo(media) ? (
          <div className="relative">
            <video 
              src={media} 
              controls 
              className="w-full h-auto" 
              poster={`https://api.microlink.io/?url=${encodeURIComponent(media)}&screenshot=true&meta=false&embed=screenshot.url`}
            />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-6 bg-base-300 hover:bg-base-200 transition-colors cursor-pointer" onClick={() => window.open(media, '_blank')}>
            {getFileIcon(media)}
            <p className="mt-2 text-sm font-medium text-center truncate max-w-full">
              {media.split('/').pop()}
            </p>
          </div>
        )}
      </div>

      <ImagePreviewModal
        isOpen={previewOpen}
        onClose={() => setPreviewOpen(false)}
        imageUrl={selectedMedia}
        altText="Media preview"
      />
    </>
  );
};

export default MediaDisplay;
