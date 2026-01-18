// src/services/aiService.ts

import { UserProfile } from '../context/OnboardingContext';
import { Story, WordAnalysis } from '../types/story'; // WordAnalysis tipini ekledik
import { supabase } from '../utils/supabaseClient';

// Fonksiyon imzasını değiştirdik: Artık Gramer ve Kelime listesi de istiyor
export const generateDailyStory = async (
    profile: UserProfile, 
    grammarFocus: string = "General", // Varsayılan değer
    reviewWords: WordAnalysis[] = []   // Varsayılan değer (Boş liste)
): Promise<Story> => {
    try {
        console.log(`📡 AI Servis Tetiklendi: Konu [${grammarFocus}], Kelime [${reviewWords.length} adet]`);

        const { data, error } = await supabase.functions.invoke('generate-story', {
            body: {
                level: profile.level,
                interests: profile.interests,
                targetLang: profile.targetLang || 'en',
                nativeLang: profile.nativeLang || 'tr',
                // 🔥 YENİ PARAMETRELER BACKEND'E GİDİYOR 🔥
                grammarFocus: grammarFocus,
                reviewWords: reviewWords.map(w => ({ word: w.word, translation: w.translation })) // Sadece gerekli veriyi yolluyoruz
            }
        });

        if (error) {
            console.error("Supabase Function Error:", error);
            throw new Error(`Story generation failed: ${error.message}`);
        }

        const aiResponse = data;
        const fullContent = aiResponse.segments.map((s: any) => s.target).join('\n\n');

        return {
            id: `ai_${Date.now()}`,
            title: aiResponse.title,
            titleNative: aiResponse.title_native,
            content: fullContent,
            segments: aiResponse.segments,
            language: profile.targetLang || 'en',
            topicIds: profile.interests,
            level: aiResponse.level,
            vocabulary: aiResponse.vocabulary
        };

    } catch (error) {
        console.error("AI Service Error:", error);
        throw error;
    }
};