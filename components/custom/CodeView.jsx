"use client"
import React, { useContext, useEffect, useMemo, useRef, useState } from 'react'
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
import { Maximize, FolderTree, TerminalSquare, ChevronDown, Code2, MonitorPlay, PanelLeft } from 'lucide-react';
import { parsePlanFiles } from '@/lib/build-plan';
import { ContextMessages } from '@/context/ContextMessages';
import Prompt from '@/data/Prompt';
import axios from 'axios'
import { authHeaders } from '@/lib/session';
import LookUp from '@/data/LookUp';
import { AlertTriangle, Loader2Icon } from 'lucide-react';
import { useConvex, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import SandpackPreviewClient from './SandpackPreviewClient';
import { ActionContext } from '@/context/ActionContext';
import { mergeFiles } from "@/lib/files";


const CodeView = ({ activeTab, setActiveTab }) => {
  const {id} = useParams()
  const {messages , setMessages} = useContext(ContextMessages)
  const [files , setFiles] = useState(LookUp.DEFAULT_FILE);
  const [loading, setLoading] = useState(false)
  const [maximizePreview, setMaximizePreview] = useState(false)
  const [showFiles, setShowFiles] = useState(true)
  const [hasLoaded, setHasLoaded] = useState(false);
  const [error, setError] = useState(null)
  const [mounted, setMounted] = useState(false)
  const hasSavedFiles = useRef(false)
  const didInitialCheck = useRef(false)
  const isGenerating = useRef(false)
 const {action, setAction} = useContext(ActionContext)
 const plannedCount = useMemo(()=>parsePlanFiles(messages).length,[messages])

   useEffect(()=>{
    if(action?.actionType === 'export'){
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
      const mergedFiles = mergeFiles(LookUp.DEFAULT_FILE, result?.fileData)
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
            'Content-Type': 'application/json',
            ...authHeaders()
        }
      })
      const AiCodeResponse = result.data
      const generatedFiles = AiCodeResponse?.files

      if(!generatedFiles || Object.keys(generatedFiles).length === 0){
        throw new Error(AiCodeResponse?.error || 'The AI did not return any files')
      }

      setFiles(mergeFiles(LookUp.DEFAULT_FILE, generatedFiles))
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
    <div className='relative flex h-full min-h-0 min-w-0 flex-col'>
      {error && <div className='bg-red-500/10 border border-red-500/40 text-sm p-3 flex gap-3 items-start'>
        <AlertTriangle className='h-5 w-5 shrink-0 text-red-400 mt-0.5' />
        <div>
          <p className='text-red-200 leading-6'>{error}</p>
          <button onClick={generateAiCode} className='mt-1 text-[#7FB39D] hover:underline'>
            Try again
          </button>
        </div>
      </div>}
      <div className='run h-full min-h-0 flex-1'>
      {!mounted ? <div className='flex h-full w-full items-center justify-center bg-[#151515]'>
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
        <PaneToolbar activeTab={activeTab} setActiveTab={setActiveTab}
          showFiles={showFiles} setShowFiles={setShowFiles} />
        <SandpackLayout style={{
    position: maximizePreview ? 'fixed' : 'relative',
    top: maximizePreview ? '40px' : 'auto',
    height: maximizePreview ? 'calc(100vh - 40px)' : '100%'
  }}>
          {activeTab === 'code' ?
          <> {loading? <div className='flex h-full w-full items-center justify-center'>
            <SandpackFileExplorer style={{ height: '100%', opacity:'0.5' }} />
            <SandpackCodeEditor  extensions={[autocompletion()]}
        extensionsKeymap={[completionKeymap]} style={{ height: '100%', opacity:'0.25' }} />

            <Loader2Icon className='animate-spin z-10 absolute' width={60} height={60}></Loader2Icon>
          </div> :
          <>
           {/* Explorer drawer (desktop only, toggle from the pane toolbar);
               the approved mobile code view keeps the editor directly visible. */}
           {showFiles && <div className='hidden md:flex md:w-52 shrink-0 flex-col border-r border-[#2A3130]'>
             <div className='flex h-9 shrink-0 items-center gap-1.5 border-b border-[#2A3130] bg-[#171B1C] px-3 text-[11px] font-medium uppercase tracking-wide text-[#8A9492]'>
               <FolderTree className='h-3.5 w-3.5' />
               Files
             </div>
             <SandpackFileExplorer style={{ height: '100%', flex: 1, minHeight: 0 }} />
           </div>}
           <div className='flex h-full min-h-0 min-w-0 flex-1 flex-col'>
             <CustomAceEditor style={{ height: '100%', flex: 1 }} />
             <ActivityDock loading={loading} plannedCount={plannedCount} />
             <IDEStatusBar />
           </div>

          </> }

            </> :
            <div className='relative h-full w-full'>
              <SandpackPreviewClient maximizePreview={maximizePreview} setMaximizePreview={setMaximizePreview}></SandpackPreviewClient>
              <button type='button' aria-label='Toggle full width preview' onClick={() => setMaximizePreview(prev => !prev)}
                className='absolute right-2 top-2 z-10 hidden rounded-md border border-[#2A3130] bg-[#101314]/90 p-1.5 text-[#8A9492] transition-colors hover:text-[#EDE8DC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7FB39D] md:block'>
                <Maximize className='h-4 w-4' />
              </button>
            </div>
           }

        </SandpackLayout>

      </SandpackProvider>}
      </div>
    </div>
  )
}

export default CodeView

// Pane toolbar (desktop only): file-drawer toggle plus the Code/Preview
// switch, Bolt-style, inside the workbench instead of the top bar.
const PaneToolbar = ({ activeTab, setActiveTab, showFiles, setShowFiles }) => {
  const seg = (active) =>
    `flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[12px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7FB39D] ${
      active ? 'bg-[#5F8F7B]/25 text-[#7FB39D]' : 'text-[#9AA4A1] hover:text-[#EDE8DC]'
    }`
  return (
    <div className='hidden md:flex h-9 shrink-0 items-center gap-2 border-b border-[#2A3130] bg-[#171B1C] px-2'>
      <button type='button' aria-pressed={showFiles} aria-label='Toggle file drawer'
        onClick={() => setShowFiles(v => !v)}
        className={`flex h-7 w-7 items-center justify-center rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7FB39D] ${showFiles ? 'bg-[#5F8F7B]/25 text-[#7FB39D]' : 'text-[#9AA4A1] hover:text-[#EDE8DC]'}`}>
        <PanelLeft className='h-4 w-4' />
      </button>
      <div className='h-4 w-px bg-[#2A3130]' />
      <div className='flex items-center gap-0.5 rounded-lg border border-[#2A3130] bg-[#101314] p-0.5' role='tablist' aria-label='Workspace view'>
        <button type='button' role='tab' aria-selected={activeTab === 'code'} onClick={() => setActiveTab('code')} className={seg(activeTab === 'code')}>
          <Code2 className='h-3.5 w-3.5' />
          Code
        </button>
        <button type='button' role='tab' aria-selected={activeTab === 'preview'} onClick={() => setActiveTab('preview')} className={seg(activeTab === 'preview')}>
          <MonitorPlay className='h-3.5 w-3.5' />
          Preview
        </button>
      </div>
    </div>
  );
};

// Activity dock (desktop only, collapsible): real state transitions only -
// workspace load, plan size, generation in flight, sandbox file count and
// bundler status from useSandpack. No synthetic entries.
const ActivityDock = ({ loading, plannedCount }) => {
  const { sandpack } = useSandpack();
  const [open, setOpen] = useState(true);
  const fileCount = Object.keys(sandpack?.files ?? {}).length;
  const status = sandpack?.status;
  const bundler = status === 'running' ? { tone: 'run', text: 'Bundler running...' }
    : status === 'done' ? { tone: 'ok', text: 'Preview bundle ready' }
    : status === 'timeout' ? { tone: 'err', text: 'Bundler timed out' }
    : { tone: 'ok', text: 'Bundler idle' };
  const rows = [
    { tone: 'ok', text: 'Workspace loaded' },
    ...(plannedCount ? [{ tone: 'ok', text: `Build plan received - ${plannedCount} files planned` }] : []),
    loading ? { tone: 'run', text: 'Generating files with Gemini...' }
            : { tone: 'ok', text: `${fileCount} files in sandbox` },
    bundler,
  ];
  return (
    <div className='hidden md:flex shrink-0 flex-col border-t border-[#2A3130] bg-[#101314]'>
      <button type='button' onClick={()=>setOpen(o=>!o)} aria-expanded={open}
        className='flex h-8 shrink-0 items-center gap-2 px-3 text-[11px] font-medium uppercase tracking-wide text-[#8A9492] transition-colors hover:text-[#EDE8DC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7FB39D]'>
        <TerminalSquare className='h-3.5 w-3.5 text-[#7FB39D]' />
        Activity
        <ChevronDown className={`ml-auto h-3.5 w-3.5 transition-transform ${open ? '' : 'rotate-180'}`} />
      </button>
      {open && (
        <div className='flex h-28 flex-col gap-1 overflow-y-auto px-3 pb-2.5 font-mono text-[11.5px] leading-5'>
          {rows.map((r, i) => (
            <div key={i} className='flex items-center gap-2'>
              <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${r.tone === 'ok' ? 'bg-[#7FB39D]' : r.tone === 'run' ? 'bg-[#E8C468] animate-pulse' : 'bg-red-400'}`} />
              <span className='text-[#A8B0AE]'>{r.text}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Bottom status strip for the desktop IDE: the real active file, nothing else.
const IDEStatusBar = () => {
  const { sandpack } = useSandpack();
  return (
    <div className='hidden md:flex h-8 shrink-0 items-center border-t border-[#2A3130] bg-[#171B1C] px-3 text-[11px] text-[#8A9492]'>
      <span className='font-mono'>{sandpack?.activeFile}</span>
    </div>
  );
};

const CustomAceEditor = () => {
  const { code, updateCode } = useActiveCode();

  return (
    <SandpackCodeEditor
      defaultValue={code}
      onChange={updateCode}
      extensions={[autocompletion()]}
        extensionsKeymap={[completionKeymap]} showTabs showInlineErrors
        wrapContent closableTabs showLineNumbers showRunButton
      style={{ height: '100%' }}
    />
  );
};
