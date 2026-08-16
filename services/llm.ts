import { GoogleGenAI } from "@google/genai";
import OpenAI from "openai";

export interface LLMResponse {
  translation: string;
  exampleChukchi: string;
  exampleEnglish: string;
}

let client: any = null;

function getClient() {
  if (client) return client;

  const provider = process.env.LLM_PROVIDER || "gemini";
  const apiKey = process.env.LLM_API_KEY;

  if (!apiKey) {
    throw new Error("LLM_API_KEY environment variable is required");
  }

  if (provider === "gemini") {
    client = new GoogleGenAI({ apiKey });
  } else {
    client = new OpenAI({
      apiKey,
      baseURL: process.env.LLM_BASE_URL,
    });
  }
  return client;
}

export async function translate(text: string): Promise<LLMResponse> {
  const provider = process.env.LLM_PROVIDER || "gemini";
  const model = process.env.LLM_MODEL || (provider === "gemini" ? "gemini-1.5-flash" : "gpt-4o");
  const client = getClient();
  
  const prompt = `
      Translate the following text from Chukchi to English.
      Also provide a short, simple example sentence in Chukchi and its English translation using the word(s) translated.
      Return the output in JSON format with fields: "translation" (string), "exampleChukchi" (string), "exampleEnglish" (string).
      
      Chukchi text:
      "${text}"
  `;

  if (provider === "gemini") {
    const response = await client.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });
    return JSON.parse(response.text!);
  } else {
    const response = await client.chat.completions.create({
      model: model,
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    });
    return JSON.parse(response.choices[0].message.content!);
  }
}
