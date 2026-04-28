import { GoogleGenerativeAI } from '@google/generative-ai';
import { scoreNeedWithGroq } from './groqService';
import { findSimilarAIResult } from './firestoreService';

let genAI = null;

const getGenAI = () => {
  if (!genAI) {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey || apiKey === 'your_gemini_api_key') {
      throw new Error('Gemini API key not configured');
    }
    genAI = new GoogleGenerativeAI(apiKey);
  }
  return genAI;
};

/**
 * Optimized AI Scoring Service
 * Flow: Cache Check -> Gemini -> Groq Fallback -> Default Fallback
 */
export const scoreNeed = async (title, description, category = '') => {
  // STEP 1: CACHE CHECK (Deduplication)
  try {
    const cachedResult = await findSimilarAIResult(title, description);
    if (cachedResult) {
      console.log('Using cached AI result for:', title);
      return cachedResult;
    }
  } catch (err) {
    console.warn('Cache check failed, proceeding to AI:', err.message);
  }

  // PROMPT DEFINITION
  const prompt = `You are an AI assistant helping an NGO prioritize community needs.
    Analyze the following community need and provide:
    1. An urgency score from 1 to 10 (10 being most urgent)
    2. An urgency label: "critical" (8-10), "high" (6-7), "medium" (4-5), or "low" (1-3)
    3. A brief summary (2-3 sentences) of the need and recommended action

    Community Need:
    Title: ${title}
    Description: ${description}
    Category: ${category}

    Respond ONLY with valid JSON in this exact format, no extra text:
    {
      "urgencyScore": <number 1-10>,
      "urgencyLabel": "<critical|high|medium|low>",
      "aiSummary": "<2-3 sentence summary with recommended action>"
    }`;

  // STEP 2: TRY GEMINI (Primary)
  try {
    const ai = getGenAI();
    const model = ai.getGenerativeModel({ model: 'gemini-2.0-flash' });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        urgencyScore: Math.max(1, Math.min(10, Math.round(parsed.urgencyScore || 5))),
        urgencyLabel: (parsed.urgencyLabel || 'medium').toLowerCase(),
        aiSummary: parsed.aiSummary || 'No summary available.',
        aiSource: 'gemini'
      };
    }
  } catch (err) {
    console.warn('Gemini API failed, attempting Groq fallback...', err.message);
  }

  // STEP 3: TRY GROQ (Fallback)
  try {
    return await scoreNeedWithGroq(title, description, category);
  } catch (err) {
    console.warn('Groq API failed, using default values...', err.message);
  }

  // STEP 4: HARD FALLBACK (Default)
  return {
    urgencyScore: 5,
    urgencyLabel: 'medium',
    aiSummary: `[AI Analysis Unavailable] ${title}: ${description.substring(0, 50)}... Manual review required.`,
    aiSource: 'fallback'
  };
};
