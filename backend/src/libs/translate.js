import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

export const translateText = async (text, targetLang) => {
  try {
    // Check API key
    if (!OPENROUTER_API_KEY) {
      console.error("❌ OPENROUTER_API_KEY is missing");
      return text;
    }

    // Validate input
    if (!text || !targetLang) {
      console.error("❌ Missing text or target language");
      return text;
    }

    const prompt = `Translate the following text into ${targetLang}. Do not explain, just return the translated text:
"${text}"`;

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",

        headers: {
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          model: "openai/gpt-4o-mini",

          messages: [
            {
              role: "user",
              content: prompt,
            },
          ],

          // Translation doesn't need a huge response
          max_tokens: 500,

          // Keep translation consistent
          temperature: 0.2,
        }),
      }
    );

    const data = await response.json();

    console.log("🌐 OpenRouter Status:", response.status);

    // Handle HTTP errors
    if (!response.ok) {
      console.error("❌ OpenRouter HTTP Error:", response.status);
      console.error("❌ OpenRouter Response:", data);

      return text;
    }

    // Get translated text
    if (data.choices?.[0]?.message?.content) {
      const translatedText =
        data.choices[0].message.content.trim();

      console.log("✅ Translation successful:", translatedText);

      return translatedText;
    }

    console.error("❌ No translation returned from OpenRouter:", data);

    return text;

  } catch (err) {
    console.error("❌ OPENROUTER ERROR:", err.message);

    return text;
  }
};