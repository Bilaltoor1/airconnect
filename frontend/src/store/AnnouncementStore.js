import { create } from "zustand";
import axios from "axios";

const API_URL = import.meta.env.MODE === "development" ? "http://localhost:3001/api/announcements" : "/api/announcements";

axios.defaults.withCredentials = true;

export const useAnnouncementStore = create((set) => ({
    announcements: [],
    error: null,
    isLoading: false,
    message:"",
    CreateAnnouncement: async (description,image) => {
        set({ isLoading: true, error: null });
        try {
             await axios.post(`${API_URL}`, { description, image });
            set({ message: "Announcement Created Successfully", isLoading: false });
        } catch (error) {
            set({ error: error.data.message || "Announcement not created", isLoading: false });
            throw error;
        }
    },
}));
