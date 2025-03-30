import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from "../context/AuthContext.jsx";

const PublicRoutes = () => {
    const location = useLocation();
    const { user, isLoading, authChecked } = useAuth();
    
    // Wait for auth check to complete
    if (isLoading || !authChecked) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
            </div>
        );
    }

    // If user is authenticated, redirect to home or the page they came from
    if (user) {
        const from = location.state?.from || '/';
        return <Navigate to={from} replace />;
    }

    return <Outlet />;
};

export default PublicRoutes;

