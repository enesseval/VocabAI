// src/screens/ReadStoryScreen.tsx

import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Modal, Animated, Dimensions, PanResponder, TouchableWithoutFeedback, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Haptics from 'expo-haptics';
import * as Speech from 'expo-speech';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { RootStackParamList } from '../types/navigation';
import { COLORS, FONTS } from '../constants/theme';
import { useOnboarding } from '../context/OnboardingContext';
import { getStoryForUser } from '../utils/storyOrchestrator';
import { Story, WordAnalysis } from '../types/story';
import { useVocabulary } from '../context/VocabularyContext';

const { width, height } = Dimensions.get('window');

// --- TYPEWRITER COMPONENT ---
const TypewriterText = ({ text, onComplete, style, skipAnimation }: { text: string, onComplete: () => void, style: any, skipAnimation?: boolean }) => {
    const [displayedText, setDisplayedText] = useState('');
    const index = useRef(0);

    useEffect(() => {
        if (skipAnimation) {
            setDisplayedText(text);
            onComplete();
            return;
        }
        setDisplayedText('');
        index.current = 0;
        const timer = setInterval(() => {
            if (index.current < text.length) {
                setDisplayedText((prev) => prev + text.charAt(index.current));
                index.current++;
            } else {
                clearInterval(timer);
                onComplete();
            }
        }, 2);
        return () => clearInterval(timer);
    }, [text, skipAnimation]);

    return <Text style={style}>{displayedText}</Text>;
};

export default function ReadStoryScreen() {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const route = useRoute<RouteProp<RootStackParamList, 'ReadStory' | 'StoryModal'>>();

    // 🔥 MODAL (GEÇMİŞ) MODU
    const isHistoryMode = route.name === 'StoryModal';
    const initialStory = (route.params as any)?.story;

    const { userProfile } = useOnboarding();
    const { saveWord, removeWord, isWordSaved } = useVocabulary();

    const [story, setStory] = useState<Story | null>(initialStory || null);
    const [isGenerating, setIsGenerating] = useState(!initialStory);
    const [loadingText, setLoadingText] = useState("İçerik hazırlanıyor...");
    const [isTypingComplete, setIsTypingComplete] = useState(!!initialStory);

    // Player State
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [activePageIndex, setActivePageIndex] = useState(0);
    const [speechCursor, setSpeechCursor] = useState<number>(0);

    const [selectedWordData, setSelectedWordData] = useState<WordAnalysis | null>(null);
    const [isModalVisible, setModalVisible] = useState(false);

    const scrollX = useRef(new Animated.Value(0)).current;
    const modalSlideAnim = useRef(new Animated.Value(height)).current;

    // 🔥 DRAG TO DISMISS
    const panY = useRef(new Animated.Value(0)).current;
    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => isHistoryMode,
            onMoveShouldSetPanResponder: (_, gestureState) => isHistoryMode && gestureState.dy > 5,
            onPanResponderMove: (_, gestureState) => {
                if (gestureState.dy > 0) panY.setValue(gestureState.dy);
            },
            onPanResponderRelease: (_, gestureState) => {
                if (gestureState.dy > 120) navigation.goBack();
                else Animated.spring(panY, { toValue: 0, useNativeDriver: true, bounciness: 4 }).start();
            },
        })
    ).current;

    const isSaved = selectedWordData ? isWordSaved(selectedWordData.word) : false;
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    const saveToHistory = async (newStory: Story) => {
        try {
            const history = await AsyncStorage.getItem('story_history');
            let stories: Story[] = history ? JSON.parse(history) : [];
            const exists = stories.some(s => s.id === newStory.id);
            if (!exists) {
                stories.push(newStory);
                if (stories.length > 20) stories.shift();
                await AsyncStorage.setItem('story_history', JSON.stringify(stories));
            }
        } catch (e) { console.error(e); }
    };

    useEffect(() => {
        const loadContent = async () => {
            if (initialStory) return;
            if (!userProfile) return;
            setLoadingText("İlgi alanların analiz ediliyor...");
            await delay(800);
            setLoadingText("Yapay zeka hikayeni yazıyor...");
            try {
                const bestStory = await getStoryForUser(userProfile, 'ONBOARDING_END');
                setStory(bestStory);
                saveToHistory(bestStory);
            } catch (error) { console.error("Story Error", error); }
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            setIsGenerating(false);
        };
        loadContent();
        return () => { Speech.stop() };
    }, [userProfile]);

    const handlePlayPause = () => {
        Haptics.selectionAsync();
        if (isSpeaking) { Speech.stop(); setIsSpeaking(false); }
        else { speakFromIndex(speechCursor); }
    };

    const speakFromIndex = (startIndex: number) => {
        if (!story) return;
        const isTarget = activePageIndex === 0;
        const fullText = isTarget
            ? story.segments?.map(s => s.target).join('\n\n') || story.content
            : story.segments?.map(s => s.native).join('\n\n') || "";

        if (startIndex >= fullText.length - 5) startIndex = 0;
        const textToSpeak = fullText.substring(startIndex);
        setIsSpeaking(true);
        const langCode = activePageIndex === 0
            ? (story.language === 'en' ? 'en-US' : story.language)
            : (userProfile?.nativeLang || 'tr-TR');

        Speech.speak(textToSpeak, {
            language: langCode, rate: 0.85, pitch: 1.0,
            onBoundary: (event: any) => setSpeechCursor(startIndex + event.charIndex),
            onDone: () => setIsSpeaking(false),
            onStopped: () => setIsSpeaking(false),
        });
    };

    const handleSkip = (direction: 'prev' | 'next') => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        Speech.stop();
        if (!story) return;
        const isTarget = activePageIndex === 0;
        const text = isTarget
            ? story.segments?.map(s => s.target).join('\n\n') || story.content
            : story.segments?.map(s => s.native).join('\n\n') || "";

        let newIndex = speechCursor;
        if (direction === 'next') {
            const nextSpace = text.indexOf(' ', newIndex + 2);
            newIndex = nextSpace !== -1 ? nextSpace + 1 : text.length;
        } else {
            const prevSpace = text.lastIndexOf(' ', newIndex - 3);
            newIndex = prevSpace !== -1 ? prevSpace + 1 : 0;
        }
        setSpeechCursor(newIndex);
        if (isSpeaking) speakFromIndex(newIndex);
    };

    const handleWordClick = (clickedText: string, lang: 'target' | 'native') => {
        Speech.stop(); setIsSpeaking(false);
        const cleanText = clickedText.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()"]/g, "").toLowerCase();
        let foundAnalysis = story?.vocabulary?.find(v =>
            lang === 'target'
                ? (v.word.toLowerCase() === cleanText || v.lemma.toLowerCase() === cleanText)
                : (v.translation.toLowerCase().includes(cleanText))
        );
        if (foundAnalysis) {
            Haptics.selectionAsync();
            setSelectedWordData(foundAnalysis);
            setModalVisible(true);
            Animated.timing(modalSlideAnim, { toValue: 0, duration: 350, useNativeDriver: true }).start();
        }
    };

    const closeModal = () => {
        Animated.timing(modalSlideAnim, { toValue: height, duration: 250, useNativeDriver: true }).start(() => {
            setModalVisible(false); setSelectedWordData(null);
        });
    };

    const handleSaveWord = async () => {
        if (!selectedWordData) return;
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        if (isSaved) await removeWord(selectedWordData.word);
        else await saveWord(selectedWordData);
    };

    const handleComplete = () => {
        Speech.stop();
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] });
    };

    const onMomentumScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
        const pageIndex = Math.round(e.nativeEvent.contentOffset.x / width);
        if (pageIndex !== activePageIndex) {
            setActivePageIndex(pageIndex); Speech.stop(); setIsSpeaking(false); setSpeechCursor(0);
        }
    };

    const ParagraphRenderer = ({ text, lang, vocabulary, globalStartIndex }: { text: string, lang: 'target' | 'native', vocabulary?: WordAnalysis[], globalStartIndex: number }) => {
        let localCharIndex = 0;
        return (
            <Text style={styles.paragraph}>
                {text.split(' ').map((word, index) => {
                    const cleanWord = word.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()"]/g, "").toLowerCase();
                    const wordLength = word.length;
                    const wordGlobalStart = globalStartIndex + localCharIndex;
                    const wordGlobalEnd = wordGlobalStart + wordLength;
                    localCharIndex += wordLength + 1;
                    const isSpeakingNow = activePageIndex === (lang === 'target' ? 0 : 1) && speechCursor >= wordGlobalStart && speechCursor < wordGlobalEnd;
                    let isImportant = false;
                    if (lang === 'target') {
                        isImportant = vocabulary?.some(v => v.word.toLowerCase() === cleanWord || v.lemma.toLowerCase() === cleanWord) || false;
                    } else {
                        isImportant = vocabulary?.some(v => v.translation.toLowerCase().includes(cleanWord)) || false;
                    }
                    return (
                        <Text key={index}>
                            <Text onPress={() => handleWordClick(word, lang)} style={[styles.interactiveWord, isImportant && styles.importantWord, isSpeakingNow && styles.activeSpeakingWord]}>{word}</Text>
                            <Text style={styles.interactiveWord}> </Text>
                        </Text>
                    );
                })}
            </Text>
        );
    };

    if (isGenerating || !story) {
        return (
            <View style={[styles.container, isHistoryMode && { backgroundColor: 'transparent' }]}>
                <StatusBar style="light" />
                {!isHistoryMode && <LinearGradient colors={['#1e1b4b', '#000']} style={StyleSheet.absoluteFill} />}
                {isHistoryMode && <View style={StyleSheet.absoluteFill}><View style={{ flex: 1, backgroundColor: 'transparent' }} /></View>}
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={COLORS.primary} style={{ marginBottom: 20 }} />
                    <Text style={styles.loadingText}>{loadingText}</Text>
                </View>
            </View>
        );
    }

    const segments = story.segments || [];
    const targetTitleOpacity = scrollX.interpolate({ inputRange: [0, width / 2, width], outputRange: [1, 0, 0], extrapolate: 'clamp' });
    const nativeTitleOpacity = scrollX.interpolate({ inputRange: [0, width / 2, width], outputRange: [0, 0, 1], extrapolate: 'clamp' });

    return (
        <View style={[styles.container, isHistoryMode && { backgroundColor: 'transparent' }]}>
            <StatusBar style="light" />

            {/* BACKDROP: 🔥 Tamamen Şeffaf (Transparent) */}
            {isHistoryMode ? (
                <TouchableWithoutFeedback onPress={() => navigation.goBack()}>
                    <View style={StyleSheet.absoluteFill}>
                        <View style={{ flex: 1, backgroundColor: 'transparent' }} />
                    </View>
                </TouchableWithoutFeedback>
            ) : (
                <LinearGradient colors={['#1e1b4b', '#050406', '#000']} style={StyleSheet.absoluteFill} />
            )}

            {/* ANA İÇERİK KARTI (DRAGGABLE) */}
            <Animated.View
                style={[
                    styles.contentContainer,
                    isHistoryMode && styles.modalSheetStyle,
                    { transform: isHistoryMode ? [{ translateY: panY }] : [] }
                ]}
            >
                {/* 🔥 GRADIENT BACKGROUND (Sadece Modal Modunda Kartın İçine Eklenir) */}
                {isHistoryMode && (
                    <LinearGradient
                        colors={['#1e1b4b', '#050406', '#000']}
                        style={StyleSheet.absoluteFill}
                    />
                )}

                {/* TUTAMAÇ ALANI */}
                <View
                    style={styles.headerArea}
                    {...(isHistoryMode ? panResponder.panHandlers : {})}
                >
                    {isHistoryMode ? (
                        <View style={styles.handleContainer}>
                            <View style={styles.handle} />
                        </View>
                    ) : (
                        <View style={{ marginBottom: 10 }}>
                            <View style={styles.headerLabelContainer}>
                                <Ionicons name="sparkles" size={16} color={COLORS.primary} />
                                <Text style={styles.headerLabel}>AI STORY</Text>
                            </View>
                        </View>
                    )}

                    <View style={styles.headerTitleContainer}>
                        <Animated.View style={{ opacity: targetTitleOpacity, position: 'absolute', width: '100%', alignItems: 'center' }}>
                            <View style={styles.headerTitleBox}>
                                <Text style={styles.headerTitleText} numberOfLines={1}>{story.title.toUpperCase()}</Text>
                            </View>
                        </Animated.View>
                        <Animated.View style={{ opacity: nativeTitleOpacity, width: '100%', alignItems: 'center' }}>
                            <View style={styles.headerTitleBox}>
                                <Text style={styles.headerTitleText} numberOfLines={1}>{story.titleNative?.toUpperCase() || "ÇEVİRİ"}</Text>
                            </View>
                        </Animated.View>
                    </View>
                </View>

                {/* SLIDER */}
                <Animated.ScrollView
                    horizontal pagingEnabled showsHorizontalScrollIndicator={false}
                    scrollEventThrottle={16}
                    onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], { useNativeDriver: false })}
                    onMomentumScrollEnd={onMomentumScrollEnd}
                    style={{ flex: 1 }}
                >
                    {/* PAGE 1: TARGET */}
                    <View style={{ width, paddingHorizontal: 24 }}>
                        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 150 }}>
                            <View style={styles.langTagContainer}>
                                <Text style={styles.langLabel}>{story.language.toUpperCase()}</Text>
                            </View>
                            {!isTypingComplete ? (
                                <TypewriterText text={story.content} style={styles.typewriterText} onComplete={() => setIsTypingComplete(true)} skipAnimation={isHistoryMode} />
                            ) : (
                                segments.map((seg, i) => {
                                    let prevLength = 0;
                                    for (let k = 0; k < i; k++) prevLength += segments[k].target.length + 2;
                                    return <View key={i} style={styles.paragraphContainer}><ParagraphRenderer text={seg.target} lang="target" vocabulary={story.vocabulary} globalStartIndex={prevLength} /></View>
                                })
                            )}
                        </ScrollView>
                    </View>

                    {/* PAGE 2: NATIVE */}
                    <View style={{ width, paddingHorizontal: 24 }}>
                        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 150 }}>
                            <View style={styles.langTagContainer}>
                                <Text style={styles.langLabel}>TÜRKÇE</Text>
                            </View>
                            {segments.map((seg, i) => {
                                let prevLength = 0;
                                for (let k = 0; k < i; k++) prevLength += segments[k].native.length + 2;
                                return <View key={i} style={styles.paragraphContainer}><ParagraphRenderer text={seg.native} lang="native" vocabulary={story.vocabulary} globalStartIndex={prevLength} /></View>
                            })}
                        </ScrollView>
                    </View>
                </Animated.ScrollView>

                {/* DOTS */}
                <View style={styles.paginationContainer}>
                    <Animated.View style={[styles.dot, { opacity: scrollX.interpolate({ inputRange: [0, width], outputRange: [1, 0.3] }) }]} />
                    <Animated.View style={[styles.dot, { opacity: scrollX.interpolate({ inputRange: [0, width], outputRange: [0.3, 1] }) }]} />
                </View>

                {/* FOOTER */}
                <View style={[styles.footerPlayer, isHistoryMode && { paddingBottom: 40, borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }]}>
                    <View style={styles.playerControls}>
                        <TouchableOpacity onPress={() => handleSkip('prev')} style={styles.controlBtn}>
                            <Ionicons name="play-skip-back" size={26} color="rgba(255,255,255,0.7)" />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={handlePlayPause} style={styles.playBtnMain}>
                            <Ionicons name={isSpeaking ? "pause" : "play"} size={32} color="#000" style={{ marginLeft: 4 }} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => handleSkip('next')} style={styles.controlBtn}>
                            <Ionicons name="play-skip-forward" size={26} color="rgba(255,255,255,0.7)" />
                        </TouchableOpacity>
                    </View>

                    {/* 🔥 TİK BUTONU: SADECE YENİ HİKAYEDE */}
                    {!initialStory && (
                        <TouchableOpacity style={styles.finishBtn} onPress={handleComplete}>
                            <Ionicons name="checkmark" size={28} color={COLORS.primary} />
                        </TouchableOpacity>
                    )}
                </View>
            </Animated.View>

            {/* MODAL */}
            <Modal animationType="slide" transparent={true} visible={isModalVisible} onRequestClose={closeModal}>
                <View style={styles.modalOverlay}>
                    <TouchableOpacity style={StyleSheet.absoluteFill} onPress={closeModal} />
                    <Animated.View style={[styles.modalContent, { transform: [{ translateY: modalSlideAnim }] }]}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalWord}>{selectedWordData?.word}</Text>
                            <TouchableOpacity onPress={() => Speech.speak(selectedWordData?.word || "", { language: story.language })}><Ionicons name="volume-medium" size={28} color={COLORS.primary} /></TouchableOpacity>
                        </View>
                        <View style={styles.translationBox}>
                            <Text style={styles.translationLabel}>ANLAM</Text>
                            <Text style={styles.translationText}>{selectedWordData?.translation}</Text>
                            <Text style={[styles.translationLabel, { marginTop: 12 }]}>BAĞLAM</Text>
                            <Text style={styles.explanationText}>{selectedWordData?.explanation}</Text>
                            <View style={styles.exampleBox}><Text style={styles.exampleText}>"{selectedWordData?.example}"</Text></View>
                        </View>
                        <TouchableOpacity style={[styles.saveWordButton, isSaved && styles.savedButton]} onPress={handleSaveWord}>
                            <Text style={[styles.saveWordText, isSaved && { color: COLORS.secondary }]}>{isSaved ? "Sözlükten Çıkar" : "Sözlüğüme Ekle"}</Text>
                            <Ionicons name={isSaved ? "bookmark" : "bookmark-outline"} size={20} color={isSaved ? COLORS.secondary : "#fff"} />
                        </TouchableOpacity>
                    </Animated.View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.bg },

    // Content Container
    contentContainer: {
        flex: 1,
        backgroundColor: 'transparent',
    },

    // 🔥 MODAL SHEET STYLE (YUVARLAK VE GRADIENT İÇERİR)
    modalSheetStyle: {
        marginTop: height * 0.1,
        borderTopLeftRadius: 30, // 🔥 Yuvarlak köşeler
        borderTopRightRadius: 30,
        overflow: 'hidden', // Gradient dışarı taşmasın
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -10 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
    },

    // Header Area
    headerArea: { paddingHorizontal: 24, paddingTop: 15, paddingBottom: 10, alignItems: 'center', justifyContent: 'center' },
    handleContainer: { width: '100%', alignItems: 'center', paddingBottom: 15 },
    handle: { width: 45, height: 5, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.2)' },

    // Title Box
    headerTitleContainer: { width: '100%', alignItems: 'center', justifyContent: 'center', height: 50 },
    headerTitleBox: { borderWidth: 1, borderColor: COLORS.primary, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8, backgroundColor: 'rgba(251, 191, 36, 0.05)', maxWidth: '85%' },
    headerTitleText: { color: COLORS.primary, fontSize: 15, fontFamily: FONTS.bold, letterSpacing: 1, textAlign: 'center' },

    headerLabelContainer: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(251, 191, 36, 0.1)', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 20 },
    headerLabel: { color: COLORS.primary, fontSize: 12, fontFamily: FONTS.semiBold, letterSpacing: 1 },

    langTagContainer: { alignItems: 'center', marginBottom: 20, marginTop: 10 },
    langLabel: { color: 'rgba(255,255,255,0.4)', fontSize: 10, fontFamily: FONTS.bold, letterSpacing: 2 },

    paragraphContainer: { marginBottom: 24 },
    paragraph: { lineHeight: 36, textAlign: 'left' },
    typewriterText: { fontSize: 18, color: COLORS.text, fontFamily: FONTS.regular, lineHeight: 36 },
    interactiveWord: { fontSize: 18, color: 'rgba(255,255,255,0.9)', fontFamily: FONTS.regular },
    importantWord: { color: COLORS.primary, fontFamily: FONTS.semiBold, textDecorationLine: 'underline', textDecorationColor: 'rgba(251, 191, 36, 0.4)' },
    activeSpeakingWord: { color: '#FFD700', fontWeight: 'bold' },

    paginationContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', position: 'absolute', bottom: 120, width: '100%', gap: 8, pointerEvents: 'none' },
    dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.text },

    footerPlayer: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 100, backgroundColor: '#050406', borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.1)', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 30, justifyContent: 'space-between' },
    playerControls: { flexDirection: 'row', alignItems: 'center', gap: 24, flex: 1, justifyContent: 'center' },
    controlBtn: { padding: 10 },
    playBtnMain: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', shadowColor: "#fff", shadowOpacity: 0.2, shadowRadius: 10 },
    finishBtn: { width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center', marginLeft: 10 },

    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 },
    loadingText: { color: COLORS.text, fontSize: 18, fontFamily: FONTS.semiBold, textAlign: 'center' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: '#1e1b2e', borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24, paddingBottom: 40, minHeight: 340, shadowColor: "#fff", shadowOffset: { width: 0, height: -5 }, shadowOpacity: 0.5, shadowRadius: 15, elevation: 20 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
    modalWord: { fontSize: 32, color: COLORS.text, fontFamily: FONTS.titleItalic, textTransform: 'capitalize' },
    translationBox: { backgroundColor: 'rgba(255,255,255,0.05)', padding: 20, borderRadius: 20, marginBottom: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
    translationLabel: { color: COLORS.inputLabel, fontSize: 11, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1.5, fontFamily: FONTS.bold },
    translationText: { color: COLORS.primary, fontSize: 22, fontFamily: FONTS.semiBold, marginBottom: 16 },
    explanationText: { color: COLORS.text, fontSize: 16, fontFamily: FONTS.regular, lineHeight: 24 },
    exampleBox: { marginTop: 16, borderLeftWidth: 3, borderLeftColor: COLORS.secondary, paddingLeft: 12 },
    exampleText: { color: COLORS.textSecondary, fontSize: 15, fontStyle: 'italic', lineHeight: 22 },
    saveWordButton: { backgroundColor: COLORS.secondary, height: 60, borderRadius: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12 },
    savedButton: { backgroundColor: 'rgba(124, 58, 237, 0.1)', borderWidth: 1, borderColor: COLORS.secondary },
    saveWordText: { color: '#fff', fontSize: 16, fontFamily: FONTS.bold, letterSpacing: 0.5 },
});