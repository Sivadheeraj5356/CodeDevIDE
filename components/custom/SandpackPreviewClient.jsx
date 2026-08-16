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
      const actionType = action?.actionType
      if(actionType !== 'deploy' && actionType !== 'export') return

      // The bundler may not be ready on the first pass; this effect runs again
      // when its status changes, so leave the action pending until then.
      const client = prevRef.current?.getClient()
      if(!client) return

      try{
        const {sandboxId, editorUrl, embedUrl} = await client.getCodeSandboxURL()
        if(!sandboxId){
          console.error('CodeSandbox did not return a sandbox id')
          return
        }

        if(actionType === 'deploy'){
          // Sandpack only hands back an editor and an embed URL. The
          // https://<id>.csb.app host answers 400 with an "are you sure you
          // want to open this preview" interstitial, so the app never renders;
          // the embed in preview mode runs it directly.
          const preview = embedUrl || `https://codesandbox.io/embed/${sandboxId}`
          window.open(`${preview}?view=preview&hidenavigation=1`)
        }else{
          window.open(editorUrl || `https://codesandbox.io/s/${sandboxId}`)
        }
      }catch(err){
        console.error('Could not open the sandbox:', err)
      }finally{
        // Consume the action, otherwise simply switching back to the preview
        // tab remounts this component and opens the tab all over again.
        setAction(null)
      }
    }

    useEffect(()=>{
      GetSandpackClient()
    },[action, sandpack?.status])

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
       ref={prevRef} showRefreshButton={true} showOpenNewtab={true} showRestartButton={true}
       showOpenInCodeSandbox={true} // Add this prop

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
        {isFullscreen ?  <Minimize size={20} /> :"" }
      </button>  
    </div>
)