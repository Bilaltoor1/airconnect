import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore.js';
import { useEffect, useState } from 'react';
import LoadingSpinner from "./LoadingSpinner.jsx";

const TeacherRoutes = () => {
    const { isAuthenticated, checkAuth, user } = useAuthStore();
    const [loading, setLoading] = useState(true);
    const location = useLocation();

    useEffect(() => {
        checkAuth().finally(() => setLoading(false));
    }, [checkAuth]);

    if (loading) {
        // Show a loading spinner or nothing while checking authentication status
        return <LoadingSpinner />;
    }

    if (!isAuthenticated || user.role !== 'teacher') {
        // Redirect to the last visited page if the user is not a teacher
        return <Navigate to={location.state?.from || '/'} />;
    }

    return <Outlet />;
};

export default TeacherRoutes;