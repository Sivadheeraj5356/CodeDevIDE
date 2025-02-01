import React, { useEffect, useRef } from 'react'
import { SandpackPreview } from '@codesandbox/sandpack-react';
import { useMemo } from 'react';
import { Minimize } from 'lucide-react';
import { useSandpack } from '@codesandbox/sandpack-react';
import { useContext } from 'react';
import { ActionContext } from '@/context/ActionContext';

const SandpackPreviewClient = ({maximizePreview, setMaximizePreview}) => {
    const {sandpack} = useSandpack()
    const prevRef = useRef()
    const {action , setAction} = useContext(ActionContext)
    const GetSandpackClient =async()=>{
       const client = prevRef.current?.getClient() 
       if(client){
        console.log(client)
          const result = await client.getCodeSandboxURL()
          if(action?.actionType === 'deploy'){
            // window.location.href =`https://codesandbox.io/s/${result?.sandboxId}`
            window.open('https://'+result?.sandboxId+'.csb.app')
       }else if(action?.actionType === 'export'){
        window.open('https://codesandbox.io/s/'+result?.sandboxId)
       }
    }
}

    useEffect(()=>{
      GetSandpackClient()
    },[sandpack&&action])

  const previewStyle = useMemo(() => ({
    height: maximizePreview ? "100vh" : "80vh",
    width: maximizePreview ? "100vw" : "100%", 
    position: maximizePreview ? "fixed" : "relative",
    top: maximizePreview ? "0" : "auto",
    left: maximizePreview ? "0" : "auto",
    zIndex: maximizePreview ? "9999" : "auto",
  }), [maximizePreview]);

  const toggleFullscreen = () => {
   setMaximizePreview(prev=> !prev)
  }
  return (
       <SandpackPreview style={previewStyle} showNavigator={true} 
       ref={prevRef}
                  actionsChildren={
                   <CustomNavigator 
                     onToggleFullscreen={toggleFullscreen}
                     isFullscreen={maximizePreview}
                   />
                 }
                  />
)
}

export default SandpackPreviewClient

const CustomNavigator = ({ onToggleFullscreen, isFullscreen}) => (
    <div className="flex items-center gap-2">
      <button
        onClick={onToggleFullscreen}
        className="fixed top-3 right-5 z-999" 
      >
        {isFullscreen ? <Minimize size={20} /> :"" }
      </button>
      
      
    </div>
)