import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, ScrollView } from 'react-native';
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

const COLORS = {
    bg: '#050406',
    primary: '#fbbf24', // Gold
    cardBg: 'rgba(255,255,255,0.05)',
    activeBorder: '#fbbf24',
    activeGlow: 'rgba(251, 191, 36, 0.15)',
};

type Topic = {
    id: number;
    name: string;
    icon: keyof typeof Ionicons.glyphMap;
};

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
        <TouchableOpacity
            activeOpacity={0.8}
            onPress={onPress}
            style={[
                styles.pill,
                isSelected && styles.pillSelected
            ]}
        >
            <View style={styles.pillContent}>
                <Ionicons
                    name={item.icon}
                    size={18}
                    color={isSelected ? COLORS.primary : 'rgba(255,255,255,0.6)'}
                    style={{ marginRight: 8 }}
                />
                <Text style={[
                    styles.pillText,
                    isSelected && { color: COLORS.primary, fontWeight: 'bold' }
                ]}>
                    {item.name}
                </Text>
            </View>

            {isSelected && <View style={styles.pillGlow} />}
        </TouchableOpacity>
    );
};

export default function InterestsScreen() {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const [selectedTopics, setSelectedTopics] = useState<number[]>([]);

    const toggleTopic = (id: number) => {
        Haptics.selectionAsync();
        if (selectedTopics.includes(id)) {
            setSelectedTopics(selectedTopics.filter(item => item !== id));
        } else {
            setSelectedTopics([...selectedTopics, id]);
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar style="light" />
            <LinearGradient colors={['#1e1b4b', '#050406', '#000']} locations={[0, 0.3, 1]} style={StyleSheet.absoluteFill} />

            <SafeAreaView style={styles.safeArea}>
                <OnboardingHeader currentStep={4} />

                <View style={styles.titleContainer}>
                    <Text style={styles.mainTitle}>Senin</Text>
                    <Text style={styles.highlightTitle}>Dünyan</Text>
                    <Text style={styles.subtitle}>
                        Entelektüel manzaranı oluştur. Seni yansıtan alanları seç.
                    </Text>
                </View>

                <ScrollView
                    style={{ flex: 1 }}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.pillContainer}>
                        {TOPICS.map((item) => (
                            <TopicPill
                                key={item.id}
                                item={item}
                                isSelected={selectedTopics.includes(item.id)}
                                onPress={() => toggleTopic(item.id)}
                            />
                        ))}
                    </View>
                </ScrollView>

                <OnboardingFooter
                    text="PERSONA OLUŞTUR"
                    onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
                        console.log("Persona Oluşturuluyor:", selectedTopics);
                        // Future: Navigate to next screen
                    }}
                    disabled={selectedTopics.length === 0}
                />
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.bg },
    safeArea: { flex: 1, paddingHorizontal: 24, paddingTop: 10 },

    titleContainer: { marginTop: 10, marginBottom: 30, alignItems: 'center' },
    mainTitle: { fontSize: 42, color: '#fff', fontFamily: 'PlayfairDisplay-Regular', textAlign: 'center' },
    highlightTitle: { fontSize: 42, color: '#fbbf24', fontFamily: 'PlayfairDisplay-Italic', fontWeight: 'bold', marginBottom: 12, textAlign: 'center' },
    subtitle: { color: 'rgba(255,255,255,0.6)', fontSize: 16, textAlign: 'center', lineHeight: 24, paddingHorizontal: 20 },

    scrollContent: { paddingBottom: 150, alignItems: 'center' },

    pillContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 12,
        width: '100%',
    },

    pill: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 24,
        borderRadius: 999,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        position: 'relative',
        overflow: 'hidden',
    },
    pillSelected: {
        borderColor: COLORS.activeBorder,
        backgroundColor: COLORS.activeGlow,
    },
    pillContent: {
        flexDirection: 'row',
        alignItems: 'center',
        zIndex: 2,
    },
    pillText: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 15,
        fontWeight: '500',
        letterSpacing: 0.5,
    },
    pillGlow: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: COLORS.activeBorder,
        opacity: 0.05,
    },
});