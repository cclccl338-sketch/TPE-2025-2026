import { GoogleGenAI, Type } from "@google/genai";
import { ActivityType, DayPlan, generateUUID } from "../types";

// Helper to safely get AI instance
// This prevents the app from crashing on load if process.env is undefined
const getAI = () => {
  try {
    // Safely check if process is defined (Node/Vite environment)
    // In strict browser environments without shims, accessing 'process' directly throws ReferenceError
    const apiKey = (typeof process !== 'undefined' && process.env) ? process.env.API_KEY : undefined;
    
    if (!apiKey) {
      console.warn("Gemini API Key is missing. AI features will be disabled.");
      return null;
    }
    return new GoogleGenAI({ apiKey });
  } catch (e) {
    console.warn("Error initializing Gemini client:", e);
    return null;
  }
};

export const generateDaySuggestion = async (date: string, preferences: string): Promise<DayPlan | null> => {
  const ai = getAI();
  if (!ai) return null;

  const modelId = "gemini-2.5-flash";
  
  const prompt = `
    Create a detailed travel itinerary for one day in Taipei, Taiwan on ${date}.
    User preferences: ${preferences || "General sightseeing, good food, and local culture"}.
    
    Return a JSON object with a list of activities.
    Each activity should have:
    - time (HH:MM format)
    - location (Name of place)
    - description (Short description)
    - type (one of: TRANSPORT, MEAL, SITE, OTHER)
    - costTWD (estimated cost in New Taiwan Dollars as a number)
    - notes (Clothing or practical advice)
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            date: { type: Type.STRING },
            activities: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  time: { type: Type.STRING },
                  location: { type: Type.STRING },
                  description: { type: Type.STRING },
                  type: { type: Type.STRING, enum: [ActivityType.TRANSPORT, ActivityType.MEAL, ActivityType.SITE, ActivityType.OTHER] },
                  costTWD: { type: Type.NUMBER },
                  notes: { type: Type.STRING }
                }
              }
            },
            dailyNote: { type: Type.STRING }
          }
        }
      }
    });

    const text = response.text;
    if (!text) return null;
    
    const data = JSON.parse(text);
    // Add IDs to activities
    if (data.activities) {
        data.activities = data.activities.map((a: any) => ({...a, id: generateUUID()}));
    }
    return data as DayPlan;

  } catch (error) {
    console.error("Gemini Suggestion Error:", error);
    return null;
  }
};

export const getWeatherAdvice = async (latitude: number, longitude: number) => {
  const ai = getAI();
  
  // Fallback immediately if no AI (prevents getting stuck in loading state)
  if (!ai) {
    return {
      forecast: [
        { dayName: "Offline", temp: "--", condition: "No Data", rainChance: "--" },
        { dayName: "Offline", temp: "--", condition: "No Data", rainChance: "--" },
        { dayName: "Offline", temp: "--", condition: "No Data", rainChance: "--" },
      ],
      clothingAdvice: "Unable to retrieve real-time forecast. Please check internet connection or API configuration.",
      umbrellaNeeded: false,
      generalOutlook: "Offline Mode"
    };
  }

  // Use googleSearch for real-time forecast grounding
  const modelId = "gemini-2.5-flash";
  
  const prompt = `
    Using Google Search, find the absolute latest 3-day weather forecast for Taipei City, specifically sourcing data from the Taiwan Central Weather Administration (CWA).
    
    Look for specific CWA indicators like:
    - Temperature range (High/Low)
    - Probability of Precipitation (PoP)
    - Weather Description (e.g., Cloudy with occasional showers)

    Also, provide the typical weather context for late December/early January in Taipei based on historical CWA data.

    Return a JSON object matching the schema below. 
    ensure 'forecast' array has 3 items.
    'dayName' should be the specific day (e.g. "Tomorrow", "Mon", "Tue").
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
           type: Type.OBJECT,
           properties: {
             forecast: {
               type: Type.ARRAY,
               items: {
                 type: Type.OBJECT,
                 properties: {
                   dayName: { type: Type.STRING },
                   temp: { type: Type.STRING },
                   condition: { type: Type.STRING },
                   rainChance: { type: Type.STRING }
                 }
               }
             },
             clothingAdvice: { type: Type.STRING },
             umbrellaNeeded: { type: Type.BOOLEAN },
             generalOutlook: { type: Type.STRING }
           }
        }
      }
    });

    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Gemini Weather Error:", error);
    // Fallback data if API fails or quota exceeded
    return {
      forecast: [
        { dayName: "Day 1", temp: "18-22°C", condition: "Cloudy", rainChance: "30%" },
        { dayName: "Day 2", temp: "17-20°C", condition: "Light Rain", rainChance: "60%" },
        { dayName: "Day 3", temp: "19-23°C", condition: "Sunny", rainChance: "10%" },
      ],
      clothingAdvice: "Taipei winters are humid and cool. Wear layers and bring a light jacket.",
      umbrellaNeeded: true,
      generalOutlook: "Typical humid winter weather."
    };
  }
};