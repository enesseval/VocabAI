import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// API Key'i Supabase Vault'tan (Secrets) güvenli şekilde alıyoruz
const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // CORS (Tarayıcı/Mobil istekleri için gerekli - Preflight check)
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // 1. Gelen Parametreler (Yeni eklenenler: grammarFocus, reviewWords)
    const { level, interests, targetLang, nativeLang, grammarFocus, reviewWords } = await req.json();

    if (!GEMINI_API_KEY) {
      throw new Error('Gemini API Key is missing in Supabase Secrets.');
    }

    const topicMap: Record<number, string> = {
        1: "Technology and AI", 2: "Philosophy and Ethics", 3: "Art and Creativity",
        4: "Business and Startup Culture", 5: "Nature and Environment", 6: "Science and Space",
        7: "Literature and Books", 8: "History and Ancient Civilizations",
        9: "Cinema and Movies", 10: "Travel and Adventure"
    };

    // İlgi alanlarını metne çevir
    const topicNames = interests.map((id: number) => topicMap[id]).join(", ");
    
    // Kelime listesini string'e çevir (Güvenlik kontrolü ile)
    const reviewWordsString = reviewWords && reviewWords.length > 0 
        ? reviewWords.map((w: any) => w.word).join(", ") 
        : "No specific review words for this session. Introduce 5-7 new relevant words.";

    // Dil isimlerini koddan tam isme çevir
    const getLangName = (code: string) => {
        const map: Record<string, string> = { 'tr': 'Turkish', 'en': 'English', 'de': 'German', 'es': 'Spanish', 'fr': 'French', 'it': 'Italian' };
        return map[code] || 'English';
    };

    const tLangName = getLangName(targetLang);
    const nLangName = getLangName(nativeLang);

    // 🔥 GÜNCELLENMİŞ MASTER PROMPT (BAĞLAM FARKINDALIĞI EKLENDİ) 🔥
    const prompt = `
    [SYSTEM SETTING]
    You are an advanced Linguistic AI Engine designed to teach language through "Context-Aware Storytelling".
    Target Language: ${tLangName}
    Native Language (for explanations): ${nLangName}
    Level: ${level}

    [STORY CONFIGURATION]
    1. **Topic:** ${topicNames} (Choose one main theme).
    2. **Grammar Focus (THE SECRET SYLLABUS):** "${grammarFocus || 'General'}"
       - CONSTRAINT: You MUST construct sentences that heavily rely on this grammar structure.
       - Do NOT explain the grammar in the story. Just use it naturally and frequently.
    3. **Vocabulary Injection (SPACED REPETITION):**
       - You MUST include these previously learned words in the story context: [${reviewWordsString}]
       - The story must feel natural even with these words.

    [TASK 1: STORYTELLING]
    1. Create a story (200-300 words) in ${tLangName}.
    2. Split it into EXACTLY 3 paragraphs.
    3. Provide the ${nLangName} translation for EACH paragraph.

    [TASK 2: VOCABULARY ANALYSIS]
    1. Extract 15-20 key vocabulary items.
    2. Priority 1: Include the 'reviewWords' used in the story.
    3. Priority 2: Add new challenging words relevant to the topic.
    4. CRITICAL RULE: The 'explanation' and 'translation' fields MUST be in ${nLangName}.

    [OUTPUT SCHEMA (Raw JSON)]
    {
      "title": "Story Title in ${tLangName}",
      "title_native": "Story Title in ${nLangName}",
      "grammar_focus_used": "${grammarFocus || 'General'}",
      "segments": [
        {
          "target": "Paragraph 1 text in ${tLangName}",
          "native": "Paragraph 1 translation in ${nLangName}"
        },
        {
          "target": "Paragraph 2 text...",
          "native": "Paragraph 2 translation..."
        },
        {
          "target": "Paragraph 3 text...",
          "native": "Paragraph 3 translation..."
        }
      ],
      "vocabulary": [
        {
          "word": "word",
          "lemma": "root form",
          "translation": "Direct meaning in ${nLangName}",
          "explanation": "Contextual explanation strictly in ${nLangName}.",
          "example": "Simple example sentence in ${tLangName}"
        }
      ]
    }
    `;

    // Gemini API İsteği
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        safetySettings: [
            { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_ONLY_HIGH" },
            { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_ONLY_HIGH" },
            { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_ONLY_HIGH" },
            { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_ONLY_HIGH" }
        ],
        generationConfig: { responseMimeType: "application/json", temperature: 0.70 }
      })
    });

    const data = await response.json();
    
    if (!data.candidates?.[0]?.content) {
        console.error("Gemini Blocked/Error:", JSON.stringify(data));
        throw new Error("Gemini API blocked the response or returned empty.");
    }

    const rawText = data.candidates[0].content.parts[0].text;
    const cleanJson = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
    const storyData = JSON.parse(cleanJson);

    return new Response(JSON.stringify(storyData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});