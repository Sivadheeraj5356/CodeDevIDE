import React from 'react'
import ChatView from '@/components/custom/ChatView'
import CodeView from '@/components/custom/CodeView'
import { useSidebar } from '@/components/ui/sidebar'
const Workspace = () => {
  return (
    <div className='px-7 mt-2 max-h-screen'>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
          <div className='flex gap-5'>
            <ChatView />
          </div>
            <div className='col-span-2'>
            <CodeView />
            </div>
        </div>
    </div>
  )
}

export default Workspace