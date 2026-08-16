import { createChatSession, describeAiError } from "@/configs/AiGeminiModel"
import { NextResponse } from "next/server"

export async function POST(req) {
    try {
        const { prompt } = await req.json()

        if (!prompt) {
            return NextResponse.json({ error: "prompt is required" }, { status: 400 })
        }

        const chatSession = createChatSession()
        const result = await chatSession.sendMessage(prompt)
        const AiResponse = result.response.text()

        return NextResponse.json({ result: AiResponse })
    } catch (error) {
        const { status, message } = describeAiError(error)
        console.error(`[api/ai-chat] ${status}: ${message}`)
        return NextResponse.json({ error: message }, { status })
    }
}
