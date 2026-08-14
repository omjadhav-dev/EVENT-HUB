import { apiError } from "./apiError.js";

// "gemini-flash-latest" is a Google-maintained alias that always points
// to their current flash model, rather than a specific pinned version -
// pinned model IDs (like gemini-2.5-flash) get retired periodically and
// start returning 404s for new API keys once that happens.
const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent";

// Free alternative to utils/anthropic.js - uses Google AI Studio's free
// tier (no credit card required). Get a key at
// https://aistudio.google.com/apikey and set GEMINI_API_KEY in
// backend/.env.
export async function generateText({ system, prompt, maxTokens = 400 }) {
  if (!process.env.GEMINI_API_KEY) {
    throw new apiError(
      500,
      "AI generation isn't configured on the server (missing GEMINI_API_KEY).",
    );
  }

  const response = await fetch(GEMINI_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": process.env.GEMINI_API_KEY,
    },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      systemInstruction: { parts: [{ text: system }] },
      generationConfig: {
        maxOutputTokens: maxTokens,
        temperature: 0.7,
      },
    }),
  });

  if (!response.ok) {
    const errBody = await response.json().catch(() => null);
    console.error("Gemini API error:", response.status, errBody);
    throw new apiError(502, "AI generation failed - please try again.");
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts
    ?.map((part) => part.text)
    .join("\n")
    .trim();

  if (!text) {
    throw new apiError(502, "AI generation returned an empty response.");
  }

  return text;
}
