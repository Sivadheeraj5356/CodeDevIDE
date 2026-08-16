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

      const workspaceId = await createWorkspace({
        user: userDetails._id,
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
    <div className='flex w-screen flex-col mt-36 xl:mt-42 gap-3 justify-center items-center'>
      <h2 className='font-bold text-4xl tracking-tight '>What do you what to build ?</h2>
      <p className='text-gray-400 font-medim'>Prompt,run,edit and deploy full-stack web applications</p>
      <div className='p-5 border rounded-xl max-w-xl w-full mt-3 bg-[#151515]'>
      <div className='flex gap-2 '>
         <textarea name="" id=""
         disabled={creating}
         className='outline-none bg-[#151515] w-full h-32 max-h-56 resize-none disabled:opacity-50'
         placeholder={'Enter your prompt for project'}
         onChange={(e)=>setInput(e.target.value)
         }
         ></textarea>
         {creating
           ? <Loader2Icon className='bg-blue-500 p-2 h-10 w-10 rounded-md animate-spin shrink-0'></Loader2Icon>
           : input
             ? <ArrowRight onClick={()=>onGenerate(input)} className='bg-blue-500 p-2 h-10 w-10 rounded-md cursor-pointer shrink-0'></ArrowRight>
             : " "}
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
          <div key={index} onClick={()=>
            onGenerate(suggestion)
          } className='p-1 px-4 border rounded-full text-sm text-gray-400 hover:text-white cursor-pointer '>{suggestion}</div>
        ))}
      </div>
      <SignInDialog openDialog={openDialog} closeDialog={(e)=>setOpenDialog(false)}></SignInDialog>
    </div>
  )
}

export default Hero