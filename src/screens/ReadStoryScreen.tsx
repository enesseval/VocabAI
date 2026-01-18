// src/screens/ReadStoryScreen.tsx

import React, { useEffect, useState, useRef, useMemo } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator,
    Modal, Animated, Dimensions, PanResponder, TouchableWithoutFeedback,
    NativeSyntheticEvent, NativeScrollEvent, StatusBar as RNStatusBar, Platform
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Haptics from 'expo-haptics';
import * as Speech from 'expo-speech';
import * as NavigationBar from 'expo-navigation-bar';
import { BlurView } from 'expo-blur';

import { RootStackParamList } from '../types/navigation';
import { COLORS, FONTS } from '../constants/theme';
import { useOnboarding } from '../context/OnboardingContext';
import { Story } from '../types/story';

import { useStoryAudio } from '../hooks/useStoryAudio';
import { useWordInteraction } from '../hooks/useWordInteraction';

const { width, height } = Dimensions.get('window');

// --- TASARIM TEMASI ---
const THEME = {
    bgGradient: ['#020617', '#0f172a', '#000000'] as const,
    textMain: '#F8FAFC',
    textMuted: 'rgba(148, 163, 184, 0.6)',
    accent: '#F59E0B', // Amber
    glassBg: Platform.OS === 'ios' ? 'rgba(15, 23, 42, 0.6)' : 'rgba(15, 23, 42, 0.9)',
};

// --- MOCK DATA ---
const MOCK_STORY: Story = {
    id: "mock-long-1",
    title: "The Echo of the Stars",
    titleNative: "Yıldızların Yankısı",
    language: "en",
    level: "B2",
    topicIds: [1, 6],
    content: "The universe is an endless ocean of darkness...",
    segments: [
        {
            target: "The universe is an endless ocean of darkness, punctuated by islands of light that we call stars. To travel through this vast expanse is to understand the true meaning of silence. It is not merely the absence of sound, but a heavy, pressing weight that reminds you of your own insignificance.",
            native: "Evren, yıldız dediğimiz ışık adalarıyla bezenmiş sonsuz bir karanlık okyanusudur. Bu uçsuz bucaksız genişlikte seyahat etmek, sessizliğin gerçek anlamını kavramaktır. Bu sadece sesin yokluğu değil, size kendi önemsizliğinizi hatırlatan ağır, baskıcı bir ağırlıktır."
        },
        {
            target: "As our ship, the Voyager, drifts further away from Earth, the familiar constellations begin to distort and change. We are no longer observing history from a distance; we are becoming part of it.",
            native: "Gemimiz Voyager Dünya'dan uzaklaştıkça, tanıdık takımyıldızlar bozulmaya ve değişmeye başlıyor. Artık tarihi uzaktan izlemiyoruz; onun bir parçası oluyoruz."
        }
    ],
    vocabulary: [
        { word: "insignificance", translation: "önemsiz olma durumu", explanation: "The state of being unimportant or small", example: "The vast ocean made him feel his insignificance.", lemma: "insignificance" },
        { word: "distort", translation: "bozulmak, çarpılmak", explanation: "To change shape or appearance", example: "Heat can distort the image.", lemma: "distort" }
    ]
};

// --- COMPONENTS ---

const InteractiveWord = React.memo(({ word, isImportant, isSpeakingNow, onPress }: any) => (
    <Text onPress={onPress} style={[
        styles.wordBase,
        isImportant && styles.wordImportant,
        isSpeakingNow && styles.wordActive // Glow Effect Style
    ]}>
        {word}
    </Text>
));

const TypewriterText = ({ text, onComplete, style, skipAnimation }: any) => {
    const [displayedText, setDisplayedText] = useState('');
    useEffect(() => {
        if (skipAnimation) { setDisplayedText(text); onComplete(); return; }
        let currentLength = 0;
        const totalLength = text.length;
        const chunkSize = 4;
        const timer = setInterval(() => {
            currentLength += chunkSize;
            if (currentLength >= totalLength) {
                setDisplayedText(text); clearInterval(timer); onComplete();
            } else {
                setDisplayedText(text.slice(0, currentLength));
            }
        }, 10);
        return () => clearInterval(timer);
    }, [text, skipAnimation]);
    return <Text style={style}>{displayedText}</Text>;
};

// --- MAIN SCREEN ---

export default function ReadStoryScreen() {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const route = useRoute<RouteProp<RootStackParamList, 'ReadStory' | 'StoryModal'>>();
    const insets = useSafeAreaInsets();
    const { userProfile } = useOnboarding();

    const isHistoryMode = route.name === 'StoryModal';
    const initialStory = (route.params as any)?.story;

    const [story, setStory] = useState<Story | null>(initialStory || null);
    const [isGenerating, setIsGenerating] = useState(!initialStory);
    const [isTypingComplete, setIsTypingComplete] = useState(!!initialStory);
    const [activePageIndex, setActivePageIndex] = useState(0);

    const { isSpeaking, speechCursor, setSpeechCursor, togglePlayPause, handleSkip, stopAudio } = useStoryAudio(story, activePageIndex, userProfile);
    const { selectedWordData, isModalVisible, handleWordClick, closeModal, toggleSaveWord, isSaved } = useWordInteraction(story);

    const scrollX = useRef(new Animated.Value(0)).current;
    const modalSlideAnim = useRef(new Animated.Value(height)).current;
    const panY = useRef(new Animated.Value(isHistoryMode ? height : 0)).current;

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => isHistoryMode,
            onMoveShouldSetPanResponder: (_, gestureState) => isHistoryMode && gestureState.dy > 5,
            onPanResponderMove: (_, gestureState) => { if (gestureState.dy > 0) panY.setValue(gestureState.dy); },
            onPanResponderRelease: (_, gestureState) => {
                if (gestureState.dy > 120) {
                    Animated.timing(panY, { toValue: height, duration: 250, useNativeDriver: true }).start(() => navigation.goBack());
                } else {
                    Animated.spring(panY, { toValue: 0, useNativeDriver: true, bounciness: 4 }).start();
                }
            },
        })
    ).current;

    const processedSegments = useMemo(() => {
        if (!story?.segments) return [];
        return story.segments.map((seg) => {
            const processText = (text: string, type: 'target' | 'native') => text.split(' ').map(rawWord => {
                const clean = rawWord.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()"]/g, "").toLowerCase();
                const isImportant = type === 'target'
                    ? story.vocabulary?.some(v => v.word.toLowerCase() === clean || v.lemma.toLowerCase() === clean)
                    : story.vocabulary?.some(v => v.translation.toLowerCase().includes(clean));
                return { raw: rawWord, clean, isImportant: !!isImportant };
            });
            return { targetWords: processText(seg.target, 'target'), nativeWords: processText(seg.native, 'native') };
        });
    }, [story]);

    const calculateGlobalIndex = (segIndex: number, type: 'target' | 'native') => {
        let count = 0;
        if (!story?.segments) return 0;
        for (let i = 0; i < segIndex; i++) {
            count += (type === 'target' ? story.segments[i].target.length : story.segments[i].native.length) + 2;
        }
        return count;
    };

    useEffect(() => {
        RNStatusBar.setHidden(true, 'fade');
        if (Platform.OS === 'android') { NavigationBar.setVisibilityAsync("hidden"); NavigationBar.setBehaviorAsync('overlay-swipe'); }
        if (isHistoryMode) Animated.spring(panY, { toValue: 0, useNativeDriver: true, bounciness: 4, speed: 12 }).start();

        const loadContent = async () => {
            if (initialStory) return;
            setTimeout(() => { setStory(MOCK_STORY); Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); setIsGenerating(false); }, 800);
        };
        loadContent();

        return () => { stopAudio(); RNStatusBar.setHidden(false, 'fade'); if (Platform.OS === 'android') NavigationBar.setVisibilityAsync("visible"); };
    }, []);

    useEffect(() => {
        Animated.timing(modalSlideAnim, { toValue: isModalVisible ? 0 : height, duration: 350, useNativeDriver: true }).start();
    }, [isModalVisible]);

    const onMomentumScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
        const pageIndex = Math.round(e.nativeEvent.contentOffset.x / width);
        if (pageIndex !== activePageIndex) { setActivePageIndex(pageIndex); setSpeechCursor(0); Haptics.selectionAsync(); }
    };

    const handleComplete = () => { stopAudio(); Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] }); };

    const renderParagraph = (words: any[], lang: 'target' | 'native', startIndex: number) => {
        let localCharIndex = 0;
        return (
            <Text style={styles.paragraph}>
                {words.map((w, i) => {
                    const globalStart = startIndex + localCharIndex;
                    const isSpeakingNow = activePageIndex === (lang === 'target' ? 0 : 1) && speechCursor >= globalStart && speechCursor < globalStart + w.raw.length;
                    localCharIndex += w.raw.length + 1;
                    return (
                        <Text key={i}>
                            <InteractiveWord word={w.raw} isImportant={w.isImportant} isSpeakingNow={isSpeakingNow} onPress={() => handleWordClick(w.raw, lang)} />
                            <Text style={styles.wordSpacer}> </Text>
                        </Text>
                    );
                })}
            </Text>
        );
    };

    if (isGenerating || !story) {
        return (
            <View style={styles.loadingContainer}>
                <LinearGradient colors={THEME.bgGradient} style={StyleSheet.absoluteFill} />
                <ActivityIndicator size="large" color={THEME.accent} />
                <Text style={styles.loadingText}>Hikayeniz oluşturuluyor...</Text>
            </View>
        );
    }

    const targetTitleOpacity = scrollX.interpolate({ inputRange: [0, width / 2, width], outputRange: [1, 0, 0], extrapolate: 'clamp' });
    const nativeTitleOpacity = scrollX.interpolate({ inputRange: [0, width / 2, width], outputRange: [0, 0, 1], extrapolate: 'clamp' });

    return (
        <View style={{ flex: 1, backgroundColor: '#000' }}>
            <StatusBar style="light" hidden />
            <LinearGradient colors={THEME.bgGradient} style={StyleSheet.absoluteFill} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} />

            {isHistoryMode && (
                <TouchableWithoutFeedback onPress={() => { Animated.timing(panY, { toValue: height, duration: 250, useNativeDriver: true }).start(() => navigation.goBack()); }}>
                    <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: '#000', opacity: panY.interpolate({ inputRange: [0, height], outputRange: [0.8, 0] }) }]} />
                </TouchableWithoutFeedback>
            )}

            <Animated.View style={[styles.mainContainer, isHistoryMode && styles.sheetContainer, { transform: isHistoryMode ? [{ translateY: panY }] : [] }]}>
                {isHistoryMode && <LinearGradient colors={['#1e1b4b', '#000']} style={StyleSheet.absoluteFill} />}

                {/* --- HEADER (CLEANED) --- */}
                <BlurView intensity={30} tint="dark" style={[styles.floatingHeader, { paddingTop: isHistoryMode ? 20 : insets.top + 15 }]} {...(isHistoryMode ? panResponder.panHandlers : {})}>
                    {isHistoryMode && <View style={styles.dragHandle} />}
                    <View style={styles.headerContent}>
                        <Animated.View style={[styles.headerTitleWrapper, { opacity: targetTitleOpacity }]}>
                            {/* Subtitle removed as requested */}
                            <Text style={styles.headerTitle} numberOfLines={1}>{story.title}</Text>
                        </Animated.View>
                        <Animated.View style={[styles.headerTitleWrapper, { opacity: nativeTitleOpacity }]}>
                            <Text style={styles.headerTitle} numberOfLines={1}>{story.titleNative}</Text>
                        </Animated.View>
                    </View>
                </BlurView>

                {/* --- CONTENT --- */}
                <Animated.ScrollView
                    horizontal pagingEnabled showsHorizontalScrollIndicator={false}
                    scrollEventThrottle={16}
                    onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], { useNativeDriver: false })}
                    onMomentumScrollEnd={onMomentumScrollEnd}
                    contentContainerStyle={{ flexGrow: 1 }}
                >
                    <View style={{ width }}>
                        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.storyScrollContent, { paddingTop: insets.top + 80, paddingBottom: insets.bottom + 160 }]}>
                            {!isTypingComplete ? (
                                <TypewriterText text={story.content} style={styles.paragraph} onComplete={() => setIsTypingComplete(true)} skipAnimation={isHistoryMode} />
                            ) : (
                                processedSegments.map((seg, i) => (
                                    <View key={i} style={styles.segmentContainer}>
                                        {renderParagraph(seg.targetWords, 'target', calculateGlobalIndex(i, 'target'))}
                                    </View>
                                ))
                            )}
                        </ScrollView>
                    </View>
                    <View style={{ width }}>
                        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.storyScrollContent, { paddingTop: insets.top + 80, paddingBottom: insets.bottom + 160 }]}>
                            {processedSegments.map((seg, i) => (
                                <View key={i} style={styles.segmentContainer}>
                                    {renderParagraph(seg.nativeWords, 'native', calculateGlobalIndex(i, 'native'))}
                                </View>
                            ))}
                        </ScrollView>
                    </View>
                </Animated.ScrollView>

                {/* --- REVISED COMPACT CONTROLS --- */}
                <View style={[styles.floatingControlsContainer, { bottom: insets.bottom + 0 }]}>

                    {/* Page Dots - Above controls */}
                    <View style={styles.pageIndicatorContainer}>
                        <Animated.View style={[styles.pageDot, { opacity: scrollX.interpolate({ inputRange: [0, width], outputRange: [1, 0.3] }) }]} />
                        <Animated.View style={[styles.pageDot, { opacity: scrollX.interpolate({ inputRange: [0, width], outputRange: [0.3, 1] }) }]} />
                    </View>

                    {/* The Control Capsule (Width %65) */}
                    <BlurView intensity={40} tint="dark" style={styles.floatingControls}>
                        <TouchableOpacity onPress={() => handleSkip('prev')} style={styles.controlIconBtn}>
                            <Ionicons name="play-skip-back" size={20} color={THEME.textMain} />
                        </TouchableOpacity>

                        <TouchableOpacity onPress={togglePlayPause} style={styles.playButtonMain}>
                            {isSpeaking ? (
                                <Ionicons name="pause" size={22} color="#000" />
                            ) : (
                                <Ionicons name="play" size={22} color="#000" style={{ marginLeft: 3 }} />
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => handleSkip('next')} style={styles.controlIconBtn}>
                            <Ionicons name="play-skip-forward" size={20} color={THEME.textMain} />
                        </TouchableOpacity>

                        {!initialStory && (
                            <TouchableOpacity style={styles.finishButton} onPress={handleComplete}>
                                <Ionicons name="checkmark" size={18} color={THEME.accent} />
                            </TouchableOpacity>
                        )}
                    </BlurView>
                </View>

                {isHistoryMode && <View style={styles.borderOverlay} pointerEvents="none" />}
            </Animated.View>

            {/* --- MODAL --- */}
            <Modal animationType="none" transparent={true} visible={isModalVisible} onRequestClose={closeModal}>
                <View style={styles.modalBackdrop}>
                    <TouchableWithoutFeedback onPress={closeModal}><View style={StyleSheet.absoluteFill} /></TouchableWithoutFeedback>
                    <Animated.View style={[styles.wordModalContainer, { transform: [{ translateY: modalSlideAnim }] }]}>
                        <BlurView intensity={50} tint="dark" style={StyleSheet.absoluteFill} />
                        <View style={styles.wordModalContent}>
                            <View style={styles.modalDragHandle} />
                            <View style={styles.wordHeader}>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.wordTitle}>{selectedWordData?.word}</Text>
                                    <Text style={styles.wordTranslation}>{selectedWordData?.translation}</Text>
                                </View>
                                <TouchableOpacity onPress={() => Speech.speak(selectedWordData?.word || "", { language: story.language })} style={styles.audioBtn}>
                                    <Ionicons name="volume-high" size={24} color={THEME.accent} />
                                </TouchableOpacity>
                            </View>
                            <View style={styles.divider} />
                            <Text style={styles.sectionLabel}>CONTEXT</Text>
                            <Text style={styles.wordExplanation}>{selectedWordData?.explanation}</Text>
                            <TouchableOpacity style={[styles.saveBtn, isSaved && styles.saveBtnActive]} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); toggleSaveWord(); }}>
                                <Ionicons name={isSaved ? "bookmark" : "bookmark-outline"} size={20} color={isSaved ? THEME.accent : THEME.textMain} />
                                <Text style={[styles.saveBtnText, isSaved && { color: THEME.accent }]}>{isSaved ? "Saved" : "Save Word"}</Text>
                            </TouchableOpacity>
                        </View>
                    </Animated.View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loadingText: { color: THEME.textMain, marginTop: 16, fontFamily: FONTS.semiBold, fontSize: 16 },

    mainContainer: { flex: 1, overflow: 'hidden' },
    sheetContainer: { marginTop: 60, borderTopLeftRadius: 32, borderTopRightRadius: 32 },
    borderOverlay: { ...StyleSheet.absoluteFillObject, borderRadius: 32, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', zIndex: 99 },

    floatingHeader: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 50, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
    dragHandle: { width: 40, height: 4, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 2, alignSelf: 'center', marginBottom: 15 },
    headerContent: { alignItems: 'center', justifyContent: 'center', height: 40 },
    headerTitleWrapper: { position: 'absolute', alignItems: 'center', width: '85%' },
    headerTitle: { color: THEME.textMain, fontSize: 16, fontFamily: FONTS.bold, letterSpacing: 0.5, textAlign: 'center' },

    storyScrollContent: { paddingHorizontal: 28 },
    segmentContainer: { marginBottom: 32 },
    paragraph: { color: '#E2E8F0', fontSize: 19, lineHeight: 34, fontFamily: FONTS.regular, letterSpacing: -0.2 },
    wordBase: { fontSize: 19, fontFamily: FONTS.regular, color: '#E2E8F0' },
    wordSpacer: { fontSize: 19 },
    wordImportant: { color: THEME.accent, fontFamily: FONTS.semiBold, textDecorationLine: 'underline', textDecorationColor: 'rgba(245, 158, 11, 0.4)' },

    // 🔥 NEW GLOW EFFECT (No Background)
    wordActive: {
        color: THEME.accent,
        textShadowColor: 'rgba(245, 158, 11, 0.8)',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 10,
        fontWeight: '700'
    },

    // --- REVISED COMPACT CONTROLS ---
    floatingControlsContainer: {
        position: 'absolute',
        left: 0,
        right: 0,
        alignItems: 'center',
        zIndex: 50,
    },

    pageIndicatorContainer: { flexDirection: 'row', gap: 8, marginBottom: 16, alignSelf: 'center' },
    pageDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#fff', shadowColor: "#fff", shadowOpacity: 0.5, shadowRadius: 4 },

    floatingControls: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-evenly', // Dağılımı dengeledik
        backgroundColor: THEME.glassBg,
        borderRadius: 60,
        paddingVertical: 10,
        paddingHorizontal: 20,
        width: '65%', // 🔥 DAHA DAR (User Requested)
        maxWidth: 320,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        overflow: 'hidden'
    },

    controlIconBtn: { width: 36, height: 36, justifyContent: 'center', alignItems: 'center', borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.05)' },

    playButtonMain: {
        width: 50, // 🔥 DAHA KÜÇÜK (User Requested)
        height: 50,
        borderRadius: 25,
        backgroundColor: THEME.textMain,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: "#fff",
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.15,
        shadowRadius: 10
    },

    finishButton: {
        width: 36, height: 36,
        justifyContent: 'center', alignItems: 'center',
        backgroundColor: 'rgba(245, 158, 11, 0.15)',
        borderRadius: 18,
        borderWidth: 1,
        borderColor: 'rgba(245, 158, 11, 0.3)'
    },

    // Modal
    modalBackdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.6)' },
    wordModalContainer: { width: '100%', borderTopLeftRadius: 40, borderTopRightRadius: 40, overflow: 'hidden', height: height * 0.45, backgroundColor: '#111' },
    wordModalContent: { padding: 32, flex: 1 },
    modalDragHandle: { width: 40, height: 4, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 2, alignSelf: 'center', marginBottom: 24 },
    wordHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
    wordTitle: { fontSize: 32, fontFamily: FONTS.titleItalic, color: '#fff', marginBottom: 4, textTransform: 'capitalize' },
    wordTranslation: { fontSize: 20, color: THEME.accent, fontFamily: FONTS.regular },
    audioBtn: { width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.08)', justifyContent: 'center', alignItems: 'center' },
    divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.1)', marginVertical: 20 },
    sectionLabel: { color: THEME.textMuted, fontSize: 12, fontFamily: FONTS.bold, letterSpacing: 1.5, marginBottom: 8 },
    wordExplanation: { color: '#CBD5E1', fontSize: 16, lineHeight: 24, fontFamily: FONTS.regular, marginBottom: 24 },
    saveBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 16, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
    saveBtnActive: { backgroundColor: 'rgba(245, 158, 11, 0.15)', borderColor: THEME.accent },
    saveBtnText: { color: '#fff', fontSize: 16, fontFamily: FONTS.semiBold },
});