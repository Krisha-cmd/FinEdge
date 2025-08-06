import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../config/firebase';
import { onAuthStateChanged, signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';

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

    const login = async (email, password) => {
        try {
            const result = await signInWithEmailAndPassword(auth, email, password);
            return result;
        } catch (error) {
            throw error;
        }
    };

    const resetPassword = async (email) => {
        return sendPasswordResetEmail(auth, email, {
            url: 'https://teninfinity.com/#/login', // URL to redirect after password reset
            handleCodeInApp: false
        });
    };

    const value = {
        currentUser,
        logout,
        login,
        resetPassword,
        loading
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);