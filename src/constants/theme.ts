// src/constants/theme.ts
import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export const COLORS = {
    bg: '#050406',
    primary: '#fbbf24', // Gold
    primaryLight: 'rgba(251, 191, 36, 0.7)',
    secondary: '#7c3aed', // Purple
    text: '#ffffff',
    textSecondary: 'rgba(255,255,255,0.6)',
    inputLabel: '#9ca3af',
    inputBorder: 'rgba(255,255,255,0.2)',
    cardBg: 'rgba(255,255,255,0.05)',
    activeGlow: 'rgba(251, 191, 36, 0.15)',
    error: '#ef4444',
};

export const FONTS = {
    // App.tsx'te yüklü olan fontlarla eşleştirdik
    title: 'Merriweather-Regular',
    titleItalic: 'Merriweather-Bold', // İtalik yoksa Bold kullanalım vurgu için
    regular: 'Inter-Regular',
    semiBold: 'Inter-SemiBold',
    bold: 'Merriweather-Bold',
};

export const SIZES = {
    width,
    height,
    padding: 24,
    borderRadius: 24,
};