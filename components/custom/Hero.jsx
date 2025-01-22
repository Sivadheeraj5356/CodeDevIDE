"use client"
import React, { useState } from 'react'
import { ArrowRight } from 'lucide-react'
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
  const[input , setInput]=useState()
 const suggestions =['Create a todo app', 'create a budget tracker app', 'create a weather app', 'create a chat app', 'create a blog app',  'create a music app', 'create a photo editing app']
 const {messages , setMessages}=useContext(ContextMessages)
 const {userDetails, setUserDetails}=useContext(UserDetailsContext)
 const [openDialog , setOpenDialog] = useState(false)
 const createWorkspace = useMutation(api.workspace.createWorkspace)
 const onGenerate = async(input) => {
    if(!userDetails || !userDetails._id){
      setOpenDialog(true);
      return;
    }
    
    try {
      setMessages({
        role:'user',
        content: input
      });
      
      console.log("Creating workspace with user ID:", userDetails._id); // Debug log
      
      const workspaceId = await createWorkspace({
        user: userDetails._id,
        messages:[{
          role:'user',
          content:input
        }]
      });
      
      console.log('workspaceId', workspaceId);
      if(workspaceId) {
        await router.push(`/workspace/${workspaceId}`);
      }
    } catch (error) {
      console.error("Error in onGenerate:", error);
    }
}
 
 return (
    <div className='flex flex-col mt-36 xl:mt-42 gap-3 items-center'>
      <h2 className='font-bold text-4xl tracking-tight '>What do you what to build ?</h2>
      <p className='text-gray-400 font-medim'>Prompt,run,edit and deploy full-stack web applications</p>
      <div className='p-5 border rounded-xl max-w-xl w-full mt-3 bg-[#151515]'>
      <div className='flex gap-2 '>
         <textarea name="" id=""
         className='outline-none bg-[#151515] w-full h-32 max-h-56 resize-none'
         placeholder={'Enter your prompt for project'}
         onChange={(e)=>setInput(e.target.value)
         }
         ></textarea>
         {input?<ArrowRight onClick={()=>onGenerate(input)} className='bg-blue-500 p-2 h-10 w-10 rounded-md cursor-pointer'></ArrowRight> :" "}
      </div>
      <div>
        <Link className='h-5 w-5'></Link>
      </div>
      </div>
      <div className='flex flex-wrap max-w-2xl justify-center items-center gap-3 mt-7'>
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