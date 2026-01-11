import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import OnboardingHeader from '../components/OnboardingHeader';
import OnboardingFooter from '../components/OnboardingFooter';
import { useOnboarding } from '@/context/OnboardingContext';

const COLORS = {
    bg: '#050406',
    primary: '#fbbf24', // Gold
    inputLabel: '#9ca3af',
    inputBorder: 'rgba(255,255,255,0.2)',
};

export default function IdentityScreen() {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

    const { userProfile, updateProfile } = useOnboarding();

    const handleNameChange = (text: string) => updateProfile({ name: text });
    const handleAgeChange = (text: string) => updateProfile({ age: text });

    const isFormValid = userProfile.name.trim() !== '' && userProfile.age.trim()

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.container}>
                <StatusBar style="light" />
                <LinearGradient colors={['#1e1b4b', '#050406', '#000']} locations={[0, 0.3, 1]} style={StyleSheet.absoluteFill} />

                <SafeAreaView style={styles.safeArea}>
                    <OnboardingHeader currentStep={1} />

                    <KeyboardAvoidingView
                        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                        style={styles.keyboardAvoidingView}
                    >
                        <ScrollView
                            style={styles.contentContainer}
                            contentContainerStyle={styles.scrollContent}
                            showsVerticalScrollIndicator={false}
                        >
                            <View style={styles.titleContainer}>
                                <Text style={styles.mainTitle}>Seni</Text>
                                <Text style={styles.highlightTitle}>Tanıyalım</Text>
                                <Text style={styles.subtitle}>En iyi deneyimi sunabilmemiz için kim olduğunu bilmeliyiz.</Text>
                            </View>

                            <View style={styles.formContainer}>
                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>İSMİN</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="İsminizi girin"
                                        placeholderTextColor="rgba(255,255,255,0.3)"
                                        value={userProfile.name}
                                        onChangeText={handleNameChange}
                                        keyboardAppearance="dark"
                                    />
                                </View>

                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>YAŞIN</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="00"
                                        placeholderTextColor="rgba(255,255,255,0.3)"
                                        value={userProfile.age}
                                        onChangeText={handleAgeChange}
                                        keyboardType="number-pad"
                                        maxLength={2}
                                        keyboardAppearance="dark"
                                    />
                                </View>
                            </View>
                        </ScrollView>

                        <OnboardingFooter
                            onPress={() => navigation.navigate('Language')}
                            disabled={!isFormValid}
                        />
                    </KeyboardAvoidingView>
                </SafeAreaView>
            </View>
        </TouchableWithoutFeedback>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.bg },
    safeArea: { flex: 1, paddingHorizontal: 24 },
    keyboardAvoidingView: { flex: 1 },
    contentContainer: { flex: 1 },
    scrollContent: { paddingBottom: 100 },

    titleContainer: { marginTop: 20, marginBottom: 40 },
    mainTitle: { fontSize: 42, color: '#fff', fontFamily: 'PlayfairDisplay-Regular' },
    highlightTitle: { fontSize: 42, color: COLORS.primary, fontFamily: 'PlayfairDisplay-Italic', fontWeight: 'bold', marginBottom: 12 },
    subtitle: { color: 'rgba(255,255,255,0.5)', fontSize: 16, fontFamily: 'Inter-Regular' },

    formContainer: { gap: 30 },
    inputGroup: { gap: 10 },
    label: { color: COLORS.inputLabel, fontSize: 12, letterSpacing: 1.5, fontWeight: '600', textTransform: 'uppercase', fontFamily: 'Inter-SemiBold' },
    input: { color: '#fff', fontSize: 20, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: COLORS.inputBorder, fontFamily: 'Inter-Regular' },
});