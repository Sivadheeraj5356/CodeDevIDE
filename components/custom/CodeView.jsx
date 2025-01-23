"use client"
import React, { useContext, useEffect, useState } from 'react'
import {
  SandpackProvider,
  SandpackLayout,
  SandpackCodeEditor,
  SandpackPreview,
  SandpackFileExplorer
} from "@codesandbox/sandpack-react";
import { ContextMessages } from '@/context/ContextMessages';
import Prompt from '@/data/Prompt';
import axios from 'axios';
import LookUp from '@/data/LookUp';

const CodeView = () => {
  const [activeTab, setActiveTab] = useState('code')
  const {messages , setMessages} = useContext(ContextMessages)
  const [files , setFiles] = useState(LookUp.DEFAULT_FILE);

  const generateAiCode = async()=>{
    const PROMPT = messages[messages?.length-1]?.content +" " + Prompt.CODE_GEN_PROMPT
    const result = await axios.post('/api/gen-ai-code',{
      prompt : PROMPT
    })
    console.log(result.data)
    const AiCodeResponse = result.data
    const mergedFiles = {...LookUp.DEFAULT_FILE, ...AiCodeResponse?.files}
    setFiles(mergedFiles)
  }

  useEffect(()=>{
 if(messages?.length > 0){
  const role = messages[messages?.length -1].role
  if(role == 'user'){
    generateAiCode()
  }
 }
  },[messages])
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
          "postcss":"^8",
          "tailwindcss":"^3.4.1",
          "autoprefixer":"^10.0.0",
          "uuid4":"^2.0.3",
          "tailwind-merge":"^2.4.0",
          "lucide-react":"latest",
          "react-router-dom":"latest",
          "firebase":"^11.1.0",
          "@google/generative-ai":"^0.21.0"
        }
       }}
       options={{externalResources:["https://cdn.tailwindcss.com"]}}
      >
        <SandpackLayout>
          {activeTab === 'code' ? 
          <> <SandpackFileExplorer style={{ height: '80vh' }} />
            <SandpackCodeEditor style={{ height: '80vh' }} />
            </> : 
            <SandpackPreview style={{ height: '80vh' }} showNavigator={true} />}
        </SandpackLayout>
      </SandpackProvider>
    </div>
  )
}

export default CodeView