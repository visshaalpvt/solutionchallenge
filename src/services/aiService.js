import { GoogleGenerativeAI } from '@google/generative-ai';
import { scoreNeedWithGroq, getAIInsight } from './groqService';
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
 * Flow: Cache Check -> Groq (Primary) -> Gemini (Fallback) -> Default Fallback
 * 
 * Groq is now primary because it's faster and more reliable for JSON output.
 */
export const scoreNeed = async (title, description, category = '') => {
  // STEP 1: CACHE CHECK (Deduplication)
  try {
    const cachedResult = await findSimilarAIResult(title, description);
    if (cachedResult) {
      console.log('✅ Using cached AI result for:', title);
      return cachedResult;
    }
  } catch (err) {
    console.warn('Cache check failed, proceeding to AI:', err.message);
  }

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

  // STEP 2: TRY GROQ (Primary — fast & reliable)
  try {
    console.log('🤖 Attempting Groq AI analysis...');
    const result = await scoreNeedWithGroq(title, description, category);
    if (result) {
      console.log('✅ Groq AI succeeded');
      return result;
    }
  } catch (err) {
    console.warn('⚠️ Groq API failed, attempting Gemini fallback...', err.message);
  }

  // STEP 3: TRY GEMINI (Fallback)
  try {
    console.log('🤖 Attempting Gemini AI analysis...');
    const ai = getGenAI();
    const model = ai.getGenerativeModel({ model: 'gemini-2.0-flash' });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      console.log('✅ Gemini AI succeeded');
      return {
        urgencyScore: Math.max(1, Math.min(10, Math.round(parsed.urgencyScore || 5))),
        urgencyLabel: (parsed.urgencyLabel || 'medium').toLowerCase(),
        aiSummary: parsed.aiSummary || 'No summary available.',
        aiSource: 'gemini'
      };
    }
  } catch (err) {
    console.warn('⚠️ Gemini API also failed:', err.message);
  }

  // STEP 4: SMART FALLBACK (Keyword-based scoring instead of showing "Unavailable")
  const urgencyKeywords = {
    critical: ['emergency', 'urgent', 'critical', 'life-threatening', 'death', 'flood', 'fire', 'disaster', 'epidemic', 'collapse'],
    high: ['medical', 'hospital', 'injury', 'hunger', 'homeless', 'violence', 'crisis', 'outbreak', 'shortage'],
    medium: ['education', 'school', 'water', 'food', 'shelter', 'repair', 'sanitation', 'infrastructure'],
    low: ['improvement', 'awareness', 'training', 'workshop', 'beautification', 'planning', 'community'],
  };

  const text = `${title} ${description} ${category}`.toLowerCase();
  let detectedLabel = 'medium';
  let detectedScore = 5;

  for (const [label, keywords] of Object.entries(urgencyKeywords)) {
    if (keywords.some(k => text.includes(k))) {
      detectedLabel = label;
      detectedScore = label === 'critical' ? 9 : label === 'high' ? 7 : label === 'medium' ? 5 : 3;
      break;
    }
  }

  return {
    urgencyScore: detectedScore,
    urgencyLabel: detectedLabel,
    aiSummary: `AI Analysis: "${title}" has been classified as ${detectedLabel} priority (score: ${detectedScore}/10) based on keyword analysis. ${description.substring(0, 100)}. Recommend ${detectedLabel === 'critical' || detectedLabel === 'high' ? 'immediate deployment of volunteers' : 'scheduled volunteer coordination'}.`,
    aiSource: 'smart-fallback'
  };
};

/**
 * Get general AI insight for dashboards and summaries
 */
export { getAIInsight };
