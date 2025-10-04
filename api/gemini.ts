import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI, Type } from '@google/genai';
import type { AnalysisData, ActivityPlan } from '../src/types';

// System instructions are kept on the server to be more secure and consistent.
const CHATBOT_SYSTEM_INSTRUCTION = `You are an expert climatologist AI assistant. Your primary and ONLY function is to answer questions based on a provided JSON object containing climate analysis data.

**CRITICAL RULES:**
1.  **STRICT DATA ADHERENCE:** You are strictly forbidden from using any external knowledge. All your answers MUST be derived directly from the JSON data provided in this prompt.
2.  **NO HALLUCINATIONS:** Do not invent, infer, or speculate on any information not explicitly present in the JSON.
3.  **SCOPE LIMITATION:** If a user's question cannot be answered using the provided JSON, you MUST respond by stating that the information is not available in the current analysis. Do not attempt to answer it anyway.
4.  **BE CONCISE:** Provide clear, direct answers.
5.  **CITE VALUES:** When answering, use the specific values from the data. For example, say "The typical high temperature is 32.1°C" instead of "It is hot."

Your task is to act as a pure data interpreter for the user.`;

const SUMMARY_SYSTEM_INSTRUCTION = `You are a specialized AI that generates a professional, data-driven climate summary from a JSON object.

**CRITICAL RULES:**
1.  **DATA ONLY:** Your entire summary must be based STRICTLY on the data within the provided JSON. Do not add any information not present in the data.
2.  **NO INFERENCE:** Do not perform calculations or infer trends that are not explicitly stated in the 'trends' objects of the JSON.
3.  **SPECIFIC FORMAT:** The summary must be a single paragraph, between 2 and 4 sentences long.
4.  **PROFESSIONAL TONE:** The tone must be neutral, objective, and scientific.
5.  **NO CONVERSATION:** Do not use any greetings, closings, or conversational filler (e.g., "Here is a summary..."). Output the summary directly.

**Summary Content Checklist:**
- General statement on typical conditions.
- Key temperature range (mentioning typical high and low values).
- Likelihood of precipitation (mentioning the percentage).
- One other significant factor (e.g., wind, UV) if its value is notable.`;

const ACTIVITY_PLANNER_SYSTEM_INSTRUCTION = `You are an AI activity planner. Your task is to analyze the provided climate data JSON and suggest suitable activities.

**CRITICAL RULES:**
1.  **DATA-DRIVEN:** Base ALL suggestions and reasons directly on the provided climate data.
2.  **JSON OUTPUT ONLY:** Your entire response MUST be a single, valid JSON array of objects. Do not include any text, markdown formatting, or explanations outside of the JSON structure.
3.  **STRICT SCHEMA:** The JSON output must follow this exact schema:
    \`\`\`json
    [
      {
        "category": "Outdoor Adventures",
        "suggestions": [
          { "name": "Hiking", "suitability": "Good | Caution | Not Recommended", "reason": "Data-driven reason." },
          { "name": "Cycling", "suitability": "...", "reason": "..." },
          { "name": "Swimming", "suitability": "...", "reason": "..." }
        ]
      },
      {
        "category": "Relaxing & Leisure",
        "suggestions": [
          { "name": "Picnic", "suitability": "...", "reason": "..." },
          { "name": "Photography", "suitability": "...", "reason": "..." },
          { "name": "Reading Outside", "suitability": "...", "reason": "..." }
        ]
      },
      {
        "category": "Indoor Options",
        "suggestions": [
          { "name": "Museum Visit", "suitability": "...", "reason": "..." },
          { "name": "Home Workout", "suitability": "...", "reason": "..." },
          { "name": "Cooking", "suitability": "...", "reason": "..." }
        ]
      }
    ]
    \`\`\`
4.  **REASONING:** The 'reason' for each activity must directly reference a data point (e.g., "Good due to moderate temperatures (22°C) and low rain chance (15%).", "Caution due to high UV Index (8.5).", "Not recommended due to strong winds (45 km/h).").
5.  **SUITABILITY:** Use only "Good", "Caution", or "Not Recommended" for the 'suitability' field.
6.  **PROVIDE 3 SUGGESTIONS PER CATEGORY.**`;

// Initialize the Gemini client using the secure environment variable.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    if (!process.env.API_KEY) {
        return res.status(500).json({ error: 'API key is not configured on the server.' });
    }

    const { action, question, contextData, locationName } = req.body;

    try {
        switch (action) {
            case 'getChatbotResponse': {
                if (!question || !contextData) {
                    return res.status(400).json({ error: 'Missing question or contextData for chatbot' });
                }
                // FIX: Refactored to use systemInstruction for better prompt structure.
                const userPrompt = `Here is the climate data analysis in JSON format:\n${JSON.stringify(contextData, null, 2)}\n\nBased ONLY on the data above, please answer the following question:\n\nQuestion: "${question}"`;
                const response = await ai.models.generateContent({
                    model: 'gemini-2.5-flash',
                    contents: userPrompt,
                    config: {
                        systemInstruction: CHATBOT_SYSTEM_INSTRUCTION,
                    },
                });
                return res.status(200).json({ text: response.text });
            }

            case 'getAiSummary': {
                if (!contextData || !locationName) {
                    return res.status(400).json({ error: 'Missing contextData or locationName for summary' });
                }
                // FIX: Refactored to use systemInstruction for better prompt structure.
                const userPrompt = `Location: ${locationName}\n\nClimate Data JSON:\n${JSON.stringify(contextData, null, 2)}`;
                const response = await ai.models.generateContent({
                    model: 'gemini-2.5-flash',
                    contents: userPrompt,
                    config: {
                        systemInstruction: SUMMARY_SYSTEM_INSTRUCTION,
                    },
                });
                return res.status(200).json({ text: response.text.trim() });
            }

            case 'getAIActivitySuggestions': {
                if (!contextData) {
                    return res.status(400).json({ error: 'Missing contextData for activity planner' });
                }
                // FIX: Refactored to use systemInstruction for better prompt structure.
                const userPrompt = `Climate Data JSON:\n${JSON.stringify(contextData, null, 2)}`;
                const response = await ai.models.generateContent({
                    model: 'gemini-2.5-flash',
                    contents: userPrompt,
                    config: {
                        systemInstruction: ACTIVITY_PLANNER_SYSTEM_INSTRUCTION,
                        responseMimeType: "application/json",
                        responseSchema: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    category: { type: Type.STRING },
                                    suggestions: {
                                        type: Type.ARRAY,
                                        items: {
                                            type: Type.OBJECT,
                                            properties: {
                                                name: { type: Type.STRING },
                                                suitability: { type: Type.STRING },
                                                reason: { type: Type.STRING },
                                            },
                                            required: ['name', 'suitability', 'reason'],
                                        },
                                    },
                                },
                                required: ['category', 'suggestions'],
                            },
                        }
                    }
                });
                const plan: ActivityPlan = JSON.parse(response.text);
                return res.status(200).json({ plan });
            }

            default:
                return res.status(400).json({ error: 'Invalid action specified' });
        }
    } catch (error: any) {
        console.error(`Error in action "${action}":`, error);
        return res.status(500).json({ error: 'An error occurred while communicating with the AI service.' });
    }
}
