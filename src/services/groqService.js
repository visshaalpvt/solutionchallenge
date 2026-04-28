/**
 * Service for Groq API integration (Fallback for Gemini)
 */

export const scoreNeedWithGroq = async (title, description, category = '') => {
  const apiKey = import.meta.env.VITE_GROQ_API_KEY;
  if (!apiKey || apiKey === 'your_groq_api_key') {
    throw new Error('Groq API key not configured');
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

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'llama3-8b-8192',
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.1,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Groq API call failed');
    }

    const data = await response.json();
    const text = data.choices[0].message.content;

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
  } catch (err) {
    console.error('Groq Service Error:', err);
    throw err;
  }
};
