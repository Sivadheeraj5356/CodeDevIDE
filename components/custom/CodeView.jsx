"use client"
import React, { useContext, useEffect, useRef, useState } from 'react'
import {
  SandpackProvider,
  SandpackLayout,
  SandpackCodeEditor,
  SandpackPreview,
  SandpackFileExplorer,
  SandpackConsole,
  OpenInCodeSandboxButton,
  useSandpack
} from "@codesandbox/sandpack-react";
import { autocompletion, completionKeymap } from "@codemirror/autocomplete";
import { useActiveCode } from '@codesandbox/sandpack-react';
import { useParams } from 'next/navigation';
import { Sandpack } from '@codesandbox/sandpack-react';
import { Maximize } from 'lucide-react';
import { ContextMessages } from '@/context/ContextMessages';
import Prompt from '@/data/Prompt';
import axios from 'axios';
import LookUp from '@/data/LookUp';
import { Loader2Icon } from 'lucide-react';
import { useConvex, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import SandpackPreviewClient from './SandpackPreviewClient';
import { ActionContext } from '@/context/ActionContext';


const CodeView = () => {
  const {id} = useParams()
  const [activeTab, setActiveTab] = useState('code')
  const {messages , setMessages} = useContext(ContextMessages)
  const [files , setFiles] = useState(LookUp.DEFAULT_FILE);
  const [loading, setLoading] = useState(false)
  const [maximizePreview, setMaximizePreview] = useState(false)
  const [hasLoaded, setHasLoaded] = useState(false);
  const [error, setError] = useState(null)
  const [mounted, setMounted] = useState(false)
  const hasSavedFiles = useRef(false)
  const didInitialCheck = useRef(false)
  const isGenerating = useRef(false)
 const {action, setAction} = useContext(ActionContext)

   useEffect(()=>{
    if(action?.actionType === 'export' || action?.actionType === 'deploy'){
      setActiveTab('preview')
    }
   },[action])
  const updateFiles = useMutation(api.workspace.updateFiles)
  const convex = useConvex()
  useEffect(()=>{
    id&& getFiles()
  },[id])

  // Sandpack renders differently on the server than in the browser, so it is
  // only mounted after hydration.
  useEffect(()=>{
    setMounted(true)
  },[])

  const getFiles = async()=>{
    try{
      const result = await convex.query(api.workspace.getWorkspace,{
        workspaceId:id
      })
      hasSavedFiles.current = !!result?.fileData && Object.keys(result.fileData).length > 0
      const mergedFiles = {...LookUp.DEFAULT_FILE, ...result?.fileData}
      setFiles(mergedFiles)
    }catch(err){
      console.error('Failed to load workspace files:', err)
      setError('Could not load this workspace')
    }finally{
      setHasLoaded(true); // Mark initial load as complete
    }
  }

  const generateAiCode = async()=>{
    setLoading(true)
    setError(null)
    setActiveTab('code')
    const PROMPT = JSON.stringify(messages) +" " + Prompt.CODE_GEN_PROMPT
    try{
      const result = await axios.post('/api/gen-ai-code',{
        prompt : PROMPT
      }, {
        headers: {
            'Content-Type': 'application/json'
        }
      })
      const AiCodeResponse = result.data
      const generatedFiles = AiCodeResponse?.files

      if(!generatedFiles || Object.keys(generatedFiles).length === 0){
        throw new Error(AiCodeResponse?.error || 'The AI did not return any files')
      }

      setFiles({...LookUp.DEFAULT_FILE, ...generatedFiles})
      await updateFiles({
        workspaceId:id,
        files:generatedFiles
      })
    }catch(err){
      const message = err?.response?.data?.error || err?.message || 'Something went wrong while generating code'
      console.error('generateAiCode failed:', message)
      setError(message)
    }finally{
      setLoading(false)
    }
  }

  useEffect(()=>{
    if(!hasLoaded || isGenerating.current) return
    if(!(messages?.length > 0)) return
    if(messages[messages.length - 1].role !== 'user') return

    // On the first pass the messages come from the database, so regenerate only
    // when this workspace has no code saved yet. Later passes are new prompts.
    if(!didInitialCheck.current){
      didInitialCheck.current = true
      if(hasSavedFiles.current) return
    }

    isGenerating.current = true
    generateAiCode().finally(()=>{
      isGenerating.current = false
    })
  },[messages, hasLoaded])

  useEffect(()=>{
    if(loading){
      setActiveTab('code')
    }
  },[loading])




  return (
    <div className='min-w-[960px] min-h-[650px]'>
      <div className='bg-[#181818] w-full p-2 border'>
        <div className='flex justify-between items-center mr-5'>
        <div className='flex flex-wrap shrink-0 justify-center items-center bg-black p-1 w-[144px] gap-3 rounded-full'>
          <h2 onClick={() => {
            setActiveTab('code')
          }} className={`text-sm cursor-pointer ${activeTab == 'code' && 'text-blue-500 bg-blue-500 bg-opacity-25 p-1 px-3 rounded-full'} `}>Code</h2>
          <h2 onClick={() => {
            setActiveTab('preview')
          }} className={`text-sm cursor-pointer ${activeTab == 'preview' && 'text-blue-500 bg-blue-500 bg-opacity-25 p-1 px-3 rounded-full'} `}>Preview</h2>
        </div>
        <div>
        { activeTab == 'preview' &&  <Maximize className='cursor-pointer' height={20} width={20} onClick={()=>setMaximizePreview(prev=> !prev)} /> }
          
        </div>
        </div>
       
      </div>
      {error && <div className='bg-red-500/10 border border-red-500/40 text-red-300 text-sm p-3'>
        {error}
      </div>}
      <div className='run'>
      {!mounted ? <div className='h-[80vh] flex items-center justify-center w-full bg-[#151515]'>
        <Loader2Icon className='animate-spin' width={40} height={40} />
      </div> :
      <SandpackProvider files={files} template="react" theme={'dark'}
       customSetup={{
        dependencies:{
         "postcss": "^8",
    "tailwindcss": "^3.4.1",
    autoprefixer: "^10.0.0",
    "uuid4": "^2.0.3",
    "tailwind-merge": "^2.4.0",
    "tailwindcss-animate": "^1.0.7",
    "lucide-react": "^0.469.0",
    "react-router-dom": "^7.1.1",
    "firebase": "^11.1.0",
    "@google/generative-ai": "^0.21.0",
    "date-fns": "^4.1.0",
    "react-chartjs-2": "^5.3.0",
    "chart.js": "^4.4.7",
        }
       }}
       options={{externalResources:["https://cdn.tailwindcss.com"] , autorun : true  , autoReload: true,  readOnly: false,
        showLineNumbers: true,
        showInlineErrors: true, 
        showRunButton : true, 
        showPreview:true
      }}
      >
        <SandpackLayout style={{
    position: maximizePreview ? 'fixed' : 'relative',
    top: maximizePreview ? '40px' : 'auto', 
    height: maximizePreview ? 'calc(100vh - 40px)' : 'auto'
  }}>
          {activeTab === 'code' ? 
          <> {loading? <div className='h-[80vh] flex items-center justify-center w-full'>
            <SandpackFileExplorer style={{ height: '80vh', opacity:'0.5' }} />
            <SandpackCodeEditor  extensions={[autocompletion()]}
        extensionsKeymap={[completionKeymap]} style={{ height: '80vh', opacity:'0.25' }} />

            <Loader2Icon className='animate-spin z-10 absolute' width={60} height={60}></Loader2Icon> 
          </div> :
          <>
          
           <SandpackFileExplorer style={{ height: '80vh' }}  />
           <CustomAceEditor 
        style={{ height: '80vh' }} />
           {/* <SandpackConsole style={{ height: "10vh" }} className='relative w-full h-[10vh] -top-10'/> */}
         
          </> }
        
            </> : 
            <SandpackPreviewClient maximizePreview={maximizePreview} setMaximizePreview={setMaximizePreview}></SandpackPreviewClient>
           }
        
        </SandpackLayout>

      </SandpackProvider>}
      </div>
    </div>
  )
}

export default CodeView



const CustomAceEditor = () => {
  const { code, updateCode } = useActiveCode();
 
  return (
    <SandpackCodeEditor
      defaultValue={code}
      onChange={updateCode}
      extensions={[autocompletion()]}
        extensionsKeymap={[completionKeymap]} showTabs showInlineErrors
        wrapContent closableTabs showLineNumbers showRunButton
      style={{ height: '80vh' }}
    />
  );
};

