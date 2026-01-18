// src/screens/ReadStoryScreen.tsx

import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Modal, Animated, Dimensions, PanResponder, TouchableWithoutFeedback, NativeSyntheticEvent, NativeScrollEvent, StatusBar as RNStatusBar, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Haptics from 'expo-haptics';
import * as Speech from 'expo-speech';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as NavigationBar from 'expo-navigation-bar';
import { BlurView } from 'expo-blur';

import { RootStackParamList } from '../types/navigation';
import { COLORS, FONTS } from '../constants/theme';
import { useOnboarding } from '../context/OnboardingContext';
import { getStoryForUser } from '../utils/storyOrchestrator';
import { Story, WordAnalysis } from '../types/story';
import { useVocabulary } from '../context/VocabularyContext';

const { width, height } = Dimensions.get('window');
const VISUAL_BAR_HEIGHT = 90;

// 🔥 MOCK DATA
const MOCK_STORY: Story = {
    id: "mock-long-1",
    title: "The Echo of the Stars",
    titleNative: "Yıldızların Yankısı",
    language: "en",
    level: "B2",
    topicIds: [1, 6],
    content: "The universe is an endless ocean of darkness, punctuated by islands of light that we call stars. To travel through this vast expanse is to understand the true meaning of silence. It is not merely the absence of sound, but a heavy, pressing weight that reminds you of your own insignificance. As our ship, the Voyager, drifts further away from Earth, the familiar constellations begin to distort and change. We are no longer observing history from a distance; we are becoming part of it. The darkness between the stars is not empty; it is filled with the echoes of ancient events, waiting for someone to listen. Every astronaut who has ventured this far shares the same feeling: a mixture of profound loneliness and an overwhelming connection to everything that exists.\n\nOur destination is the Orion Nebula, a stellar nursery where new stars are being born from dust and gas. The sensors on our hull pick up radiation patterns that look like vibrant paintings on our screens. Approaching such a massive structure makes you realize the chaotic beauty of creation. The swirling clouds of violet and gold are hundreds of times larger than our entire solar system. Inside this cosmic storm, gravity is pulling particles together to ignite nuclear fusion, the heartbeat of a new sun. Witnessing this process is both terrifying and magnificent. We rely on our technology to protect us, but looking out the viewport, one cannot help but feel fragile against the raw power of the cosmos.\n\nAs we prepare to transmit our data back home, I look at the tiny blue dot that used to be our entire world. From this distance, borders, wars, and differences vanish, leaving only a fragile sphere of life suspended in the void. Exploring space is not just about discovering new resources or planets; it is about rediscovering ourselves. We push our limits, facing the unknown, not to conquer the universe, but to understand our place within it. The journey back will take years, but the perspective we have gained will last forever. We are travelers in the dark, carrying the torch of curiosity into the infinite night.",
    segments: [
        {
            target: "The universe is an endless ocean of darkness, punctuated by islands of light that we call stars. To travel through this vast expanse is to understand the true meaning of silence. It is not merely the absence of sound, but a heavy, pressing weight that reminds you of your own insignificance. As our ship, the Voyager, drifts further away from Earth, the familiar constellations begin to distort and change. We are no longer observing history from a distance; we are becoming part of it. The darkness between the stars is not empty; it is filled with the echoes of ancient events, waiting for someone to listen. Every astronaut who has ventured this far shares the same feeling: a mixture of profound loneliness and an overwhelming connection to everything that exists.",
            native: "Evren, yıldız dediğimiz ışık adalarıyla bezenmiş sonsuz bir karanlık okyanusudur. Bu uçsuz bucaksız genişlikte seyahat etmek, sessizliğin gerçek anlamını kavramaktır. Bu sadece sesin yokluğu değil, size kendi önemsizliğinizi hatırlatan ağır, baskıcı bir ağırlıktır. Gemimiz Voyager Dünya'dan uzaklaştıkça, tanıdık takımyıldızlar bozulmaya ve değişmeye başlıyor. Artık tarihi uzaktan izlemiyoruz; onun bir parçası oluyoruz. Yıldızların arasındaki karanlık boş değil; birinin dinlemesini bekleyen antik olayların yankılarıyla dolu. Bu kadar uzağa gitme cesaretini gösteren her astronot aynı hissi paylaşır: derin bir yalnızlık ve var olan her şeye karşı bunaltıcı bir bağın karışımı."
        },
        {
            target: "Our destination is the Orion Nebula, a stellar nursery where new stars are being born from dust and gas. The sensors on our hull pick up radiation patterns that look like vibrant paintings on our screens. Approaching such a massive structure makes you realize the chaotic beauty of creation. The swirling clouds of violet and gold are hundreds of times larger than our entire solar system. Inside this cosmic storm, gravity is pulling particles together to ignite nuclear fusion, the heartbeat of a new sun. Witnessing this process is both terrifying and magnificent. We rely on our technology to protect us, but looking out the viewport, one cannot help but feel fragile against the raw power of the cosmos.",
            native: "Hedefimiz, toz ve gazdan yeni yıldızların doğduğu bir yıldız fidanlığı olan Orion Bulutsusu. Gövdemizdeki sensörler, ekranlarımızda canlı tablolar gibi görünen radyasyon desenlerini algılıyor. Böylesine devasa bir yapıya yaklaşmak, yaratılışın kaotik güzelliğini fark etmenizi sağlıyor. Dönen mor ve altın rengi bulutlar, tüm güneş sistemimizden yüzlerce kat daha büyük. Bu kozmik fırtınanın içinde yerçekimi, yeni bir güneşin kalp atışı olan nükleer füzyonu ateşlemek için parçacıkları bir araya çekiyor. Bu sürece tanıklık etmek hem korkutucu hem de muhteşem. Bizi koruması için teknolojimize güveniyoruz, ancak vizörden dışarı bakınca, insan kozmosun ham gücü karşısında kendini kırılgan hissetmekten alamıyor."
        },
        {
            target: "As we prepare to transmit our data back home, I look at the tiny blue dot that used to be our entire world. From this distance, borders, wars, and differences vanish, leaving only a fragile sphere of life suspended in the void. Exploring space is not just about discovering new resources or planets; it is about rediscovering ourselves. We push our limits, facing the unknown, not to conquer the universe, but to understand our place within it. The journey back will take years, but the perspective we have gained will last forever. We are travelers in the dark, carrying the torch of curiosity into the infinite night.",
            native: "Verilerimizi eve geri göndermeye hazırlanırken, bir zamanlar tüm dünyamız olan o minik mavi noktaya bakıyorum. Bu mesafeden sınırlar, savaşlar ve farklılıklar yok oluyor, geriye sadece boşlukta asılı duran kırılgan bir yaşam küresi kalıyor. Uzayı keşfetmek sadece yeni kaynaklar veya gezegenler keşfetmekle ilgili değildir; kendimizi yeniden keşfetmekle ilgilidir. Sınırlarımızı zorluyor, bilinmeyenle yüzleşiyoruz; evreni fethetmek için değil, onun içindeki yerimizi anlamak için. Geri dönüş yolculuğu yıllar sürecek ama kazandığımız bakış açısı sonsuza dek sürecek. Bizler karanlıktaki yolcularız, merak meşalesini sonsuz geceye taşıyoruz."
        }
    ],
    vocabulary: [
        { word: "insignificance", translation: "önemsiz olma durumu", explanation: "The state of being unimportant or small", example: "The vast ocean made him feel his insignificance.", lemma: "insignificance" },
        { word: "distort", translation: "bozulmak, çarpılmak", explanation: "To change shape or appearance", example: "Heat can distort the image.", lemma: "distort" },
        { word: "venture", translation: "cesaret edip gitmek", explanation: "To go somewhere that might be dangerous", example: "They ventured into the dark forest.", lemma: "venture" },
        { word: "chaos", translation: "kaos, kargaşa", explanation: "Complete disorder and confusion", example: "The city was in chaos after the storm.", lemma: "chaos" },
        { word: "fragile", translation: "kırılgan", explanation: "Easily broken or damaged", example: "Handle the fragile vase with care.", lemma: "fragile" },
        { word: "suspend", translation: "asılı kalmak", explanation: "To hang something from somewhere", example: "The lamp was suspended from the ceiling.", lemma: "suspend" }
    ]
};

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
    const insets = useSafeAreaInsets();

    const isHistoryMode = route.name === 'StoryModal';
    const initialStory = (route.params as any)?.story;

    const { userProfile } = useOnboarding();
    const { saveWord, removeWord, isWordSaved } = useVocabulary();

    const [story, setStory] = useState<Story | null>(initialStory || null);
    const [isGenerating, setIsGenerating] = useState(!initialStory);
    const [loadingText, setLoadingText] = useState("İçerik hazırlanıyor...");
    const [isTypingComplete, setIsTypingComplete] = useState(!!initialStory);

    const [isSpeaking, setIsSpeaking] = useState(false);
    const [activePageIndex, setActivePageIndex] = useState(0);
    const [speechCursor, setSpeechCursor] = useState<number>(0);

    const [selectedWordData, setSelectedWordData] = useState<WordAnalysis | null>(null);
    const [isModalVisible, setModalVisible] = useState(false);

    const scrollX = useRef(new Animated.Value(0)).current;
    const modalSlideAnim = useRef(new Animated.Value(height)).current;

    // 🔥 DRAG TO DISMISS (GÜNCELLENDİ: BAŞLANGIÇ HEIGHT)
    const panY = useRef(new Animated.Value(isHistoryMode ? height : 0)).current;

    // 🔥 IMMERSIVE MODE & LOAD CONTENT & ENTRY ANIMATION
    useEffect(() => {
        RNStatusBar.setHidden(true, 'fade');
        if (Platform.OS === 'android') {
            NavigationBar.setVisibilityAsync("hidden");
            NavigationBar.setBehaviorAsync('overlay-swipe');
        }

        // 🔥 GİRİŞ ANİMASYONU: AŞAĞIDAN YUKARI KAYDIR
        if (isHistoryMode) {
            Animated.spring(panY, {
                toValue: 0,
                useNativeDriver: true,
                bounciness: 4,
                speed: 12
            }).start();
        }

        const loadContent = async () => {
            if (initialStory) return;
            setStory(MOCK_STORY);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            setIsGenerating(false);
        };
        loadContent();

        return () => {
            Speech.stop();
            RNStatusBar.setHidden(false, 'fade');
            if (Platform.OS === 'android') {
                NavigationBar.setVisibilityAsync("visible");
            }
        };
    }, [userProfile]);

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => isHistoryMode,
            onMoveShouldSetPanResponder: (_, gestureState) => isHistoryMode && gestureState.dy > 5,
            onPanResponderMove: (_, gestureState) => {
                if (gestureState.dy > 0) panY.setValue(gestureState.dy);
            },
            onPanResponderRelease: (_, gestureState) => {
                // 🔥 ÇIKIŞ ANİMASYONU: AŞAĞI KAYDIR VE KAPAT
                if (gestureState.dy > 120) {
                    Animated.timing(panY, {
                        toValue: height,
                        duration: 250,
                        useNativeDriver: true
                    }).start(() => {
                        navigation.goBack();
                    });
                } else {
                    Animated.spring(panY, { toValue: 0, useNativeDriver: true, bounciness: 4 }).start();
                }
            },
        })
    ).current;

    const isSaved = selectedWordData ? isWordSaved(selectedWordData.word) : false;

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
            <StatusBar style="light" hidden={true} />

            {/* BACKDROP */}
            {isHistoryMode ? (
                <TouchableWithoutFeedback onPress={() => {
                    Animated.timing(panY, {
                        toValue: height,
                        duration: 250,
                        useNativeDriver: true
                    }).start(() => navigation.goBack());
                }}>
                    <Animated.View style={[
                        StyleSheet.absoluteFill,
                        {
                            backgroundColor: 'rgba(0,0,0,0.8)',
                            opacity: panY.interpolate({
                                inputRange: [0, height],
                                outputRange: [1, 0] // Aşağı kaydırdıkça arka plan açılsın
                            })
                        }
                    ]} />
                </TouchableWithoutFeedback>
            ) : (
                <LinearGradient colors={['#1e1b4b', '#050406', '#000']} style={StyleSheet.absoluteFill} />
            )}

            <Animated.View
                style={[
                    styles.contentContainer,
                    isHistoryMode && styles.modalSheetStyle,
                    { transform: isHistoryMode ? [{ translateY: panY }] : [] }
                ]}
            >
                {isHistoryMode && (
                    <LinearGradient
                        colors={['#1e1b4b', '#050406', '#000']}
                        style={StyleSheet.absoluteFill}
                    />
                )}

                <Animated.ScrollView
                    horizontal pagingEnabled showsHorizontalScrollIndicator={false}
                    scrollEventThrottle={16}
                    onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], { useNativeDriver: false })}
                    onMomentumScrollEnd={onMomentumScrollEnd}
                    style={{ flex: 1 }}
                >
                    <View style={{ width }}>
                        <ScrollView
                            showsVerticalScrollIndicator={false}
                            contentContainerStyle={{
                                paddingHorizontal: 24,
                                paddingTop: VISUAL_BAR_HEIGHT + (isHistoryMode ? 20 : insets.top),
                                paddingBottom: VISUAL_BAR_HEIGHT + insets.bottom + 40
                            }}
                        >
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

                    <View style={{ width }}>
                        <ScrollView
                            showsVerticalScrollIndicator={false}
                            contentContainerStyle={{
                                paddingHorizontal: 24,
                                paddingTop: VISUAL_BAR_HEIGHT + (isHistoryMode ? 20 : insets.top + 20),
                                paddingBottom: VISUAL_BAR_HEIGHT + insets.bottom + 40
                            }}
                        >
                            {segments.map((seg, i) => {
                                let prevLength = 0;
                                for (let k = 0; k < i; k++) prevLength += segments[k].native.length + 2;
                                return <View key={i} style={styles.paragraphContainer}><ParagraphRenderer text={seg.native} lang="native" vocabulary={story.vocabulary} globalStartIndex={prevLength} /></View>
                            })}
                        </ScrollView>
                    </View>
                </Animated.ScrollView>

                {/* --- GRADIENT HEADER --- */}
                <LinearGradient
                    colors={['#000000', '#000000E6', 'transparent']}
                    style={[
                        styles.gradientHeader,
                        {
                            height: VISUAL_BAR_HEIGHT + 30 + (isHistoryMode ? 0 : insets.top),
                            paddingTop: isHistoryMode ? 20 : insets.top
                        },
                    ]}
                    {...(isHistoryMode ? panResponder.panHandlers : {})}
                >
                    {isHistoryMode && (
                        <View style={styles.handleContainer}>
                            <View style={styles.handle} />
                        </View>
                    )}

                    <View style={styles.headerContentWrapper}>
                        <View style={styles.headerTitleContainer}>
                            <Animated.View style={{ opacity: targetTitleOpacity, position: 'absolute', width: '100%', alignItems: 'center' }}>
                                <View style={styles.headerTitleBox}>
                                    <Ionicons name="sparkles" size={14} color='#1E1B4B' />
                                    <Text style={styles.headerTitleText} numberOfLines={1}>{story.title.toUpperCase()}</Text>
                                </View>
                            </Animated.View>
                            <Animated.View style={{ opacity: nativeTitleOpacity, width: '100%', alignItems: 'center' }}>
                                <View style={styles.headerTitleBox}>
                                    <Ionicons name="sparkles" size={14} color="#1e1b4b" />
                                    <Text style={styles.headerTitleText} numberOfLines={1}>{story.titleNative?.toUpperCase() || "ÇEVİRİ"}</Text>
                                </View>
                            </Animated.View>
                        </View>
                    </View>
                </LinearGradient>

                <View style={[styles.paginationContainer, { bottom: VISUAL_BAR_HEIGHT + insets.bottom + 10 }]}>
                    <View style={styles.paginationPill}>
                        <Animated.View style={[styles.dot, { opacity: scrollX.interpolate({ inputRange: [0, width], outputRange: [1, 0.3] }) }]} />
                        <Animated.View style={[styles.dot, { opacity: scrollX.interpolate({ inputRange: [0, width], outputRange: [0.3, 1] }) }]} />
                    </View>
                </View>

                {/* --- GRADIENT FOOTER --- */}
                <LinearGradient
                    colors={['transparent', '#000000E6', '#000000']}
                    style={[
                        styles.gradientFooter,
                        {
                            height: VISUAL_BAR_HEIGHT + 30 + insets.bottom,
                            paddingBottom: isHistoryMode ? 20 : insets.bottom - 30
                        }
                    ]}
                >
                    <View style={styles.playerControls}>
                        <TouchableOpacity onPress={() => handleSkip('prev')} style={styles.controlBtn}>
                            <Ionicons name="play-skip-back" size={18} color="rgba(30,27,75,0.8)" />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={handlePlayPause} style={styles.playBtnMain}>
                            <Ionicons name={isSpeaking ? "pause" : "play"} size={32} color="#1e1b4b" style={{ marginLeft: 4 }} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => handleSkip('next')} style={styles.controlBtn}>
                            <Ionicons name="play-skip-forward" size={18} color="rgba(30,27,75,0.8)" />
                        </TouchableOpacity>
                    </View>

                    {!initialStory && (
                        <TouchableOpacity style={styles.finishBtn} onPress={handleComplete}>
                            <Ionicons name="checkmark" size={24} color="#1E1B4B" />
                        </TouchableOpacity>
                    )}
                </LinearGradient>

                {/* 🔥 BORDER OVERLAY (En Üstte ve Border Radius Sorununu Çözer) */}
                {isHistoryMode && (
                    <View style={styles.modalBorderOverlay} pointerEvents="none" />
                )}

            </Animated.View>

            {/* WORD MODAL */}
            <Modal animationType="fade" transparent={true} visible={isModalVisible} onRequestClose={closeModal}>
                <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill}>
                    <TouchableOpacity style={StyleSheet.absoluteFill} onPress={closeModal} />
                </BlurView>

                <View style={styles.modalOverlay}>
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
    contentContainer: { flex: 1, backgroundColor: 'transparent' },

    modalSheetStyle: {
        marginTop: height * 0.12,
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        overflow: 'hidden',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -10 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
        // Border overlay'e taşındı
    },

    // 🔥 YENİ STİL (ÇERÇEVE İÇİN)
    modalBorderOverlay: {
        ...StyleSheet.absoluteFillObject,
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        borderWidth: 1,
        borderTopColor: 'rgba(255, 255, 255, 0.6)',
        zIndex: 999,
        backgroundColor: 'transparent'
    },

    gradientHeader: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 10,
        justifyContent: 'center',
    },
    headerContentWrapper: {
        flex: 1,
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 10,
    },
    handleContainer: { width: '100%', alignItems: 'center', marginTop: 10, position: 'absolute', top: 0, zIndex: 20 },
    handle: { width: 120, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.8)' },

    headerTitleContainer: { width: '100%', alignItems: 'center', justifyContent: 'center', height: 40 },

    headerTitleBox: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        borderWidth: 1,
        borderColor: COLORS.primary,
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 8,
        backgroundColor: COLORS.primaryLight,
        maxWidth: '85%',
        shadowColor: COLORS.primary,
        shadowOpacity: 0.40,
        shadowRadius: 10,
    },
    headerTitleText: { color: "#1E1B4B", fontSize: 15, fontFamily: FONTS.bold, letterSpacing: 1, textAlign: 'center' },

    gradientFooter: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 30,
        justifyContent: 'space-between',
        zIndex: 10,
    },
    playerControls: { flexDirection: 'row', alignItems: 'center', gap: 24, flex: 1, justifyContent: 'center' },
    controlBtn: {
        padding: 2,
        width: 36,
        height: 36,
        borderRadius: 28,
        backgroundColor: COLORS.primaryLight,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: COLORS.primary,
        shadowOpacity: 0.40,
        shadowRadius: 10,
        borderWidth: 1,
        borderColor: COLORS.primary
    },
    playBtnMain: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: COLORS.primaryLight,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: COLORS.primary,
        shadowOpacity: 0.40,
        shadowRadius: 10,
        borderWidth: 1,
        borderColor: COLORS.primary
    },
    finishBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: COLORS.primaryLight,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 10,
        borderWidth: 1,
        borderColor: COLORS.primary,
        shadowColor: COLORS.primary,
        shadowOpacity: 0.40,
        shadowRadius: 10,
    },

    paragraphContainer: { marginBottom: 24 },
    paragraph: { lineHeight: 36, textAlign: 'left' },
    typewriterText: { fontSize: 18, color: COLORS.text, fontFamily: FONTS.regular, lineHeight: 36 },
    interactiveWord: { fontSize: 18, color: 'rgba(255,255,255,0.9)', fontFamily: FONTS.regular },
    importantWord: { color: COLORS.primary, fontFamily: FONTS.semiBold, textDecorationLine: 'underline', textDecorationColor: 'rgba(251, 191, 36, 0.4)' },
    activeSpeakingWord: { color: '#FFD700', fontWeight: 'bold' },

    paginationContainer: {
        position: 'absolute',
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 15,
        pointerEvents: 'none'
    },
    paginationPill: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.4)',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.4,
        shadowRadius: 4,
    },
    dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#fff' },

    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 },
    loadingText: { color: COLORS.text, fontSize: 18, fontFamily: FONTS.semiBold, textAlign: 'center' },
    modalOverlay: { flex: 1, justifyContent: 'flex-end' },
    modalContent: {
        backgroundColor: '#1e1b2e',
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        padding: 24,
        paddingBottom: 40,
        minHeight: 340,
        shadowColor: "#fff",
        shadowOffset: { width: 0, height: -5 },
        shadowOpacity: 0.5,
        shadowRadius: 15,
        elevation: 20,
    },
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