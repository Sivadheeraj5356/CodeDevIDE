import { createCodeSession } from "@/configs/AiGeminiModel"
import { NextResponse } from "next/server"

// The model is asked for raw JSON, but it sometimes wraps it in a markdown
// fence or adds prose around it, which would break JSON.parse.
function parseJsonResponse(text) {
    const cleaned = text.trim().replace(/^```(?:json)?/i, "").replace(/```$/, "").trim()
    try {
        return JSON.parse(cleaned)
    } catch {
        const start = cleaned.indexOf("{")
        const end = cleaned.lastIndexOf("}")
        if (start === -1 || end <= start) return null
        try {
            return JSON.parse(cleaned.slice(start, end + 1))
        } catch {
            return null
        }
    }
}

export async function POST(req) {
    try {
        const { prompt } = await req.json()

        if (!prompt) {
            return NextResponse.json({ error: "prompt is required" }, { status: 400 })
        }

        const codeSession = createCodeSession()
        const result = await codeSession.sendMessage(prompt)
        const finishReason = result.response.candidates?.[0]?.finishReason
        const response = result.response.text()
        const parsed = parseJsonResponse(response)
        const hasFiles = parsed?.files && typeof parsed.files === "object" && !Array.isArray(parsed.files)

        if (!hasFiles) {
            console.error(
                `[api/gen-ai-code] unusable response (finishReason=${finishReason}, chars=${response?.length}):`,
                response?.slice(0, 500)
            )
            return NextResponse.json(
                {
                    error: finishReason === "MAX_TOKENS"
                        ? "The project was too large and the AI response got cut off. Try a smaller or simpler request."
                        : "The AI response was not valid project JSON. Please try again."
                },
                { status: 502 }
            )
        }

        return NextResponse.json(parsed)
    } catch (e) {
        console.error("[api/gen-ai-code]", e)
        return NextResponse.json(
            { error: e?.message || "Failed to generate code" },
            { status: 500 }
        )
    }
}
