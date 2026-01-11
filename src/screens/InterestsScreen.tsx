import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Kayıt için

import { RootStackParamList } from '../types/navigation';
import OnboardingHeader from '../components/OnboardingHeader';
import OnboardingFooter from '../components/OnboardingFooter';
import { useOnboarding } from '../context/OnboardingContext';
import { COLORS, FONTS, SIZES } from '../constants/theme';

type Topic = { id: number; name: string; icon: keyof typeof Ionicons.glyphMap; };

const TOPICS: Topic[] = [
    { id: 1, name: 'Teknoloji', icon: 'hardware-chip-outline' },
    { id: 2, name: 'Felsefe', icon: 'library-outline' },
    { id: 3, name: 'Sanat', icon: 'color-palette-outline' },
    { id: 4, name: 'İş Dünyası', icon: 'briefcase-outline' },
    { id: 5, name: 'Doğa', icon: 'leaf-outline' },
    { id: 6, name: 'Bilim', icon: 'flask-outline' },
    { id: 7, name: 'Edebiyat', icon: 'book-outline' },
    { id: 8, name: 'Tarih', icon: 'hourglass-outline' },
    { id: 9, name: 'Sinema', icon: 'film-outline' },
    { id: 10, name: 'Seyahat', icon: 'airplane-outline' },
];

const TopicPill = ({ item, isSelected, onPress }: { item: Topic, isSelected: boolean, onPress: () => void }) => {
    return (
        <TouchableOpacity activeOpacity={0.8} onPress={onPress} style={[styles.pill, isSelected && styles.pillSelected]}>
            <View style={styles.pillContent}>
                <Ionicons name={item.icon} size={18} color={isSelected ? COLORS.primary : 'rgba(255,255,255,0.6)'} style={{ marginRight: 8 }} />
                <Text style={[styles.pillText, isSelected && { color: COLORS.primary, fontFamily: FONTS.semiBold }]}>{item.name}</Text>
            </View>
            {isSelected && <View style={styles.pillGlow} />}
        </TouchableOpacity>
    );
};

export default function InterestsScreen() {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const { t } = useTranslation();
    const { userProfile, updateProfile } = useOnboarding();

    const toggleTopic = (id: number) => {
        Haptics.selectionAsync();
        const current = userProfile.interests;
        if (current.includes(id)) {
            updateProfile({ interests: current.filter(item => item !== id) });
        } else {
            updateProfile({ interests: [...current, id] });
        }
    };

    const handleFinish = async () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        try {
            // Şimdilik sadece logluyoruz, DB yok.
            // AsyncStorage ile lokal kayıt:
            await AsyncStorage.setItem('user_persona', JSON.stringify(userProfile));
            console.log("KAYDEDİLEN PROFİL:", userProfile);
            // navigation.replace('Home'); // Ana sayfaya git
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar style="light" />
            <LinearGradient colors={['#1e1b4b', '#050406', '#000']} locations={[0, 0.3, 1]} style={StyleSheet.absoluteFill} />

            <SafeAreaView style={styles.safeArea}>
                <OnboardingHeader
                    currentStep={4}
                    title={t('onboarding.interests.title')}
                    highlight={t('onboarding.interests.highlight')}
                    subtitle={t('onboarding.interests.subtitle')}
                />

                <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 150, alignItems: 'center' }} showsVerticalScrollIndicator={false}>
                    <View style={styles.pillContainer}>
                        {TOPICS.map((item) => (
                            <TopicPill
                                key={item.id}
                                item={item}
                                isSelected={userProfile.interests.includes(item.id)}
                                onPress={() => toggleTopic(item.id)}
                            />
                        ))}
                    </View>
                </ScrollView>

                <OnboardingFooter
                    text={t('onboarding.common.createPersona')}
                    onPress={handleFinish}
                    disabled={userProfile.interests.length === 0}
                />
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.bg },
    safeArea: { flex: 1, paddingHorizontal: SIZES.padding },
    pillContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 12, width: '100%', marginTop: 20 },
    pill: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 24, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', overflow: 'hidden' },
    pillSelected: { borderColor: COLORS.primary, backgroundColor: COLORS.activeGlow },
    pillContent: { flexDirection: 'row', alignItems: 'center', zIndex: 2 },
    pillText: { color: 'rgba(255,255,255,0.7)', fontSize: 15, fontFamily: FONTS.regular, letterSpacing: 0.5 },
    pillGlow: { ...StyleSheet.absoluteFillObject, backgroundColor: COLORS.primary, opacity: 0.05 },
});