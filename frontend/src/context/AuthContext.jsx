import { createContext, useContext, useState, useEffect } from 'react';
import { useCheckAuth } from '../hooks/useAuth';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const { data: initialUser, isLoading } = useCheckAuth();
    console.log('isLoading:', isLoading);
    console.log('initialUser:', initialUser);
    const [user, setUser] = useState(null);
    const [authChecked, setAuthChecked] = useState(false);

    useEffect(() => {
        if (!isLoading) {
            setUser(initialUser);
            setAuthChecked(true);
        }
    }, [initialUser, isLoading]);

    // Provide both authentication status and loading state
    return (
        <AuthContext.Provider value={{ user, isLoading, setUser, authChecked }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);