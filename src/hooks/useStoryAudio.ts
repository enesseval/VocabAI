// src/hooks/useStoryAudio.ts
import { useState, useEffect, useCallback } from 'react';
import * as Speech from 'expo-speech';
import { Story } from '../types/story';
import { UserProfile } from '../context/OnboardingContext';

export const useStoryAudio = (story: Story | null, activePageIndex: number, userProfile: UserProfile | null) => {
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [speechCursor, setSpeechCursor] = useState<number>(0);

    // Sayfa değişince sesi durdur
    useEffect(() => {
        stopAudio();
    }, [activePageIndex]);

    const stopAudio = useCallback(() => {
        Speech.stop();
        setIsSpeaking(false);
    }, []);

    const speakFromIndex = useCallback((startIndex: number) => {
        if (!story) return;
        
        const isTarget = activePageIndex === 0;
        const textSegments = story.segments || [];
        
        // Tüm metni birleştir (Performans için bunu useMemo ile component tarafında yapmak daha iyi ama şimdilik burada kalsın)
        const fullText = isTarget
            ? textSegments.map(s => s.target).join('\n\n') || story.content
            : textSegments.map(s => s.native).join('\n\n') || "";

        // Metin sonuna geldiyse başa sar
        if (startIndex >= fullText.length - 5) startIndex = 0;
        
        const textToSpeak = fullText.substring(startIndex);
        setIsSpeaking(true);

        const langCode = isTarget
            ? (story.language === 'en' ? 'en-US' : story.language)
            : (userProfile?.nativeLang || 'tr-TR');

        Speech.speak(textToSpeak, {
            language: langCode,
            rate: 0.85,
            pitch: 1.0,
            onBoundary: (event: any) => setSpeechCursor(startIndex + event.charIndex),
            onDone: () => setIsSpeaking(false),
            onStopped: () => setIsSpeaking(false),
        });
    }, [story, activePageIndex, userProfile]);

    const togglePlayPause = useCallback(() => {
        if (isSpeaking) {
            stopAudio();
        } else {
            speakFromIndex(speechCursor);
        }
    }, [isSpeaking, speechCursor, speakFromIndex, stopAudio]);

    const handleSkip = useCallback((direction: 'prev' | 'next') => {
        stopAudio();
        if (!story) return;

        // Basit bir kelime atlama mantığı
        // İdealde cümle bazlı atlama yapılmalı ama şimdilik logic'i koruyoruz
        let newIndex = speechCursor;
        if (direction === 'next') {
             newIndex += 30; // Kabaca bir sonraki cümleye yakın
        } else {
            newIndex = Math.max(0, newIndex - 30);
        }
        
        setSpeechCursor(newIndex);
        // Kullanıcı isterse otomatik başlatılabilir: speakFromIndex(newIndex);
    }, [story, speechCursor, stopAudio]);

    return {
        isSpeaking,
        speechCursor,
        setSpeechCursor, // Sayfa değişince sıfırlamak için
        togglePlayPause,
        handleSkip,
        stopAudio
    };
};