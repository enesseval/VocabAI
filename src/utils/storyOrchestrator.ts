// src/utils/storyOrchestrator.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserProfile } from '../context/OnboardingContext';
import { Story } from '../types/story';
import { FALLBACK_STORIES } from '../data/fallbackStories';
import { generateDailyStory } from '../services/aiService';
import { decideStorySource, DecisionContext } from './storyDecisionEngine';
import {  getGrammarTopic } from '../data/grammarSyllabus';
import { WordAnalysis } from '../types/story';

const STORAGE_KEY_HISTORY = 'story_history';
const STORAGE_KEY_LAST_FETCH = 'last_story_date';
// YENİ YARDIMCI FONKSİYON: Rastgele 4 eski kelime seç
async function getReviewWords(count: number = 4): Promise<WordAnalysis[]> {
    try {
        const json = await AsyncStorage.getItem('user_vocabulary');
        if (!json) return [];
        const allWords: WordAnalysis[] = JSON.parse(json);
        
        // Basit Karıştırma (Shuffle) ve ilk 'count' kadarını alma
        // İleride buraya "masteryLevel < 3" filtresi eklenebilir.
        const shuffled = allWords.sort(() => 0.5 - Math.random());
        return shuffled.slice(0, count);
    } catch (e) {
        console.warn("Kelime geçmişi okunamadı", e);
        return [];
    }
}

/**
 * Task 1.2 - Ana Orkestratör Fonksiyonu
 */
export const getStoryForUser = async (
    userProfile: UserProfile,
    phase: 'ONBOARDING_END' | 'RETURNING_USER' = 'ONBOARDING_END'
): Promise<Story> => {

    // 1. Context Topla (Veritabanı/Storage sorguları)
    const todayStr = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const lastFetchDate = await AsyncStorage.getItem(STORAGE_KEY_LAST_FETCH);

    // Basit bir offline kontrolü (gerçek app'te NetInfo kullanılır)
    const isOffline = false; // Şimdilik online varsayıyoruz

    // Bugün hikaye var mı? (Tarih eşleşmesi)
    const hasStoryForToday = lastFetchDate === todayStr;

    // 2. Karar Ver (Decision Engine)
    const context: DecisionContext = {
        phase,
        hasStoryForToday,
        isOffline,
        lastStoryDate: lastFetchDate || undefined
    };

    const source = decideStorySource(context);
    console.log(`Orchestrator Verdict: [${source}]`);

    // 3. Kararı Uygula (Execution)
    try {
        switch (source) {
            case 'AI_DAILY':
                return await handleAIDaily(userProfile, todayStr);

            case 'ARCHIVE':
                return await handleArchive(userProfile, todayStr);

            case 'EMERGENCY':
            case 'MAGIC_STATIC':
            default:
                return getFallbackStory(userProfile);
        }
    } catch (error) {
        console.error("Orchestrator Crash:", error);
        // Task 2.3: AI gecikirse/patlarsa asla boş ekran dönme -> Emergency Story
        return getFallbackStory(userProfile);
    }
};

// --- Yardımcı Uygulayıcılar ---

async function handleAIDaily(profile: UserProfile, dateStr: string): Promise<Story> {
    
    // 1. Kaçıncı hikaye olduğunu bul (Müfredat sırası için)
    const historyJson = await AsyncStorage.getItem(STORAGE_KEY_HISTORY);
    const history = historyJson ? JSON.parse(historyJson) : [];
    const storyCount = history.length; // 0'dan başlar

    // 2. Müfredattan konuyu seç
    const grammarTopic = getGrammarTopic(profile.level, storyCount);

    // 3. Tekrar edilecek kelimeleri seç
    const reviewWords = await getReviewWords(5);

    // 4. Servisi çağır (Artık gramer ve kelime de gönderiyoruz)
    // PM Notu: Kullanıcıya hissettirmeden öğretiyoruz!
    const story = await generateDailyStory(profile, grammarTopic, reviewWords);

    // 5. Kaydet
    await saveToHistory(story);
    await AsyncStorage.setItem(STORAGE_KEY_LAST_FETCH, dateStr);

    return story;
}

async function handleArchive(profile: UserProfile, dateStr: string): Promise<Story> {

    // 1. Geçmişi oku (Kaçıncı hikaye?)
    const historyJson = await AsyncStorage.getItem(STORAGE_KEY_HISTORY);
    const history = historyJson ? JSON.parse(historyJson) : [];
    const storyCount = history.length;

    const currentGrammarTopic = getGrammarTopic(profile.level, storyCount);

    const reviewWords = await getReviewWords(4);

    console.log(`Generating Story... Topic: ${currentGrammarTopic}, Review Words: ${reviewWords.length}`);

    // 4. Servisi çağır (generateDailyStory fonksiyonunu güncellemen gerekecek)
    // Not: generateDailyStory imzasını değiştirip bu yeni parametreleri kabul eder hale getirmelisin
    const story = await generateDailyStory(profile, currentGrammarTopic, reviewWords);

    return story;
}

function getFallbackStory(profile: UserProfile): Story {
    const lang = profile.targetLang || 'en';
    // @ts-ignore
    return FALLBACK_STORIES[lang] || FALLBACK_STORIES['en'];
}

async function saveToHistory(story: Story) {
    const history = await AsyncStorage.getItem(STORAGE_KEY_HISTORY);
    let stories = history ? JSON.parse(history) : [];

    // Task 4.1'e hazırlık: ID kontrolü yapıp duplicate önle
    if (!stories.some((s: Story) => s.id === story.id)) {
        stories.push(story);
        // Cache temizliği (Son 10)
        if (stories.length > 10) stories.shift();
        await AsyncStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(stories));
    }
}