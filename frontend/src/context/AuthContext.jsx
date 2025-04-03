import { createContext, useContext, useState, useEffect } from 'react';
import { useCheckAuth } from '../hooks/useAuth';
import { initializeSocket, disconnectSocket } from '../services/socket.service';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const { data: initialUser, isLoading } = useCheckAuth();
    const [user, setUser] = useState(null);
    const [authChecked, setAuthChecked] = useState(false);
    const [socketInitialized, setSocketInitialized] = useState(false);

    // Initialize user state when auth check completes
    useEffect(() => {
        if (!isLoading) {
            setUser(initialUser);
            setAuthChecked(true);
            
            // Initialize socket when user is logged in
            if (initialUser) {
                console.log("User authenticated, initializing socket connection");
                
                // Get token from cookies
                const getCookie = (name) => {
                    const value = `; ${document.cookie}`;
                    const parts = value.split(`; ${name}=`);
                    if (parts.length === 2) return parts.pop().split(';').shift();
                    return null;
                };
                
                const token = getCookie('token');
                
                if (token) {
                    try {
                        console.log("Found auth token, connecting socket");
                        initializeSocket(token);
                        setSocketInitialized(true);
                    } catch (error) {
                        console.error("Socket initialization error:", error);
                        // Don't block the auth flow on socket errors
                    }
                } else {
                    console.error("No auth token found for socket connection");
                }
            } else if (socketInitialized) {
                // Disconnect socket when user is logged out
                console.log("User logged out, disconnecting socket");
                disconnectSocket();
                setSocketInitialized(false);
            }
        }
    }, [initialUser, isLoading]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (socketInitialized) {
                disconnectSocket();
            }
        };
    }, [socketInitialized]);

    const updateUser = (newUserData) => {
        setUser(newUserData);
    };

    // Provide both authentication status and loading state
    return (
        <AuthContext.Provider value={{ 
            user, 
            isLoading, 
            setUser: updateUser, 
            authChecked,
            isAuthenticated: !!user,
            initializeUserSocket: (token) => {
                if (token && !socketInitialized) {
                    try {
                        initializeSocket(token);
                        setSocketInitialized(true);
                    } catch (error) {
                        console.error("Socket initialization error:", error);
                    }
                }
            }
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);