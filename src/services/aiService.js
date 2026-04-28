import { findSimilarAIResult } from './firestoreService';

export const scoreNeed = async (title, description) => {
  // STEP 1: CACHE CHECK (Deduplication)
  try {
    const cachedResult = await findSimilarAIResult(title, description);
    if (cachedResult) return cachedResult;
  } catch (err) {
    console.warn('Cache check failed:', err.message);
  }

  const prompt = `You are an AI assistant helping an NGO prioritize community needs.
    Analyze the following community need and provide:
    1. An urgency score from 1 to 10
    2. An urgency label: "critical", "high", "medium", or "low"
    3. A brief summary (2-3 sentences)
    Need: ${title}, ${description}
    Respond ONLY with JSON: {"urgencyScore": <number>, "urgencyLabel": "<string>", "aiSummary": "<string>"}`;

  // STEP 2: SECURE API CALL VIA PROXY
  try {
    const response = await fetch('/api/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'gemini', prompt })
    });
    
    const data = await response.json();
    const text = data.result;
    
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        urgencyScore: Math.max(1, Math.min(10, Math.round(parsed.urgencyScore || 5))),
        urgencyLabel: (parsed.urgencyLabel || 'medium').toLowerCase(),
        aiSummary: parsed.aiSummary || 'No summary available.',
        aiSource: 'secure-proxy'
      };
    }
  } catch (err) {
    console.error('AI Proxy Failed:', err.message);
  }

  // STEP 3: FALLBACK (Keep system working even if AI is down)
  return {
    urgencyScore: 5,
    urgencyLabel: 'medium',
    aiSummary: `AI analysis currently unavailable. Manual review required for: ${title}`,
    aiSource: 'fallback'
  };
};

/**
 * Get general AI insight for dashboards and summaries
 */
export { getAIInsight };
