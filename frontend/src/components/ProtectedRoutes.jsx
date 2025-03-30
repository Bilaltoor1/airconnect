import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from "../context/AuthContext.jsx";

const ProtectedRoutes = () => {
    const location = useLocation();
    const { user, isLoading, authChecked } = useAuth();

    // Wait until authentication check is complete
    if (isLoading || !authChecked) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
            </div>
        );
    }

    // Only redirect if auth check is complete and no user found
    if (!user) {
        return <Navigate to="/login" state={{ from: location.pathname }} />;
    }

    return <Outlet />;
};

export default ProtectedRoutes;
