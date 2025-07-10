import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../config/firebase';
import { onAuthStateChanged } from 'firebase/auth';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Listen for auth state changes
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                // Get the ID token
                const token = await user.getIdToken();
                // Store token in localStorage
                localStorage.setItem('authToken', token);
                setCurrentUser(user);
            } else {
                // Remove token when user logs out
                localStorage.removeItem('authToken');
                setCurrentUser(null);
            }
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const logout = async () => {
        try {
            await auth.signOut();
            localStorage.removeItem('authToken');
        } catch (error) {
            console.error('Error signing out:', error);
        }
    };

    const value = {
        currentUser,
        logout,
        loading
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);