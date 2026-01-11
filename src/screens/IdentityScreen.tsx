import React from 'react';
import { View, Text, TextInput, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';

import { RootStackParamList } from '../types/navigation';
import OnboardingHeader from '../components/OnboardingHeader';
import OnboardingFooter from '../components/OnboardingFooter';
import { useOnboarding } from '../context/OnboardingContext';
import { COLORS, FONTS, SIZES } from '../constants/theme';

export default function IdentityScreen() {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const { t } = useTranslation();
    const { userProfile, updateProfile } = useOnboarding();

    const isFormValid = userProfile.name.trim() !== '' && userProfile.age.trim() !== '';

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.container}>
                <StatusBar style="light" />
                <LinearGradient colors={['#1e1b4b', '#050406', '#000']} locations={[0, 0.3, 1]} style={StyleSheet.absoluteFill} />

                <SafeAreaView style={styles.safeArea}>
                    <OnboardingHeader
                        currentStep={1}
                        title={t('onboarding.identity.title')}
                        highlight={t('onboarding.identity.highlight')}
                        subtitle={t('onboarding.identity.subtitle')}
                    />

                    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
                            <View style={styles.formContainer}>
                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>{t('onboarding.identity.nameLabel')}</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder={t('onboarding.identity.namePlaceholder')}
                                        placeholderTextColor="rgba(255,255,255,0.3)"
                                        value={userProfile.name}
                                        onChangeText={(text) => updateProfile({ name: text })}
                                        keyboardAppearance="dark"
                                    />
                                </View>
                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>{t('onboarding.identity.ageLabel')}</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="00"
                                        placeholderTextColor="rgba(255,255,255,0.3)"
                                        value={userProfile.age}
                                        onChangeText={(text) => updateProfile({ age: text })}
                                        keyboardType="number-pad"
                                        maxLength={2}
                                        keyboardAppearance="dark"
                                    />
                                </View>
                            </View>
                        </ScrollView>

                        <OnboardingFooter
                            text={t('onboarding.common.continue')}
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
    safeArea: { flex: 1, paddingHorizontal: SIZES.padding },
    formContainer: { gap: 30, marginTop: 20 },
    inputGroup: { gap: 10 },
    label: { color: COLORS.inputLabel, fontSize: 12, letterSpacing: 1.5, fontFamily: FONTS.semiBold, textTransform: 'uppercase' },
    input: { color: COLORS.text, fontSize: 20, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: COLORS.inputBorder, fontFamily: FONTS.regular },
});