import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import OnboardingHeader from '../components/OnboardingHeader';
import OnboardingFooter from '../components/OnboardingFooter';

const { width } = Dimensions.get('window');

const COLORS = {
    bg: '#050406',
    primary: '#fbbf24', // Gold
    cardBg: 'rgba(255,255,255,0.05)',
    activeBorder: '#fbbf24',
    activeGlow: 'rgba(251, 191, 36, 0.15)',
};

// --- MOTİVASYON SEÇENEKLERİ (TÜRKÇE) ---
const PURPOSES = [
    { id: 'career', title: 'Kariyer', subtitle: 'Profesyonel ilerleme', icon: 'briefcase' },
    { id: 'culture', title: 'Kültür', subtitle: 'Yerel halkla bağ kur', icon: 'earth' },
    { id: 'brain', title: 'Beyin Egzersizi', subtitle: 'Zihnini dinç tut', icon: 'fitness' },
    { id: 'exam', title: 'Sınav Hazırlığı', subtitle: 'Sınavlarda başarı', icon: 'school' },
];

export default function PurposeScreen() {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const [selectedPurpose, setSelectedPurpose] = useState<string | null>(null);

    const handleSelect = (id: string) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setSelectedPurpose(id);
    };

    return (
        <View style={styles.container}>
            <StatusBar style="light" />
            <LinearGradient colors={['#1e1b4b', '#050406', '#000']} locations={[0, 0.3, 1]} style={StyleSheet.absoluteFill} />

            <SafeAreaView style={styles.safeArea}>
                {/* 3. Adım */}
                <OnboardingHeader currentStep={3} />

                {/* BAŞLIKLAR */}
                <View style={styles.titleContainer}>
                    <Text style={styles.mainTitle}>Amacın</Text>
                    <Text style={styles.highlightTitle}>Nedir?</Text>
                    <Text style={styles.subtitle}>Seni öğrenmeye iten asıl motivasyon ne?</Text>
                </View>

                {/* KARTLAR GRID */}
                <View style={styles.gridContainer}>
                    <View style={styles.grid}>
                        {PURPOSES.map((item) => {
                            const isSelected = selectedPurpose === item.id;
                            return (
                                <TouchableOpacity
                                    key={item.id}
                                    activeOpacity={0.9}
                                    onPress={() => handleSelect(item.id)}
                                    style={[
                                        styles.card,
                                        isSelected && styles.cardSelected
                                    ]}
                                >
                                    <View style={[
                                        styles.iconCircle,
                                        isSelected && { backgroundColor: 'rgba(255,255,255,0.2)' }
                                    ]}>
                                        <Ionicons
                                            name={item.icon as any}
                                            size={28}
                                            color={isSelected ? COLORS.primary : '#fff'}
                                        />
                                    </View>

                                    <View>
                                        <Text style={[
                                            styles.cardTitle,
                                            isSelected && { color: COLORS.primary }
                                        ]}>
                                            {item.title}
                                        </Text>
                                        <Text style={styles.cardSubtitle}>{item.subtitle}</Text>
                                    </View>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </View>

                {/* REUSABLE FOOTER */}
                <OnboardingFooter
                    onPress={() => navigation.navigate('Interests')}
                    disabled={!selectedPurpose}
                />
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.bg },
    safeArea: { flex: 1, paddingHorizontal: 24, paddingTop: 10 },

    titleContainer: { marginTop: 10, marginBottom: 30 },
    mainTitle: { fontSize: 42, color: '#fff', fontFamily: 'PlayfairDisplay-Regular' },
    highlightTitle: { fontSize: 42, color: COLORS.primary, fontFamily: 'PlayfairDisplay-Italic', fontWeight: 'bold', marginBottom: 12 },
    subtitle: { color: 'rgba(255,255,255,0.6)', fontSize: 16 },

    gridContainer: { flex: 1 },
    grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 15 },

    card: {
        width: (width - 63) / 2,
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
        borderColor: COLORS.activeBorder
    },

    iconCircle: {
        width: 52, height: 52, borderRadius: 26,
        backgroundColor: 'rgba(255,255,255,0.1)',
        justifyContent: 'center', alignItems: 'center',
        marginBottom: 10
    },
    cardTitle: { color: '#fff', fontSize: 18, fontWeight: '700', marginBottom: 6 },
    cardSubtitle: { color: 'rgba(255,255,255,0.5)', fontSize: 13, lineHeight: 18 },
});