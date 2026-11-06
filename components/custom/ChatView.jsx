'use client'
import { api } from '@/convex/_generated/api'
import React, { useContext, useEffect, useRef, useState } from 'react'
import { useParams } from 'next/navigation'
import { useConvex, useMutation } from 'convex/react'
import { ContextMessages } from '@/context/ContextMessages'
import { ArrowRight, ListChecks } from 'lucide-react'
import { parsePlanFiles, stripPlanLines } from '@/lib/build-plan'
import { MODEL_LABEL } from '@/lib/model-label'
import Prompt from '@/data/Prompt'
import axios from 'axios'
import { authHeaders } from '@/lib/session'
import { AlertTriangle, Loader2Icon } from 'lucide-react'
import Markdown from 'react-markdown'

const ChatView = () => {
  const {id} = useParams()
  const {messages , setMessages} = useContext(ContextMessages)
  const [input , setInput]= useState('')
  const [loading , setLoading] = useState(false)
  const [chatError , setChatError] = useState(null)
  const updateMessages = useMutation(api.workspace.updateWorkspace)
   const convex = useConvex()
   useEffect(()=>{
     id && getWorkspaceData()
   },[id])


   const getWorkspaceData =async()=>{
    try{
      const result = await convex.query(api.workspace.getWorkspace,{
        workspaceId :id
      })
      setMessages(result?.messages ?? [])
    }catch(err){
      console.error('Failed to load workspace:', err)
      setMessages([])
    }
   }


   const getAiResponse =async()=>{
    setLoading(true)
    setChatError(null)
    const PROMPT =JSON.stringify(messages) + Prompt.CHAT_PROMPT
    try{
      const result = await axios.post('/api/ai-chat',{
        prompt:PROMPT
      }, {
        headers: authHeaders()
      })
      const content = result?.data?.result
      if(!content){
        throw new Error(result?.data?.error || 'Empty response from the AI model')
      }
      const aiResp = {
        role:'ai',
        content
      }
      setMessages(prev=>[...prev,aiResp])
      await updateMessages({
        messages:[...messages,aiResp],
        workspaceId:id
      })
    }catch(err){
      const message = err?.response?.data?.error || err?.message || 'Something went wrong'
      console.error('getAiResponse failed:', message)
      // Kept out of the message list so a failed turn is not saved to the
      // workspace and the retry can resend the same conversation.
      setChatError(message)
    }finally{
      setLoading(false)
    }
   }

   useEffect(()=>{
 if(messages?.length > 0){
  const role = messages[messages?.length-1].role
  if(role == 'user'){
    getAiResponse()
  }
 }
   },[messages])

   const onGenerate =(input)=>{
     setMessages(prev=>[...prev,{
      role:'user',
      content: input
     }])
     setInput('')
   }
   const scrollRef = useRef(null)
   const chatContainerRef = useRef(null)
  useEffect(()=>{
    if(chatContainerRef.current){
     // Scroll only the chat container: scrollIntoView also scrolls the window,
     // which pushed the header off-screen on mobile.
     chatContainerRef.current.scrollTo({ top: chatContainerRef.current.scrollHeight, behavior: 'smooth' })
    }
  },[messages])


  return (
    <div className='relative flex h-full min-h-0 w-full flex-col'>
      {/* Message thread: caption + plain text, no bubble blocks */}
      <div ref={chatContainerRef} className='flex-1 overflow-y-auto scrollbar-hide px-4 py-4'>
      {messages?.length>0&& messages?.map((msg,id)=>{
        const plan = msg?.role === 'ai' ? parsePlanFiles([msg]) : []
        const body = plan.length ? stripPlanLines(msg?.content, plan) : (msg?.content ?? '')
        if (msg?.role === 'user') {
          return (
            <div key={id} className='mb-5 flex justify-end'>
              <div className='max-w-[85%] rounded-lg border border-dashed border-[#3A4240] px-3.5 py-2.5'>
                <Markdown className='flex flex-col text-sm leading-6 text-[#EDE8DC]'>{msg?.content ?? ''}</Markdown>
              </div>
            </div>
          )
        }
        return (
        <div key={id} className='mb-5'>
          {body && <div className='overflow-x-clip'>
            <Markdown className='flex flex-col text-sm leading-6 text-[#EDE8DC]'>{body}</Markdown>
          </div>}
          {plan.length > 0 && (
            <div className='mt-2.5 overflow-hidden rounded-lg border border-[#2A3130] bg-[#171B1C]'>
              <div className='flex items-center gap-2 border-b border-[#2A3130] px-3 py-2 text-[12px] font-medium text-[#A8B3B0]'>
                <ListChecks className='h-3.5 w-3.5 text-[#7FB39D]' />
                Build plan
                <span className='ml-auto rounded-full bg-[#5F8F7B]/20 px-2 py-0.5 text-[10.5px] text-[#7FB39D]'>{plan.length} files</span>
              </div>
              <div className='flex flex-col gap-2 px-3 py-2.5'>
                {plan.map((f) => (
                  <div key={f.path} className='flex items-baseline gap-2 text-[12px]'>
                    <span className='h-1.5 w-1.5 shrink-0 -translate-y-px rounded-full bg-[#7FB39D]' />
                    <span className='shrink-0 font-mono text-[#EDE8DC]'>{f.path.split('/').pop()}</span>
                    {f.path.includes('/') && <span className='shrink-0 font-mono text-[#7C8784]'>{f.path.split('/').slice(0,-1).join('/')}/</span>}
                    {f.note && <span className='leading-5 text-[#A8B3B0]'>{f.note}</span>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )})}
      <div ref={scrollRef}>
      {loading && (
       <div className='mb-5 flex items-center gap-2.5 text-sm text-[#A8B3B0]'>
         <Loader2Icon className='h-4 w-4 animate-spin text-[#7FB39D]' />
         Generating...
       </div>
      )}
      {!loading && chatError && (
        <div className='mb-5 flex items-start gap-3 rounded-lg border border-red-500/40 bg-red-500/10 px-3.5 py-3'>
          <AlertTriangle className='h-5 w-5 shrink-0 text-red-400 mt-0.5' />
          <div className='text-sm'>
            <p className='text-red-200 leading-6'>{chatError}</p>
            <button
              onClick={getAiResponse}
              className='mt-2 text-[#7FB39D] hover:underline'
            >
              Try again
            </button>
          </div>
        </div>
      )}
      </div>
      </div>

      {/* Composer: one round send, no dead controls */}
      <div className='shrink-0 border-t border-[#2A3130] p-3'>
        <div className='rounded-2xl border border-[#2A3130] bg-[#171B1C] transition-colors focus-within:border-[#5F8F7B]/60'>
          <textarea name="" id=""
            value={input}
            rows={2}
            className='max-h-40 w-full resize-none bg-transparent px-3.5 pt-3 text-sm leading-6 outline-none placeholder:text-[#5A6361]'
            placeholder='Describe the change you want...'
            onChange={(e)=>setInput(e.target.value)}
            onKeyDown={(e)=>{ if(e.key==='Enter' && !e.shiftKey){ e.preventDefault(); if(input && !loading) onGenerate(input); } }}
          ></textarea>
          <div className='flex items-center justify-between gap-2 px-3 pb-2.5 pt-1'>
            <span className='inline-flex items-center gap-1.5 rounded-md border border-[#2A3130] bg-[#101314] px-2 py-1 font-mono text-[10.5px] text-[#8A9492]'>
              <span className='h-1.5 w-1.5 rounded-full bg-[#7FB39D]' />
              {MODEL_LABEL}
            </span>
            <span className='hidden text-[11px] text-[#5A6361] sm:inline'>Enter to send</span>
            <div className='flex-1' />
            <button type='button' aria-label='Send message' disabled={!input || loading}
              onClick={()=>{ if(input && !loading) onGenerate(input) }}
              className='flex h-8 w-8 items-center justify-center rounded-full bg-[#5F8F7B] text-[#101314] transition-colors hover:bg-[#527D6C] disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7FB39D]'>
              <ArrowRight className='h-4 w-4' />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ChatView
