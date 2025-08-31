import { GoogleGenAI } from "@google/genai";

// Initialize Gemini AI
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function generateAIResponse(prompt: string): Promise<string> {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
        });

        return response.text || "Sorry, I couldn't process your request right now.";
    } catch (error) {
        console.error("Gemini API error:", error);
        return "I'm having trouble connecting to the AI service. Please try again later.";
    }
}

export async function generateContextualResponse(message: string, context?: string): Promise<string> {
    try {
        const systemPrompt = `You are Jarvish, a helpful AI voice assistant. You can help users with:
- General questions and information
- Casual conversation
- Providing explanations and definitions
- Creative tasks like writing or brainstorming
- Problem-solving assistance

Keep your responses:
- Conversational and friendly
- Helpful and informative
- Concise but complete
- In Hindi or English based on user's language preference

${context ? `Context: ${context}` : ''}

User message: ${message}`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: systemPrompt,
        });

        return response.text || "मुझे खुशी होगी आपकी मदद करने में। कृपया अपना सवाल दोबारा पूछें।";
    } catch (error) {
        console.error("Gemini contextual response error:", error);
        return "मैं अभी कुछ तकनीकी समस्या का सामना कर रहा हूं। कृपया थोड़ी देर बाद कोशिश करें।";
    }
}