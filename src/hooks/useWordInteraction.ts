// src/hooks/useWordInteraction.ts
import { useState, useCallback } from 'react';
import { LayoutAnimation } from 'react-native'; // Modal animasyonları için hafif çözüm
import * as Haptics from 'expo-haptics';
import { Story, WordAnalysis } from '../types/story';
import { useVocabulary } from '../context/VocabularyContext';

export const useWordInteraction = (story: Story | null) => {
    const { saveWord, removeWord, isWordSaved } = useVocabulary();
    const [selectedWordData, setSelectedWordData] = useState<WordAnalysis | null>(null);
    const [isModalVisible, setModalVisible] = useState(false);

    const handleWordClick = useCallback((clickedText: string, lang: 'target' | 'native') => {
        if (!story?.vocabulary) return;

        // Regex ile temizlik
        const cleanText = clickedText.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()"]/g, "").toLowerCase();

        // Kelimeyi bul
        const foundAnalysis = story.vocabulary.find(v =>
            lang === 'target'
                ? (v.word.toLowerCase() === cleanText || v.lemma.toLowerCase() === cleanText)
                : (v.translation.toLowerCase().includes(cleanText))
        );

        if (foundAnalysis) {
            Haptics.selectionAsync();
            setSelectedWordData(foundAnalysis);
            setModalVisible(true);
        }
    }, [story]);

    const closeModal = useCallback(() => {
        setModalVisible(false);
        setSelectedWordData(null);
    }, []);

    const toggleSaveWord = useCallback(async () => {
        if (!selectedWordData) return;
        
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        
        if (isWordSaved(selectedWordData.word)) {
            await removeWord(selectedWordData.word);
        } else {
            await saveWord(selectedWordData);
        }
    }, [selectedWordData, isWordSaved, removeWord, saveWord]);

    return {
        selectedWordData,
        isModalVisible,
        handleWordClick,
        closeModal,
        toggleSaveWord,
        isSaved: selectedWordData ? isWordSaved(selectedWordData.word) : false
    };
};