/**
 * Groq API Service — Primary AI Engine
 * Uses LLaMA 3 8B via Groq Cloud for fast inference
 */

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

const getApiKey = () => {
  const apiKey = import.meta.env.VITE_GROQ_API_KEY;
  if (!apiKey || apiKey === 'your_groq_api_key') {
    throw new Error('Groq API key not configured');
  }
  return apiKey;
};

/**
 * Call Groq API with a prompt
 */
const callGroq = async (messages, temperature = 0.1) => {
  const response = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getApiKey()}`,
    },
    body: JSON.stringify({
      model: 'llama3-8b-8192',
      messages,
      temperature,
      max_tokens: 1024,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error?.message || `Groq API error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
};

/**
 * Score a community need using Groq/LLaMA
 */
export const scoreNeedWithGroq = async (title, description, category = '') => {
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

  const text = await callGroq([{ role: 'user', content: prompt }]);

  // Parse JSON from response
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('Invalid response format from Groq');

  const parsed = JSON.parse(jsonMatch[0]);

  return {
    urgencyScore: Math.max(1, Math.min(10, Math.round(parsed.urgencyScore || 5))),
    urgencyLabel: (parsed.urgencyLabel || 'medium').toLowerCase(),
    aiSummary: parsed.aiSummary || 'No summary available.',
    aiSource: 'groq'
  };
};

/**
 * Get a general AI insight/recommendation
 * Used across dashboards for contextual AI advice
 */
export const getAIInsight = async (context) => {
  try {
    const prompt = `You are SmartAlloc AI, an assistant for an NGO volunteer coordination platform.
    Based on the following context, provide a brief, actionable insight (2-3 sentences max).
    Be specific and practical. Don't use generic advice.

    Context: ${context}

    Respond with ONLY the insight text, no formatting or labels.`;

    const text = await callGroq([{ role: 'user', content: prompt }], 0.3);
    return text.trim();
  } catch (err) {
    console.warn('AI insight failed:', err.message);
    return null;
  }
};

/**
 * Get AI-powered volunteer recommendation summary
 */
export const getMatchInsight = async (taskTitle, volunteerName, matchScore) => {
  try {
    const prompt = `You are SmartAlloc AI. A volunteer matching system scored ${volunteerName} at ${matchScore}/100 for the task "${taskTitle}". 
    Write ONE sentence explaining why this is a ${matchScore >= 70 ? 'strong' : matchScore >= 40 ? 'moderate' : 'potential'} match and any recommendation.
    Be brief and specific.`;

    const text = await callGroq([{ role: 'user', content: prompt }], 0.3);
    return text.trim();
  } catch {
    return null;
  }
};

/**
 * Generate a task description suggestion from a need
 */
export const suggestTaskFromNeed = async (needTitle, needDescription, needCategory) => {
  try {
    const prompt = `You are SmartAlloc AI. An NGO has a community need:
    Title: ${needTitle}
    Description: ${needDescription}
    Category: ${needCategory}

    Suggest a practical task title and description (2-3 sentences) that a volunteer can act on.
    Respond with JSON: {"taskTitle": "...", "taskDescription": "..."}`;

    const text = await callGroq([{ role: 'user', content: prompt }], 0.3);
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch {
    // silent fail
  }
  return null;
};
