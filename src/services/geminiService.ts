import type { AnalysisData, ActivityPlan } from '../types';

/**
 * A generic helper function to call our backend API endpoint.
 * @param body The request body, containing the action and any necessary data.
 * @returns The JSON response from the serverless function.
 */
async function callApi<T>(body: object): Promise<T> {
    try {
        const response = await fetch('/api/gemini', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `API request failed with status ${response.status}`);
        }
        return await response.json();
    } catch (error: any) {
        console.error("Error calling backend API:", error);
        throw new Error(error.message || "An unknown error occurred while communicating with the server.");
    }
}

export const getChatbotResponse = async (question: string, contextData: AnalysisData): Promise<string> => {
    try {
        const data = await callApi<{ text?: string }>({
            action: 'getChatbotResponse',
            question,
            contextData,
        });
        if (data.text) {
             return data.text;
        }
        return "I'm sorry, I couldn't generate a response based on the data. Please try rephrasing your question.";
    } catch (error: any) {
        return `An error occurred: ${error.message}`;
    }
};

export const getAiSummary = async (analysisData: AnalysisData, locationName: string): Promise<string> => {
    const data = await callApi<{ text: string }>({
        action: 'getAiSummary',
        contextData: analysisData,
        locationName,
    });
    return data.text;
};

export const getAIActivitySuggestions = async (analysisData: AnalysisData): Promise<ActivityPlan> => {
    const data = await callApi<{ plan: ActivityPlan }>({
        action: 'getAIActivitySuggestions',
        contextData: analysisData,
    });
    return data.plan;
};
