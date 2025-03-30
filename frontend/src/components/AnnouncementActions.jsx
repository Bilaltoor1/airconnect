import { useState, useEffect } from 'react';
import { useDeleteAnnouncement, useUpdateAnnouncement } from '../hooks/useAnnouncement';
import { useAuth } from '../context/AuthContext.jsx';
import toast from 'react-hot-toast';
import { EllipsisIcon, Paperclip } from "lucide-react";
import { Dialog, DialogPanel, DialogTitle, Description } from '@headlessui/react';
import { useAnnouncementsFilter } from "../hooks/useAnnouncementFilter.js";

const AnnouncementActions = ({ announcement }) => {
    const { user } = useAuth();
    const { data: sectionsData, isLoading: sectionsLoading } = useAnnouncementsFilter();
    const [isEditing, setIsEditing] = useState(false);
    const [isDropdownVisible, setIsDropdownVisible] = useState(false);
    const [isPopupVisible, setIsPopupVisible] = useState(false);
    const [description, setDescription] = useState(announcement.description);
    const [image, setImage] = useState(announcement.image);
    const [section, setSection] = useState(announcement.section);

    const { mutate: deleteAnnouncement } = useDeleteAnnouncement();
    const { mutate: updateAnnouncement } = useUpdateAnnouncement();

    // Create refs for edit and delete buttons
    useEffect(() => {
        // Add click handlers to the hidden buttons
        const editButton = document.getElementById(`edit-announcement-${announcement._id}`);
        const deleteButton = document.getElementById(`delete-announcement-${announcement._id}`);
        
        if (editButton) {
            editButton.addEventListener('click', () => {
                setIsEditing(true);
                setIsPopupVisible(true);
            });
        }
        
        if (deleteButton) {
            deleteButton.addEventListener('click', handleDelete);
        }
        
        return () => {
            if (editButton) {
                editButton.removeEventListener('click', () => {
                    setIsEditing(true);
                    setIsPopupVisible(true);
                });
            }
            
            if (deleteButton) {
                deleteButton.removeEventListener('click', handleDelete);
            }
        };
    }, [announcement._id]);

    const handleDelete = () => {
        if (window.confirm('Are you sure you want to delete this announcement?')) {
            setIsDropdownVisible(false);
            setIsPopupVisible(true);
            deleteAnnouncement(announcement._id, {
                onSuccess: () => {
                    toast.success('Announcement deleted successfully');
                    setIsPopupVisible(false);
                },
                onError: (error) => {
                    toast.error(error.response?.data?.message || 'Failed to delete announcement');
                    setIsPopupVisible(false);
                }
            });
        }
    };

    const handleEdit = (e) => {
        e.preventDefault();
        setIsDropdownVisible(false);
        console.log(description, image, section, announcement._id);
        updateAnnouncement({ id: announcement._id, description, image, section }, {
            onSuccess: () => {
                toast.success('Announcement updated successfully');
                setIsEditing(false);
                setIsPopupVisible(false);
            },
            onError: (error) => {
                toast.error(error.response?.data?.message || 'Failed to update announcement');
                setIsPopupVisible(false);
            }
        });
    };

    if (!['teacher', 'coordinator'].includes(user.role) || user._id !== announcement.user._id) {
        return null;
    }

    return (
        <div className="relative">
            <EllipsisIcon onClick={() => setIsDropdownVisible(!isDropdownVisible)} className="cursor-pointer" />
            {isDropdownVisible && (
                <div className="absolute right-0 mt-2 w-48 bg-base-100 rounded shadow-lg">
                    <button className="block w-full text-left px-4 py-2 bg-base-100 text-base-text hover:bg-opacity-50" onClick={() => {
                        setIsEditing(true);
                        setIsPopupVisible(true);
                    }}>Edit</button>
                    <button className="block w-full text-left px-4 py-2 bg-base-100 text-base-text hover:bg-opacity-50" onClick={handleDelete}>Delete</button>
                </div>
            )}
            {isPopupVisible && (
                <Dialog open={isPopupVisible} onClose={() => setIsPopupVisible(false)} className="relative z-50">
                    <div className="fixed inset-0 bg-base-100 bg-opacity-60 flex items-center justify-center">
                        <DialogPanel className="max-w-lg space-y-4 border bg-base-200 rounded-xl border-opacity-20 p-12">
                            <DialogTitle className="font-bold">Edit Announcement</DialogTitle>
                            <Description>Update the details of your announcement</Description>
                            <form onSubmit={handleEdit} className="space-y-4">
                                <textarea
                                    className="textarea textarea-bordered w-full"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    required
                                />
                                <select
                                    className="select select-bordered w-full"
                                    value={section}
                                    onChange={(e) => setSection(e.target.value)}
                                >
                                    <option value="all">All</option>
                                    {sectionsLoading ? (
                                        <option>Loading...</option>
                                    ) : (
                                        sectionsData.map((section) => (
                                            <option key={section._id} value={section.section}>
                                                {section.section}
                                            </option>
                                        ))
                                    )}
                                </select>
                                <div className="flex items-center flex-col">
                                    <img src={image} alt="Announcement" className="h-48 w-full object-cover rounded"/>
                                    <input
                                        type="file"
                                        className="hidden"
                                        id="file-upload"
                                        onChange={(e) => setImage(URL.createObjectURL(e.target.files[0]))}
                                    />
                                    <label htmlFor="file-upload" className="btn w-full btn-outline mt-2">
                                        <Paperclip className="mr-2"/>
                                        Attach Image
                                    </label>
                                </div>
                                <div className="flex gap-4">
                                    <button type="submit" className="btn btn-primary">Update</button>
                                    <button type="button" className="btn btn-secondary" onClick={() => setIsPopupVisible(false)}>Cancel</button>
                                </div>
                            </form>
                        </DialogPanel>
                    </div>
                </Dialog>
            )}
        </div>
    );
};

export default AnnouncementActions;