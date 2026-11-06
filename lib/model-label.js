// Display label for the generation model shown in the composer. Kept separate
// from configs/AiGeminiModel.js on purpose: that module reads API keys and must
// never be imported by a client component. If GEMINI_MODEL changes on the
// server, update this label to match.
export const MODEL_LABEL = 'Gemini 3.5 Flash'
