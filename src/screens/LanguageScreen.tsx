import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Picker } from '@react-native-picker/picker';
import * as Haptics from 'expo-haptics';
import { useTranslation } from 'react-i18next';

import { RootStackParamList } from '../types/navigation';
import OnboardingHeader from '../components/OnboardingHeader';
import OnboardingFooter from '../components/OnboardingFooter';
import { useOnboarding } from '../context/OnboardingContext';
import { COLORS, FONTS, SIZES } from '../constants/theme';

const { t } = useTranslation();

const LANGUAGES = [
    { id: 'tr', label: t('onboarding.language.options.tr') },
    { id: 'en', label: t('onboarding.language.options.en') },
    { id: 'de', label: t('onboarding.language.options.de') },
];

export default function LanguageScreen() {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

    const { userProfile, updateProfile } = useOnboarding();

    const [isPickerVisible, setPickerVisible] = useState(false);
    const [activeField, setActiveField] = useState<'native' | 'target' | null>(null);
    const [tempPickerValue, setTempPickerValue] = useState<string | null>(null);

    const handleNativeChange = (val: string | null) => {
        if (val) Haptics.selectionAsync();
        updateProfile({ nativeLang: val });
        if (val && val === userProfile.targetLang) {
            updateProfile({ targetLang: null });
        }
    };

    const handleTargetChange = (val: string | null) => {
        if (val) Haptics.selectionAsync();
        updateProfile({ targetLang: val });
        if (val && val === userProfile.nativeLang) {
            updateProfile({ nativeLang: null });
        }
    };

    const openIOSPicker = (field: 'native' | 'target') => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setActiveField(field);
        const currentVal = field === 'native' ? userProfile.nativeLang : userProfile.targetLang;
        setTempPickerValue(currentVal);
        setPickerVisible(true);
    };

    const confirmIOSPicker = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        if (activeField === 'native') handleNativeChange(tempPickerValue);
        if (activeField === 'target') handleTargetChange(tempPickerValue);
        closeIOSPicker();
    };

    const closeIOSPicker = () => {
        setPickerVisible(false);
        setActiveField(null);
        setTempPickerValue(null);
    };

    const getLanguageLabel = (code: string | null) => {
        const lang = LANGUAGES.find(l => l.id === code);
        return lang ? lang.label : t('onboarding.language.placeholder');
    };

    const isFormValid = userProfile.nativeLang && userProfile.targetLang && userProfile.nativeLang !== userProfile.targetLang;

    const renderPickerItems = (excludeLang: string | null) => {
        const filteredLanguages = LANGUAGES.filter(l => l.id !== excludeLang);
        return [
            <Picker.Item
                key="placeholder"
                label={t('onboarding.language.placeholder')}
                value={null}
                color={Platform.OS === 'ios' ? undefined : '#9ca3af'}
            />,
            ...filteredLanguages.map(l => (
                <Picker.Item
                    key={l.id}
                    label={l.label}
                    value={l.id}
                    color={Platform.OS === 'ios' ? undefined : '#fff'}
                />
            ))
        ];
    };

    return (
        <View style={styles.container}>
            <StatusBar style="light" />
            <LinearGradient colors={['#1e1b4b', '#050406', '#000']} locations={[0, 0.3, 1]} style={StyleSheet.absoluteFill} />

            <SafeAreaView style={styles.safeArea}>
                <OnboardingHeader
                    currentStep={2}
                    title={t('onboarding.language.title')}
                    highlight={t('onboarding.language.highlight')}
                    subtitle={t('onboarding.language.subtitle')}
                />

                <View style={{ flex: 1 }}>
                    <View style={styles.formContainer}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>{t('onboarding.language.nativeLabel')}</Text>
                            <TouchableOpacity
                                style={styles.selectBox}
                                onPress={() => Platform.OS === 'ios' && openIOSPicker('native')}
                                activeOpacity={Platform.OS === 'ios' ? 0.7 : 1}
                            >
                                <Text style={[styles.inputText, !userProfile.nativeLang && styles.placeholderText]}>
                                    {getLanguageLabel(userProfile.nativeLang)}
                                </Text>
                                <Ionicons name="chevron-down" size={20} color="rgba(255,255,255,0.5)" />
                                {Platform.OS === 'android' && (
                                    <Picker
                                        selectedValue={userProfile.nativeLang}
                                        onValueChange={handleNativeChange}
                                        style={styles.androidPicker}
                                        dropdownIconColor="#fff"
                                        mode="dialog"
                                    >
                                        {renderPickerItems(userProfile.targetLang)}
                                    </Picker>
                                )}
                            </TouchableOpacity>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>{t('onboarding.language.targetLabel')}</Text>
                            <TouchableOpacity
                                style={styles.selectBox}
                                onPress={() => Platform.OS === 'ios' && openIOSPicker('target')}
                                activeOpacity={Platform.OS === 'ios' ? 0.7 : 1}
                            >
                                <Text style={[styles.inputText, !userProfile.targetLang && styles.placeholderText]}>
                                    {getLanguageLabel(userProfile.targetLang)}
                                </Text>
                                <Ionicons name="chevron-down" size={20} color="rgba(255,255,255,0.5)" />
                                {Platform.OS === 'android' && (
                                    <Picker
                                        selectedValue={userProfile.targetLang}
                                        onValueChange={handleTargetChange}
                                        style={styles.androidPicker}
                                        dropdownIconColor="#fff"
                                        mode="dialog"
                                    >
                                        {renderPickerItems(userProfile.nativeLang)}
                                    </Picker>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                <OnboardingFooter
                    text={t('onboarding.common.continue')}
                    onPress={() => navigation.navigate('Purpose')}
                    disabled={!isFormValid}
                />

                <Modal visible={isPickerVisible} transparent animationType="slide" onRequestClose={closeIOSPicker}>
                    <View style={styles.iosModalOverlay}>
                        <View style={styles.iosModalContent}>
                            <View style={styles.iosModalHeader}>
                                <TouchableOpacity onPress={closeIOSPicker}>
                                    <Text style={styles.iosModalCancel}>{t('onboarding.common.cancel')}</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={confirmIOSPicker}>
                                    <Text style={styles.iosModalConfirm}>{t('onboarding.common.confirm')}</Text>
                                </TouchableOpacity>
                            </View>
                            <Picker
                                selectedValue={tempPickerValue}
                                onValueChange={(itemValue) => { setTempPickerValue(itemValue); Haptics.selectionAsync(); }}
                                style={{ height: 215, width: '100%' }}
                                itemStyle={{ color: '#fff' }}
                            >
                                {renderPickerItems(activeField === 'native' ? userProfile.targetLang : userProfile.nativeLang)}
                            </Picker>
                        </View>
                    </View>
                </Modal>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.bg },
    safeArea: { flex: 1, paddingHorizontal: SIZES.padding },
    formContainer: { gap: 30, marginTop: 20 },
    inputGroup: { gap: 10 },
    label: { color: COLORS.inputLabel, fontSize: 12, letterSpacing: 1.5, fontFamily: FONTS.semiBold, textTransform: 'uppercase' },
    selectBox: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: COLORS.inputBorder, position: 'relative' },
    inputText: { color: COLORS.text, fontSize: 20, fontFamily: FONTS.regular },
    placeholderText: { color: 'rgba(255,255,255,0.3)' },
    androidPicker: { position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, opacity: 0 },
    iosModalOverlay: { flex: 1, justifyContent: 'flex-end' },
    iosModalContent: { backgroundColor: '#1e1b2e', paddingBottom: 40, borderTopLeftRadius: 20, borderTopRightRadius: 20 },
    iosModalHeader: { flexDirection: 'row', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.1)' },
    iosModalCancel: { color: '#fff', fontSize: 16 },
    iosModalConfirm: { color: COLORS.primary, fontSize: 16, fontWeight: 'bold' },
});