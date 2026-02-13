import React, { createContext, useContext, useEffect, useState } from 'react';
import {
    User,
    onAuthStateChanged,
    signOut as firebaseSignOut
} from 'firebase/auth';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../firebase';

interface UserProfile {
    uid: string;
    email: string;
    displayName: string;
    roleId: 'ADMIN' | 'DEPENDIENTE' | 'REPARTIDOR';
    storeIds: string[];
    status: 'ACTIVE' | 'INACTIVE';
}

interface AuthContextType {
    user: User | null;
    profile: UserProfile | null;
    loading: boolean;
    activeStoreId: string | null;
    setActiveStoreId: (id: string | null) => void;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeStoreId, setActiveStoreIdState] = useState<string | null>(
        localStorage.getItem('les_activeStoreId')
    );

    const setActiveStoreId = (id: string | null) => {
        setActiveStoreIdState(id);
        if (id) {
            localStorage.setItem('les_activeStoreId', id);
        } else {
            localStorage.removeItem('les_activeStoreId');
        }
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
            setUser(authUser);

            if (authUser) {
                // Real-time listener for profile
                const profileRef = doc(db, 'users', authUser.uid);
                const unsubscribeProfile = onSnapshot(profileRef, (docSnap) => {
                    if (docSnap.exists()) {
                        const data = docSnap.data() as UserProfile;
                        setProfile(data);

                        // Auto-assign store if only one exists and none selected
                        if (data.storeIds.length === 1 && !activeStoreId) {
                            setActiveStoreId(data.storeIds[0]);
                        }
                    } else {
                        setProfile(null);
                    }
                    setLoading(false);
                }, (error) => {
                    console.error("Error listening to profile:", error);
                    setLoading(false);
                });

                return () => unsubscribeProfile();
            } else {
                setProfile(null);
                setActiveStoreId(null);
                setLoading(false);
            }
        });

        return () => unsubscribe();
    }, []);

    const signOut = async () => {
        await firebaseSignOut(auth);
        setActiveStoreId(null);
    };

    return (
        <AuthContext.Provider value={{
            user,
            profile,
            loading,
            activeStoreId,
            setActiveStoreId,
            signOut
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
