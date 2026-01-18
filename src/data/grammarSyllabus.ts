// src/data/grammarSyllabus.ts (YENİ DOSYA)

export const GRAMMAR_SYLLABUS: Record<string, string[]> = {
    'A1': [
        "Present Simple Tense (Subject + Verb)",
        "Verb 'to be' (am/is/are)",
        "Have got / Has got",
        "There is / There are",
        "Imperatives (Do this / Don't do that)",
        "Present Continuous (am/is/are + V-ing)",
        "Can / Can't for ability"
    ],
    'A2': [
        "Past Simple (Regular Verbs)",
        "Past Simple (Irregular Verbs)",
        "Future with 'going to'",
        "Comparatives (better, faster)",
        "Superlatives (the best, the fastest)",
        "Present Perfect (Introduction)"
    ],
    'B1': [
        "First Conditional (If... will)",
        "Second Conditional (If... would)",
        "Past Continuous (was/were + V-ing)",
        "Used to / Would for past habits",
        "Passive Voice (Simple Tenses)"
    ],
    'B2': [
        "Third Conditional",
        "Mixed Conditionals",
        "Reported Speech",
        "Passive Voice (Advanced)",
        "Future Continuous & Perfect"
    ],
    'C1': [
        "Inversion structures",
        "Subjunctive Mood",
        "Nuances in Modal Verbs",
        "Advanced Phrasal Verbs"
    ]
};

// Hikaye sayısına göre modüler aritmetik yapıp konuyu seçer
export const getGrammarTopic = (level: string, storyCount: number): string => {
    // Eğer seviye yoksa default A1 al
    const topics = GRAMMAR_SYLLABUS[level] || GRAMMAR_SYLLABUS['A1'];
    // Örneğin 10. hikayedeyse ve 7 konu varsa, 3. konuyu (10 % 7) seçer.
    // Böylece konular bitince başa döner (Spiral Öğrenme).
    return topics[storyCount % topics.length];
};