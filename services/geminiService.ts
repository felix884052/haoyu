
import { GoogleGenAI, Type } from "@google/genai";
import { MarketingPlan } from "../types";

// The API key must be obtained exclusively from the environment variable process.env.API_KEY.
// Use this process.env.API_KEY string directly when initializing.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateMarketingPlan = async (prompt: string): Promise<MarketingPlan> => {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-pro",
    contents: prompt,
    config: {
      systemInstruction: `You are a world-class Marketing Director AI for the OmniDecide platform. 
      Your goal is to provide data-driven budget allocations and coupon strategies.
      Analyze user requests and return a structured marketing plan.
      Always ensure budget allocations sum to 100%. 
      Provide specific coupon triggers (e.g., 'Inactivity > 30 days', 'Cart Abandonment').`,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          objective: { type: Type.STRING },
          totalBudget: { type: Type.NUMBER },
          allocations: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                channel: { type: Type.STRING },
                amount: { type: Type.NUMBER },
                percentage: { type: Type.NUMBER },
                expectedROI: { type: Type.NUMBER }
              },
              required: ["channel", "amount", "percentage", "expectedROI"]
            }
          },
          strategies: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                type: { type: Type.STRING },
                value: { type: Type.STRING },
                targetSegment: { type: Type.STRING },
                triggerCondition: { type: Type.STRING }
              },
              required: ["type", "value", "targetSegment", "triggerCondition"]
            }
          },
          reasoning: { type: Type.STRING }
        },
        required: ["name", "objective", "totalBudget", "allocations", "strategies", "reasoning"]
      }
    }
  });

  // Extracting text output from GenerateContentResponse using .text property as per guidelines
  const text = response.text || "{}";
  return JSON.parse(text) as MarketingPlan;
};
