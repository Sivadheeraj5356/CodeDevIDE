import { chatSession } from "@/configs/AiGeminiModel"
import { NextResponse } from "next/server"

export async function POST(req) {
    const {prompt} = await req.json()

    try{
        const result = await chatSession.sendMessage(prompt)
        const AiResponse = await result.response.text()

        return NextResponse.json({result:AiResponse})
    }catch(error){

    }
}