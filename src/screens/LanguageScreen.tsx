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
import { RootStackParamList } from '../../App';
import OnboardingHeader from '../components/OnboardingHeader';
import OnboardingFooter from '../components/OnboardingFooter';

const COLORS = {
    bg: '#050406',
    primary: '#fbbf24', // Gold
    inputLabel: '#9ca3af',
    inputBorder: 'rgba(255,255,255,0.2)',
    cardBg: '#1e1b2e',
};

const LANGUAGES = [
    { id: 'tr', label: 'Türkçe' },
    { id: 'en', label: 'İngilizce' },
    { id: 'de', label: 'Almanca' },
];

export default function LanguageScreen() {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

    // Dil Seçim State'leri
    const [nativeLang, setNativeLang] = useState<string | null>(null);
    const [targetLang, setTargetLang] = useState<string | null>(null);


    // iOS Picker Modal State
    const [isPickerVisible, setPickerVisible] = useState(false);
    const [activeField, setActiveField] = useState<'native' | 'target' | null>(null);
    const [tempPickerValue, setTempPickerValue] = useState<string | null>(null);

    const handleNativeChange = (val: string | null) => {
        setNativeLang(val);
        if (val) Haptics.selectionAsync();
        if (val && val === targetLang) {
            setTargetLang(null);
        }
    };

    const handleTargetChange = (val: string | null) => {
        setTargetLang(val);
        if (val) Haptics.selectionAsync();
        if (val && val === nativeLang) {
            setNativeLang(null);
        }
    };

    const openIOSPicker = (field: 'native' | 'target') => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setActiveField(field);
        const currentVal = field === 'native' ? nativeLang : targetLang;
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
        return lang ? lang.label : 'Seçiniz';
    };

    const isFormValid = nativeLang && targetLang && nativeLang !== targetLang;

    // Filtered Picker Items
    const renderPickerItems = (excludeLang: string | null) => {
        const filteredLanguages = LANGUAGES.filter(l => l.id !== excludeLang);
        return [
            <Picker.Item key="placeholder" label="Seçiniz" value={null} color={Platform.OS === 'ios' ? undefined : '#9ca3af'} />,
            ...filteredLanguages.map(l => (
                <Picker.Item key={l.id} label={l.label} value={l.id} color={Platform.OS === 'ios' ? undefined : '#fff'} />
            ))
        ];
    };

    return (
        <View style={styles.container}>
            <StatusBar style="light" />
            <LinearGradient colors={['#1e1b4b', '#050406', '#000']} locations={[0, 0.3, 1]} style={StyleSheet.absoluteFill} />

            <SafeAreaView style={styles.safeArea}>
                <OnboardingHeader currentStep={2} />

                <View style={styles.contentContainer}>
                    <View style={styles.titleContainer}>
                        <Text style={styles.mainTitle}>Senin</Text>
                        <Text style={styles.highlightTitle}>dünyan</Text>
                        <Text style={styles.subtitle}>Kelime yolculuğunun bağlamını belirle.</Text>
                    </View>

                    <View style={styles.formContainer}>
                        {/* Native Language Selector */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>ANADİLİN</Text>
                            <TouchableOpacity
                                style={styles.selectBox}
                                onPress={() => Platform.OS === 'ios' && openIOSPicker('native')}
                                activeOpacity={Platform.OS === 'ios' ? 0.7 : 1}
                            >
                                <Text style={[styles.inputText, !nativeLang && styles.placeholderText]}>
                                    {getLanguageLabel(nativeLang)}
                                </Text>
                                <Ionicons name="chevron-down" size={20} color="rgba(255,255,255,0.5)" />

                                {Platform.OS === 'android' && (
                                    <Picker
                                        selectedValue={nativeLang}
                                        onValueChange={handleNativeChange}
                                        style={styles.androidPicker}
                                        dropdownIconColor="#fff"
                                        mode="dialog"
                                    >
                                        {renderPickerItems(targetLang)}
                                    </Picker>
                                )}
                            </TouchableOpacity>
                        </View>

                        {/* Target Language Selector */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>ÖĞRENMEK İSTEDİĞİN DİL</Text>
                            <TouchableOpacity
                                style={styles.selectBox}
                                onPress={() => Platform.OS === 'ios' && openIOSPicker('target')}
                                activeOpacity={Platform.OS === 'ios' ? 0.7 : 1}
                            >
                                <Text style={[styles.inputText, !targetLang && styles.placeholderText]}>
                                    {getLanguageLabel(targetLang)}
                                </Text>
                                <Ionicons name="chevron-down" size={20} color="rgba(255,255,255,0.5)" />

                                {Platform.OS === 'android' && (
                                    <Picker
                                        selectedValue={targetLang}
                                        onValueChange={handleTargetChange}
                                        style={styles.androidPicker}
                                        dropdownIconColor="#fff"
                                        mode="dialog"
                                    >
                                        {renderPickerItems(nativeLang)}
                                    </Picker>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                {/* REUSABLE FOOTER */}
                <OnboardingFooter
                    onPress={() => navigation.navigate('Purpose')}
                    disabled={!isFormValid}
                />

                {/* iOS CUSTOM PICKER MODAL */}
                <Modal
                    visible={isPickerVisible}
                    transparent
                    animationType="slide"
                    onRequestClose={closeIOSPicker}
                >
                    <View style={styles.iosModalOverlay}>
                        <View style={styles.iosModalContent}>
                            <View style={styles.iosModalHeader}>
                                <TouchableOpacity onPress={closeIOSPicker}>
                                    <Text style={styles.iosModalCancel}>İptal</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={confirmIOSPicker}>
                                    <Text style={styles.iosModalConfirm}>Tamam</Text>
                                </TouchableOpacity>
                            </View>
                            <Picker
                                selectedValue={tempPickerValue}
                                onValueChange={(itemValue) => {
                                    setTempPickerValue(itemValue);
                                    Haptics.selectionAsync();
                                }}
                                style={{ height: 215, width: '100%' }}
                                itemStyle={{ color: '#fff' }}
                            >
                                {renderPickerItems(activeField === 'native' ? targetLang : nativeLang)}
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
    safeArea: { flex: 1, paddingHorizontal: 24, paddingTop: 10 },

    contentContainer: { flex: 1 },
    titleContainer: { marginTop: 20, marginBottom: 40 },
    mainTitle: { fontSize: 42, color: '#fff', fontFamily: 'PlayfairDisplay-Regular' },
    highlightTitle: { fontSize: 42, color: COLORS.primary, fontFamily: 'PlayfairDisplay-Italic', fontWeight: 'bold', marginBottom: 12 },
    subtitle: { color: 'rgba(255,255,255,0.5)', fontSize: 16, fontFamily: 'Inter-Regular' },

    formContainer: { gap: 30 },
    inputGroup: { gap: 10 },
    label: { color: COLORS.inputLabel, fontSize: 12, letterSpacing: 1.5, fontWeight: '600', textTransform: 'uppercase', fontFamily: 'Inter-SemiBold' },
    selectBox: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.inputBorder,
        position: 'relative',
    },
    inputText: { color: '#fff', fontSize: 20, fontFamily: 'Inter-Regular' },
    placeholderText: { color: 'rgba(255,255,255,0.3)' },

    androidPicker: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        opacity: 0,
    },

    iosModalOverlay: { flex: 1, justifyContent: 'flex-end' },
    iosModalContent: { backgroundColor: '#1e1b2e', paddingBottom: 40, borderTopLeftRadius: 20, borderTopRightRadius: 20 },
    iosModalHeader: { flexDirection: 'row', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.1)' },
    iosModalCancel: { color: '#fff', fontSize: 16 },
    iosModalConfirm: { color: COLORS.primary, fontSize: 16, fontWeight: 'bold' },
});