'use client'
import { api } from '@/convex/_generated/api'
import React, { useContext, useEffect, useRef, useState } from 'react'
import { useParams } from 'next/navigation'
import { useConvex, useMutation } from 'convex/react'
import { ContextMessages } from '@/context/ContextMessages'
import { UserDetailsContext } from '@/context/UserDetailContext'
import Image from 'next/image'
import { Link } from 'lucide-react'
import { ArrowRight } from 'lucide-react'
import Prompt from '@/data/Prompt'
import axios from 'axios'
import { AlertTriangle, Loader2Icon } from 'lucide-react'
import Markdown from 'react-markdown'

const ChatView = () => {
  const {id} = useParams()
  const {messages , setMessages} = useContext(ContextMessages)
  const {userDetails,setUserDetails} =useContext(UserDetailsContext)
  const [input , setInput]= useState('')
  const [loading , setLoading] = useState(false)
  const [pageLoading , setPageLoading] = useState(false)
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
  useEffect(()=>{
    if(scrollRef.current){
     scrollRef.current?.scrollIntoView({ behavior : 'smooth'})
    }
  },[messages])

 
  return (
    <div className=' relative flex flex-col h-[85vh]'>
      <div className='flex-1 overflow-y-auto scrollbar-hide'>
      {messages?.length>0&& messages?.map((msg,id)=>(
        <div  key={id} className='p-3 px-5 rounded-lg mb-2 bg-[#262626] max-w-[470px] min-w-[470px] overflow-x-clip flex gap-2 items-start leading-7'>
          {msg?.role === 'user' && userDetails?.picture && <Image src={userDetails.picture} alt='user-image' width={30} height={30} className='rounded-full'></Image>}
           <div><Markdown className='flex flex-col'>{msg?.content ?? ''}</Markdown></div>
        </div>
      ))}
      <div ref={scrollRef}>
      {loading && <>
       <div className='p-3 rounded-lg mb-2 bg-[#262626] flex gap-2 items-start'>
         <div> <Loader2Icon className='animate-spin'></Loader2Icon>  </div>
         <div>Generating from AI ....</div>
       </div>
      </>}
      {!loading && chatError && (
        <div className='p-3 px-4 rounded-lg mb-2 border border-red-500/40 bg-red-500/10 max-w-[470px] flex gap-3 items-start'>
          <AlertTriangle className='h-5 w-5 shrink-0 text-red-400 mt-0.5' />
          <div className='text-sm'>
            <p className='text-red-200 leading-6'>{chatError}</p>
            <button
              onClick={getAiResponse}
              className='mt-2 text-blue-400 hover:underline'
            >
              Try again
            </button>
          </div>
        </div>
      )}
      </div>
      </div>


      <div className='p-5 border rounded-xl max-w-xl w-full mt-3 bg-[#151515]'>
      <div className='flex gap-2 '>
         <textarea name="" id=""
         value={input}
         className='outline-none bg-[#151515] w-full h-32 max-h-56 resize-none'
         placeholder={'Enter your prompt for project'}
         onChange={(e)=>setInput(e.target.value)
         }
         ></textarea>
         {input?<ArrowRight onClick={()=>{onGenerate(input)
           }} className='bg-blue-500 p-2 h-10 w-10 rounded-md cursor-pointer'></ArrowRight> :" "}
      </div>
      <div>
        <Link className='h-5 w-5'></Link>
      </div>
      </div>
    </div>
  )
}

export default ChatView