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
    const { level, interests, targetLang, nativeLang } = await req.json();

    if (!GEMINI_API_KEY) {
      throw new Error('Gemini API Key is missing in Supabase Secrets.');
    }

    const topicMap: Record<number, string> = {
        1: "Technology and AI", 2: "Philosophy and Ethics", 3: "Art and Creativity",
        4: "Business and Startup Culture", 5: "Nature and Environment", 6: "Science and Space",
        7: "Literature and Books", 8: "History and Ancient Civilizations",
        9: "Cinema and Movies", 10: "Travel and Adventure"
    };

    const topicNames = interests.map((id: number) => topicMap[id]).join(", ");
    
    // Dil isimlerini koddan tam isme çevir (Prompt için)
    const getLangName = (code: string) => {
        const map: Record<string, string> = { 'tr': 'Turkish', 'en': 'English', 'de': 'German', 'es': 'Spanish', 'fr': 'French', 'it': 'Italian' };
        return map[code] || 'English';
    };

    const tLangName = getLangName(targetLang);
    const nLangName = getLangName(nativeLang);

    // 🔥 MASTER PROMPT (Backend'de Güvende) 🔥
    const prompt = `
    [SYSTEM SETTING]
    You are an advanced Linguistic AI Engine.
    Modes: "Creative Author" (${tLangName}) & "Analytical Translator" (${nLangName}).

    [USER CONTEXT]
    - Level: ${level}
    - Native: ${nLangName}
    - Interests: ${topicNames}

    [TASK 1: STORYTELLING]
    1. Create a story (200-300 words) in ${tLangName}.
    2. Split it into EXACTLY 3 paragraphs.
    3. Provide the ${nLangName} translation for EACH paragraph.

    [TASK 2: VOCABULARY ANALYSIS]
    1. Extract 18-25 key vocabulary items.
    2. CRITICAL RULE: The 'explanation' and 'translation' fields MUST be in ${nLangName}.
    3. DO NOT use ${tLangName} for the explanation.
    4. Explain the context (why this word is used here).

    [OUTPUT SCHEMA (Raw JSON)]
    {
      "title": "Story Title in ${tLangName}",
      "title_native": "Story Title in ${nLangName}",
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
      "level": "${level}",
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