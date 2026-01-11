import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { COLORS, FONTS } from '../constants/theme';

interface OnboardingHeaderProps {
    currentStep: number;
    totalSteps?: number;
    title?: string;
    highlight?: string;
    subtitle?: string;
}

export default function OnboardingHeader({
    currentStep,
    totalSteps = 4,
    title,
    highlight,
    subtitle
}: OnboardingHeaderProps) {
    const navigation = useNavigation();

    return (
        <View style={styles.container}>
            <View style={styles.topRow}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>

                <View style={styles.progressBarContainer}>
                    {Array.from({ length: totalSteps }).map((_, index) => (
                        <View
                            key={index}
                            style={[
                                styles.progressStep,
                                index + 1 === currentStep && styles.activeStep,
                                index + 1 < currentStep && styles.completedStep
                            ]}
                        />
                    ))}
                </View>
            </View>

            {(title || highlight) && (
                <View style={styles.titleContainer}>
                    <Text style={styles.mainTitle}>{title}</Text>
                    <Text style={styles.highlightTitle}>{highlight}</Text>
                    {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { marginBottom: 30 },
    topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 },
    backButton: { width: 44, height: 44, borderRadius: 22, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.05)' },

    progressBarContainer: { flexDirection: 'row', gap: 6 },
    progressStep: { width: 24, height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.1)' },
    activeStep: { backgroundColor: COLORS.primary, width: 32 },
    completedStep: { backgroundColor: COLORS.primary, opacity: 0.5 },

    titleContainer: { marginTop: 10 },
    mainTitle: { fontSize: 42, color: COLORS.text, fontFamily: FONTS.title },
    highlightTitle: { fontSize: 42, color: COLORS.primary, fontFamily: FONTS.titleItalic, marginBottom: 12 },
    subtitle: { color: COLORS.textSecondary, fontSize: 16, fontFamily: FONTS.regular, lineHeight: 24 },
});