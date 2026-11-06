"use client"
import React, { useState } from 'react'
import { ArrowRight, Loader2Icon } from 'lucide-react'
import { Link } from 'lucide-react'
import { useContext } from 'react'
import SignInDialog from './SignInDialog'
import { ContextMessages } from '@/context/ContextMessages'
import { UserDetailsContext } from '@/context/UserDetailContext'
import { useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { useRouter } from 'next/navigation'
const Hero = () => {
  const router = useRouter()
  const[input , setInput]=useState('')
 const suggestions =['Create a todo app', 'create a budget tracker app', 'create a weather app', 'create a chat app', 'create a blog app',  'create a music app', 'create a photo editing app']
 const {messages , setMessages}=useContext(ContextMessages)
 const {userDetails, setUserDetails}=useContext(UserDetailsContext)
 const [openDialog , setOpenDialog] = useState(false)
 const [creating , setCreating] = useState(false)
 const [error , setError] = useState(null)
 const createWorkspace = useMutation(api.workspace.createWorkspace)
 const onGenerate = async(input) => {
    if(!input?.trim() || creating) return

    if(!userDetails || !userDetails._id){
      setOpenDialog(true);
      return;
    }

    // Creating the workspace and routing to it takes a moment, so the button
    // has to show it is working before anything on screen changes.
    setCreating(true)
    setError(null)

    try {
      setMessages([{
        role:'user',
        content: input
      }]);

      // The backend attaches the workspace to the verified signed-in
      // identity; the client never sends a user id.
      const workspaceId = await createWorkspace({
        messages:[{
          role:'user',
          content:input
        }]
      });

      if(!workspaceId){
        throw new Error('The workspace could not be created')
      }

      // Left spinning on purpose: the route change is what ends this state.
      router.push(`/workspace/${workspaceId}`);
    } catch (err) {
      console.error("Error in onGenerate:", err);
      setError('Could not start your project. Please try again.')
      setCreating(false)
    }
}
 
 return (
    <div className='flex w-full flex-col mt-20 sm:mt-36 xl:mt-42 gap-3 justify-center items-center px-4 sm:px-0'>
      <h2 className='font-bold text-3xl sm:text-4xl tracking-tight text-center '>What do you want to build?</h2>
      <p className='text-gray-400 font-medium'>Prompt, run, edit, and deploy full-stack web applications</p>
      <div className='p-5 border border-[#2A3130] rounded-2xl max-w-xl w-full mt-3 bg-[#171B1C]'>
      <div className='flex gap-2 '>
         <textarea name="" id=""
         disabled={creating}
         className='outline-none bg-transparent w-full h-32 max-h-56 resize-none disabled:opacity-50'
         placeholder={'Enter your prompt for project'}
         onChange={(e)=>setInput(e.target.value)
         }
         onKeyDown={(e)=>{ if(e.key==='Enter' && !e.shiftKey){ e.preventDefault(); if(input && !creating) onGenerate(input); } }}
         ></textarea>
         {creating
           ? <Loader2Icon className='bg-[#5F8F7B] p-2 h-10 w-10 rounded-md animate-spin shrink-0'></Loader2Icon>
           : <button type='button' aria-label='Generate project' disabled={!input}
               onClick={()=>input && onGenerate(input)}
               className='bg-[#5F8F7B] hover:bg-[#527D6C] disabled:opacity-40 disabled:cursor-not-allowed p-2 h-10 w-10 rounded-md cursor-pointer shrink-0 flex items-center justify-center text-[#101314] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7FB39D] transition-colors'>
               <ArrowRight className='h-6 w-6'></ArrowRight>
             </button>}
      </div>
      <div>
        <Link className='h-5 w-5'></Link>
      </div>
      </div>
      {creating && <p className='text-sm text-gray-400 flex items-center gap-2 mt-1'>
        <Loader2Icon className='h-4 w-4 animate-spin' /> Setting up your project...
      </p>}
      {error && <p className='text-sm text-red-400 mt-1'>{error}</p>}
      <div className={`flex flex-wrap max-w-2xl justify-center items-center gap-3 mt-7 ${creating ? 'opacity-50 pointer-events-none' : ''}`}>
        {suggestions.map((suggestion , index)=>(
          <button type='button' key={index} onClick={()=>
            onGenerate(suggestion)
          } className='px-4 py-1.5 border border-[#2A3130] rounded-full text-sm text-[#9BA29B] hover:text-[#EDE8DC] hover:border-[#5F8F7B] cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7FB39D]'>{suggestion}</button>
        ))}
      </div>
      <SignInDialog openDialog={openDialog} closeDialog={(e)=>setOpenDialog(false)}></SignInDialog>
    </div>
  )
}

export default Hero
