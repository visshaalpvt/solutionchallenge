const callAIProxy = async (type, prompt) => {
  const response = await fetch('/api/ai', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type, prompt })
  });
  const data = await response.json();
  return data.result;
};

export const scoreNeedWithGroq = async (title, description, category = '') => {
  const prompt = `NGO Priority Analysis. JSON output only: {"urgencyScore": <1-10>, "urgencyLabel": "critical|high|medium|low", "aiSummary": "2-sentence summary"}. Need: ${title}, ${description}`;
  const text = await callAIProxy('groq', prompt);
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('Invalid AI response');
  const parsed = JSON.parse(jsonMatch[0]);
  return {
    urgencyScore: Math.round(parsed.urgencyScore || 5),
    urgencyLabel: (parsed.urgencyLabel || 'medium').toLowerCase(),
    aiSummary: parsed.aiSummary || 'Summary unavailable.',
    aiSource: 'groq-proxy'
  };
};

export const getAIInsight = async (context) => {
  try {
    const text = await callAIProxy('groq', `Analyze these needs and provide a 2-sentence summary/action plan: ${context}`);
    return text || "AI analysis unavailable.";
  } catch {
    return "Error connecting to AI service.";
  }
};

export const getMatchInsight = async (taskTitle, volunteerName, matchScore) => {
  try {
    const prompt = `SmartAlloc AI. Volunteer ${volunteerName} scored ${matchScore}/100 for "${taskTitle}". ONE sentence explanation/recommendation.`;
    return await callAIProxy('groq', prompt);
  } catch {
    return null;
  }
};

export const suggestTaskFromNeed = async (needTitle, needDescription, needCategory) => {
  try {
    const prompt = `NGO AI. Suggest task title and 2-sentence description for need: ${needTitle}, ${needDescription}. JSON: {"taskTitle": "...", "taskDescription": "..."}`;
    const text = await callAIProxy('groq', prompt);
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    return jsonMatch ? JSON.parse(jsonMatch[0]) : null;
  } catch {
    return null;
  }
};
