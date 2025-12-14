import { GoogleGenAI } from "@google/genai";

// Initialize Gemini Client
// IMPORTANT: process.env.API_KEY is injected by the environment.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Solves a math problem or answers a query using Gemini 2.5 Flash.
 * @param input The user's input string (e.g., "volume of sphere radius 5" or "integrate x^2")
 * @returns A promise resolving to the result string.
 */
export const solveWithGemini = async (input: string): Promise<{ result: string, explanation?: string }> => {
  try {
    const model = 'gemini-2.5-flash';
    
    const response = await ai.models.generateContent({
      model,
      contents: input,
      config: {
        systemInstruction: `You are a helpful and precise mathematical assistant. 
        Your goal is to solve the user's math problem.
        
        Rules:
        1. If the input is a direct calculation (e.g., "5 + 5", "sqrt(25)"), return just the number.
        2. If the input is a word problem, return the numeric answer followed by a very brief unit (e.g., "15.4 kg").
        3. If the input asks for a concept, explain it in one short sentence.
        4. Do not wrap output in markdown code blocks.
        5. Prioritize returning a result that can be displayed on a calculator screen.`,
        temperature: 0.1, // Low temperature for deterministic math results
      },
    });

    const text = response.text || "";
    return { result: text.trim() };
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    throw new Error(error.message || "Failed to calculate with AI");
  }
};