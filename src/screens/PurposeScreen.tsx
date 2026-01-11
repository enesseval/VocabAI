import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';

import { RootStackParamList } from '../types/navigation';
import OnboardingHeader from '../components/OnboardingHeader';
import OnboardingFooter from '../components/OnboardingFooter';
import { useOnboarding } from '../context/OnboardingContext';
import { COLORS, FONTS, SIZES } from '../constants/theme';

export default function PurposeScreen() {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const { t } = useTranslation();
    const { userProfile, updateProfile } = useOnboarding();

    const PURPOSES = [
        { id: 'career', title: t('onboarding.purpose.options.career'), subtitle: t('onboarding.purpose.options.careerSub'), icon: 'briefcase' },
        { id: 'culture', title: t('onboarding.purpose.options.culture'), subtitle: t('onboarding.purpose.options.cultureSub'), icon: 'earth' },
        { id: 'brain', title: t('onboarding.purpose.options.brain'), subtitle: t('onboarding.purpose.options.brainSub'), icon: 'fitness' },
        { id: 'exam', title: t('onboarding.purpose.options.exam'), subtitle: t('onboarding.purpose.options.examSub'), icon: 'school' },
    ];

    const handleSelect = (id: string) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        updateProfile({ purpose: id });
    };

    return (
        <View style={styles.container}>
            <StatusBar style="light" />
            <LinearGradient colors={['#1e1b4b', '#050406', '#000']} locations={[0, 0.3, 1]} style={StyleSheet.absoluteFill} />

            <SafeAreaView style={styles.safeArea}>
                <OnboardingHeader
                    currentStep={3}
                    title={t('onboarding.purpose.title')}
                    highlight={t('onboarding.purpose.highlight')}
                    subtitle={t('onboarding.purpose.subtitle')}
                />

                <View style={styles.gridContainer}>
                    <View style={styles.grid}>
                        {PURPOSES.map((item) => {
                            const isSelected = userProfile.purpose === item.id;
                            return (
                                <TouchableOpacity
                                    key={item.id}
                                    activeOpacity={0.9}
                                    onPress={() => handleSelect(item.id)}
                                    style={[styles.card, isSelected && styles.cardSelected]}
                                >
                                    <View style={[styles.iconCircle, isSelected && { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                                        <Ionicons name={item.icon as any} size={28} color={isSelected ? COLORS.primary : '#fff'} />
                                    </View>
                                    <View>
                                        <Text style={[styles.cardTitle, isSelected && { color: COLORS.primary }]}>{item.title}</Text>
                                        <Text style={styles.cardSubtitle}>{item.subtitle}</Text>
                                    </View>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </View>

                <OnboardingFooter
                    text={t('onboarding.common.continue')}
                    onPress={() => navigation.navigate('Interests')}
                    disabled={!userProfile.purpose}
                />
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.bg },
    safeArea: { flex: 1, paddingHorizontal: SIZES.padding },
    gridContainer: { flex: 1, marginTop: 20 },
    grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 15 },
    card: {
        width: (SIZES.width - 63) / 2,
        aspectRatio: 0.85,
        borderRadius: 24,
        backgroundColor: COLORS.cardBg,
        padding: 20,
        justifyContent: 'space-between',
        borderWidth: 1.5,
        borderColor: 'transparent'
    },
    cardSelected: {
        backgroundColor: COLORS.activeGlow,
        borderColor: COLORS.primary
    },
    iconCircle: { width: 52, height: 52, borderRadius: 26, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
    cardTitle: { color: COLORS.text, fontSize: 18, fontFamily: FONTS.bold, marginBottom: 6 },
    cardSubtitle: { color: COLORS.textSecondary, fontSize: 13, fontFamily: FONTS.regular, lineHeight: 18 },
});