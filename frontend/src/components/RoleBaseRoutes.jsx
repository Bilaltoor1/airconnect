import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { hasRole } from '../utils/roleUtils';
import { useAuth } from "../context/AuthContext.jsx";

const RoleBasedRoutes = ({ requiredRole }) => {
    const location = useLocation();
    const { user, isLoading, authChecked } = useAuth();

    // Wait until authentication check is complete before making decisions
    if (isLoading || !authChecked) {
        // Show loading indicator while checking auth
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
            </div>
        );
    }

    // Only redirect if auth check is complete and no user is found
    if (!user) {
        // If user is not authenticated, redirect to login
        // Save the current location they were trying to access
        return <Navigate to="/login" state={{ from: location.pathname }} />;
    }

    // Only redirect if auth check is complete and user doesn't have the required role
    if (!hasRole(user, requiredRole) && user.identityConfirmed) {
        // If user does not have the required role, redirect to home
        return <Navigate to="/" />;
    }

    return <Outlet />;
};

export default RoleBasedRoutes;