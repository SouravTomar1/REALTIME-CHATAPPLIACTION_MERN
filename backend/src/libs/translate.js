import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

export const translateText = async (text, targetLang) => {
  try {
    const prompt = `Translate the following text into ${targetLang}. Do not explain, just return the translated text:\n"${text}"`;

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "z-ai/glm-4.5-air:free",
        messages: [{ role: "user", content: prompt }],
      }),
    });

    const data = await response.json();
    if (data.choices && data.choices[0]?.message?.content) {
      return data.choices[0].message.content.trim();
    } else {
      console.error("OpenRouter translation error:", data);
      return text;
    }
  } catch (error) {
    console.error("OpenRouter translation error:", error.message);
    return text;
  }
};
