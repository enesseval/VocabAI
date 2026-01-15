import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons'; // Lucide yerine mevcut projende Ionicons varsa
import { useNavigation } from '@react-navigation/native';
import { COLORS, FONTS } from '../constants/theme';
import { useOnboarding } from '../context/OnboardingContext';

const { width } = Dimensions.get('window');

// Örnek "Paket" verisi (Dinamik hale gelecek)
const DAILY_PACKS: {
    id: number;
    title: string;
    level: string;
    color: readonly [string, string, ...string[]];
    icon: string;
}[] = [
        { id: 1, title: 'Tech & AI', level: 'B2', color: ['#4F46E515', '#4F46E500'], icon: 'hardware-chip-outline' },
        { id: 2, title: 'Travel', level: 'A2', color: ['#0EA5E915', '#0EA5E900'], icon: 'airplane-outline' },
        { id: 3, title: 'Business', level: 'C1', color: ['#F59E0B15', '#F59E0B00'], icon: 'briefcase-outline' },
    ];

export default function HomeScreen() {
    const navigation = useNavigation<any>();
    const { userProfile } = useOnboarding();

    return (
        <View style={styles.container}>
            <StatusBar style="light" />
            <LinearGradient colors={['#1e1b4b', '#000']} style={StyleSheet.absoluteFill} />

            <SafeAreaView style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>

                    {/* 1. Header: Profil & Selamlama */}
                    <View style={styles.header}>
                        <View>
                            <Text style={styles.greeting}>MERHABA</Text>
                            <Text style={styles.username}>{userProfile?.name || 'Gezgin'}</Text>
                        </View>
                        <TouchableOpacity style={styles.profileBtn}>
                            <Ionicons name="person" size={20} color="#fff" />
                        </TouchableOpacity>
                    </View>

                    {/* 2. Daily Drops (Yatay Kaydırmalı Kartlar) */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <View>
                                <Text style={styles.sectionTitle}>Günün Hikayesi</Text>
                                <Text style={styles.sectionSubtitle}>Sana özel seçilmiş AI içerikleri</Text>
                            </View>
                            <TouchableOpacity onPress={() => navigation.navigate('ReadStory')} style={styles.shuffleBtn}>
                                <Ionicons name="shuffle" size={16} color={COLORS.textSecondary} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 24, paddingVertical: 10 }}>
                            {/* "Create New" Card */}
                            <TouchableOpacity
                                onPress={() => navigation.navigate('ReadStory')}
                                activeOpacity={0.9}
                                style={[styles.card, styles.createCard]}
                            >
                                <LinearGradient
                                    colors={[COLORS.primary, '#7c3aed']}
                                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                                    style={StyleSheet.absoluteFill}
                                />
                                <View style={styles.cardIconBg}>
                                    <Ionicons name="sparkles" size={24} color="#fff" />
                                </View>
                                <View>
                                    <Text style={styles.createTitle}>Yeni Oluştur</Text>
                                    <Text style={styles.createSubtitle}>AI ile hikaye yarat</Text>
                                </View>
                            </TouchableOpacity>

                            {/* Existing Packs */}
                            {DAILY_PACKS.map((pack) => (
                                <TouchableOpacity key={pack.id} style={styles.card}>
                                    <LinearGradient
                                        colors={pack.color}
                                        style={StyleSheet.absoluteFill}
                                    />
                                    <View style={styles.cardHeader}>
                                        <View style={styles.levelBadge}>
                                            <Text style={styles.levelText}>{pack.level}</Text>
                                        </View>
                                        <Ionicons name={pack.icon as any} size={20} color={COLORS.text} />
                                    </View>
                                    <View>
                                        <Text style={styles.cardTitle}>{pack.title}</Text>
                                        <Text style={styles.cardSubtitle}>Kelime Paketi</Text>
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>

                    {/* 3. My Vocabulary (List Style) */}
                    <View style={styles.section}>
                        <View style={[styles.sectionHeader, { paddingHorizontal: 24 }]}>
                            <Text style={styles.sectionTitle}>Kelime Depom</Text>
                            <TouchableOpacity>
                                <Text style={{ color: COLORS.primary, fontWeight: 'bold' }}>Tümünü Gör</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Empty State or List */}
                        <View style={styles.emptyBox}>
                            <Ionicons name="library-outline" size={40} color="rgba(255,255,255,0.2)" />
                            <Text style={styles.emptyText}>Henüz kaydedilmiş kelime yok.</Text>
                        </View>
                    </View>

                </ScrollView>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, paddingTop: 10, marginBottom: 20 },
    greeting: { color: 'rgba(255,255,255,0.6)', fontSize: 12, fontFamily: FONTS.bold, letterSpacing: 1 },
    username: { color: '#fff', fontSize: 28, fontFamily: FONTS.titleItalic },
    profileBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },

    section: { marginBottom: 30 },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', paddingHorizontal: 24, marginBottom: 15 },
    sectionTitle: { color: '#fff', fontSize: 20, fontFamily: FONTS.bold },
    sectionSubtitle: { color: 'rgba(255,255,255,0.5)', fontSize: 13, marginTop: 2 },
    shuffleBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' },

    card: { width: 160, height: 180, borderRadius: 24, backgroundColor: '#1C1C1E', marginRight: 15, padding: 16, justifyContent: 'space-between', overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
    createCard: { borderWidth: 0 },
    cardIconBg: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
    createTitle: { color: '#fff', fontSize: 18, fontFamily: FONTS.bold },
    createSubtitle: { color: 'rgba(255,255,255,0.7)', fontSize: 12 },

    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    levelBadge: { backgroundColor: 'rgba(255,255,255,0.1)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
    levelText: { color: '#fff', fontSize: 10, fontFamily: FONTS.bold },
    cardTitle: { color: '#fff', fontSize: 18, fontFamily: FONTS.bold },
    cardSubtitle: { color: 'rgba(255,255,255,0.4)', fontSize: 12 },

    emptyBox: { marginHorizontal: 24, height: 120, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.03)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', borderStyle: 'dashed' },
    emptyText: { color: 'rgba(255,255,255,0.3)', marginTop: 10, fontSize: 14 }
});