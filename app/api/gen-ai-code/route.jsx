import { GenAiCode } from "@/configs/AiGeminiModel"
import { NextResponse } from "next/server"

export async function POST(req){
    const {prompt} = await req.json()
    try{
     const result = await GenAiCode.sendMessage(prompt)
     const response = await result.response.text()

     return NextResponse.json(JSON.parse(response))
    }catch(e){
        return NextResponse.json({error: e.message})
    }

}