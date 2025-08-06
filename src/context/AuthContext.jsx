import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../config/firebase';
import { 
    onAuthStateChanged, 
    signInWithEmailAndPassword, 
    sendPasswordResetEmail,
    confirmPasswordReset,
    verifyPasswordResetCode,
    applyActionCode
} from 'firebase/auth';
import config from '../config/api.js';

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
        try {
            // Call your server endpoint instead of Firebase directly
            const response = await fetch(`${config.baseURL}/user/reset-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email })
            });

            const data = await response.json();
            if (!data.status === 'success') {
                throw new Error(data.message);
            }

            return true;
        } catch (error) {
            console.error('Reset password error:', error);
            throw error;
        }
    };

    const confirmPasswordReset = async (oobCode, newPassword) => {
        if (!oobCode) {
            throw new Error('No reset code provided');
        }
        
        try {
            await auth.confirmPasswordReset(oobCode, newPassword);
            return true;
        } catch (error) {
            console.error('Confirm password reset error:', error);
            throw error;
        }
    };

    const value = {
        currentUser,
        logout,
        login,
        resetPassword,
        confirmPasswordReset,
        loading
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);

