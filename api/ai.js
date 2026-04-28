import { Groq } from 'groq-sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';

// These will be pulled from Vercel's environment variables
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { type, prompt } = req.body;

  try {
    if (type === 'groq') {
      const completion = await groq.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: 'llama3-8b-8192',
        response_format: { type: 'json_object' } // Force JSON for scoring
      });
      return res.status(200).json({ result: completion.choices[0].message.content });
    } 
    
    if (type === 'gemini') {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return res.status(200).json({ result: response.text() });
    }

    res.status(400).json({ error: 'Invalid AI type' });
  } catch (error) {
    console.error('AI Proxy Error:', error);
    res.status(500).json({ error: 'AI Processing Failed. Please ensure API keys are set in Vercel/Render.' });
  }
}
