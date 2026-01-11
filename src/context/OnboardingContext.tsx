// src/context/OnboardingContext.tsx
import React, { createContext, useState, useContext, ReactNode } from 'react';

// Veri Tipi
interface UserProfile {
    name: string;
    age: string;
    nativeLang: string | null;
    targetLang: string | null;
    purpose: string | null;
    interests: number[];
}

interface OnboardingContextType {
    userProfile: UserProfile;
    updateProfile: (data: Partial<UserProfile>) => void;
    resetProfile: () => void;
}

const defaultProfile: UserProfile = {
    name: '',
    age: '',
    nativeLang: null,
    targetLang: null,
    purpose: null,
    interests: [],
};

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export const OnboardingProvider = ({ children }: { children: ReactNode }) => {
    const [userProfile, setUserProfile] = useState<UserProfile>(defaultProfile);

    const updateProfile = (data: Partial<UserProfile>) => {
        setUserProfile((prev) => ({ ...prev, ...data }));
    };

    const resetProfile = () => {
        setUserProfile(defaultProfile);
    };

    return (
        <OnboardingContext.Provider value={{ userProfile, updateProfile, resetProfile }}>
            {children}
        </OnboardingContext.Provider>
    );
};

// Hook
export const useOnboarding = () => {
    const context = useContext(OnboardingContext);
    if (!context) throw new Error('useOnboarding must be used within an OnboardingProvider');
    return context;
};