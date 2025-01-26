"use client"
import React, { useContext, useEffect, useState } from 'react'
import {
  SandpackProvider,
  SandpackLayout,
  SandpackCodeEditor,
  SandpackPreview,
  SandpackFileExplorer,
  SandpackConsole,
  UnstyledOpenInCodeSandboxButton
} from "@codesandbox/sandpack-react";
import { autocompletion, completionKeymap } from "@codemirror/autocomplete";
import { useParams } from 'next/navigation';
import { Sandpack } from "@codesandbox/sandpack-react";

import { ContextMessages } from '@/context/ContextMessages';
import Prompt from '@/data/Prompt';
import axios from 'axios';
import LookUp from '@/data/LookUp';
import { Loader2Icon } from 'lucide-react';
import { useConvex, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
const CodeView = () => {
  const {id} = useParams()
  const [activeTab, setActiveTab] = useState('code')
  const {messages , setMessages} = useContext(ContextMessages)
  const [files , setFiles] = useState(LookUp.DEFAULT_FILE);
  const [loading, setLoading] = useState(false)
  const updateFiles = useMutation(api.workspace.updateFiles)
  const convex = useConvex()
  useEffect(()=>{
    id&& getFiles()
  },[id])

  const getFiles = async()=>{
    const result = await convex.query(api.workspace.getWorkspace,{
      workspaceId:id
    })
    const mergedFiles = {...LookUp.DEFAULT_FILE, ...result?.fileData}
    setFiles(mergedFiles)
  }
  const generateAiCode = async()=>{
    setLoading(true)
    setActiveTab('code')
    const PROMPT = JSON.stringify(messages) +" " + Prompt.CODE_GEN_PROMPT
    const result = await axios.post('/api/gen-ai-code',{
      prompt : PROMPT
    }, {
      headers: {
          'Content-Type': 'application/json'
      }
  })
    console.log(result.data)
    const AiCodeResponse = result.data
    const mergedFiles = {...LookUp.DEFAULT_FILE, ...AiCodeResponse?.files}
    setFiles(mergedFiles)
    await updateFiles({
      workspaceId:id,
      files:AiCodeResponse?.files
    })
    setLoading(false)
  }

  useEffect(()=>{
 if(messages?.length > 0){
  const role = messages[messages?.length -1].role
  if(role == 'user'){
    generateAiCode()
  }
 }
  },[messages])

  useEffect(()=>{
    if(loading){
      setActiveTab('code')
    }
  },[loading])

  return (
    <div>
      <div className='bg-[#181818] w-full p-2 border'>
        <div className='flex flex-wrap shrink-0 justify-center items-center bg-black p-1 w-[144px] gap-3 rounded-full'>
          <h2 onClick={() => {
            setActiveTab('code')
          }} className={`text-sm cursor-pointer ${activeTab == 'code' && 'text-blue-500 bg-blue-500 bg-opacity-25 p-1 px-3 rounded-full'} `}>Code</h2>
          <h2 onClick={() => {
            setActiveTab('preview')
          }} className={`text-sm cursor-pointer ${activeTab == 'preview' && 'text-blue-500 bg-blue-500 bg-opacity-25 p-1 px-3 rounded-full'} `}>Preview</h2>
        </div>
      </div>
      <SandpackProvider files={files} template="react" theme={'dark'}
       customSetup={{
        dependencies:{
          "next": "^14.0.3",
          "react": "^17.0.2",
          "postcss":"^8",
          "tailwindcss":"^3.4.1",
          "autoprefixer":"^10.0.0",
          "uuid4":"^2.0.3",
          "tailwind-merge":"^2.4.0",
          "lucide-react":"latest",
          "react-router-dom":"latest",
          "firebase":"^11.1.0",
          "@google/generative-ai":"^0.21.0",
          "@shadcn/ui": "latest", // Add ShadCN here
          "clsx": "latest", // Utility for conditional classNames, often used with ShadCN
          "react-icons": "latest",
          "react-chartjs-2": "latest",
          "chart.js": "latest" ,
          "@radix-ui/react-dialog": "latest",
          "@radix-ui/react-tooltip": "latest",
          "@radix-ui/react-tabs": "latest"
        },
          "scripts": {
            "dev": "next dev",
            "build": "next build",
            "start": "next start",
            "lint": "next lint"
          }
        
        
       }}
       options={{externalResources:["https://cdn.tailwindcss.com"] }}
      >
        <SandpackLayout>
          {activeTab === 'code' ? 
          <> {loading? <div className='h-[80vh] flex items-center justify-center w-full'>
            <SandpackFileExplorer style={{ height: '80vh', opacity:'0.5' }} />
            <SandpackCodeEditor  extensions={[autocompletion()]}
        extensionsKeymap={[completionKeymap]} style={{ height: '80vh', opacity:'0.25' }} />

            <Loader2Icon className='animate-spin z-10 absolute' width={60} height={60}></Loader2Icon> 
          </div> :
          <>
          
           <SandpackFileExplorer style={{ height: '80vh' }}  />
           <SandpackCodeEditor style={{ height: '80vh' }} />
           {/* <SandpackConsole style={{ height: "10vh" }} className='relative w-full h-[10vh] -top-10'/> */}

          </> }
            </> : 
            
           <SandpackPreview style={{ height: '80vh' }} showNavigator={true} />}
        
        </SandpackLayout>

      </SandpackProvider>
       
    </div>
  )
}

export default CodeView