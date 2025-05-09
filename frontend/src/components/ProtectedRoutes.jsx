import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore.js';
import { useEffect, useState } from 'react';
import LoadingSpinner from "./LoadingSpinner.jsx";

const ProtectedRoutes = () => {
    const { isAuthenticated, checkAuth, user } = useAuthStore();
    const [loading, setLoading] = useState(true);
    const [initialCheckDone, setInitialCheckDone] = useState(false);
    const location = useLocation();

    useEffect(() => {
        checkAuth().finally(() => {
            setLoading(false);
            setInitialCheckDone(true);
        });
    }, [checkAuth]);

    // During initial load, show loading spinner
    if (loading && !initialCheckDone) {
        return <LoadingSpinner />;
    }

    // After initial check, if not authenticated, redirect immediately without waiting
    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location.pathname }} />;
    }
    
    // If user is authenticated but hasn't completed profile setup
    // and they're not already on the profile-setup page, redirect to profile-setup
    if (user && !user.profileSetup && location.pathname !== "/profile-setup") {
        return <Navigate to="/profile-setup" />;
    }

    return <Outlet />;
};

export default ProtectedRoutes;
