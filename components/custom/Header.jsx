"use client"
import { UserDetailsContext } from '@/context/UserDetailContext'
import { ContextMessages } from '@/context/ContextMessages'
import { useContext, useState } from 'react'
import { PanelRight } from 'lucide-react'
import { useSidebar } from '@/components/ui/sidebar'
import { ActionContext } from '@/context/ActionContext'
import SignInDialog from './SignInDialog'
import { usePathname } from 'next/navigation'
import { Button } from '../ui/button'
import { ExternalLink } from 'lucide-react'
import Image from 'next/image'

// Project label from the first user message - real data, not decoration.
const projectName = (messages) => {
  const first = messages?.find?.((m) => m?.role === 'user')?.content ?? ''
  const clean = first.replace(/\s+/g, ' ').trim()
  if (!clean) return null
  const words = clean.split(' ').slice(0, 6).join(' ')
  return clean.split(' ').length > 6 ? words + '...' : words
}

const Header = () => {
 const {userDetails,setUserDetails} = useContext(UserDetailsContext)
 const {messages} = useContext(ContextMessages)
 const {toggleSidebar} = useSidebar()
 const [openLoginDialog,setOpenLoginDialog]=useState(false);
 const {action , setAction} = useContext(ActionContext)
 const path = usePathname()
 const onActionBtn = (action) => {
  setAction({
    actionType:action,
    timeStamp:Date.now()
  })
 }

 const inWorkspace = !!path?.includes('workspace') && !!userDetails?.name
 const name = projectName(messages)

  // Authenticated workspace: project bar, not landing chrome.
  if (inWorkspace) {
    return (
      <div className="flex h-[52px] w-full items-center justify-between gap-3 border-b border-[#2A3130] px-3 sm:px-4">
        <div className='flex min-w-0 items-center gap-2.5'>
          <div onClick={toggleSidebar} className='cursor-pointer shrink-0 text-[#8A9492] hover:text-[#EDE8DC] transition-colors'>
            <PanelRight width={20} height={20}/>
          </div>
          <div className="text-[15px] font-semibold tracking-tight shrink-0">CodeDevAI</div>
          {name && <>
            <div className='h-4 w-px bg-[#2A3130] shrink-0' />
            <div className='truncate text-[13px] text-[#8A9492]' title={name}>{name}</div>
          </>}
        </div>


        <div className='flex shrink-0 items-center gap-2'>
          <span className='hidden lg:block text-[11px] text-[#8A9492]'>uploads sandbox source</span>
          <Button
            variant="ghost"
            className='h-8 px-2 text-[13px] text-[#8A9492] hover:text-[#EDE8DC] sm:px-3'
            onClick={()=>onActionBtn('export')}
            title="Uploads this sandbox's source code to CodeSandbox and opens it in a new tab"
            aria-label="Open in CodeSandbox (uploads this sandbox's source code to CodeSandbox)"
          >
            <ExternalLink className='h-4 w-4'/> <span className='hidden sm:inline'>Open in CodeSandbox</span>
          </Button>
          {userDetails?.picture ? (
            <Image src={userDetails.picture} alt='user' width={28} height={28}
              className='ml-1 w-[28px] cursor-pointer rounded-full' onClick={toggleSidebar} />
          ) : (
            <div className='ml-1 flex h-[28px] w-[28px] cursor-pointer items-center justify-center rounded-full bg-[#5F8F7B]/25 text-[11px] font-semibold text-[#7FB39D]'
              onClick={toggleSidebar} title={userDetails?.name ?? 'Account'}>
              {(userDetails?.name ?? '?').trim().charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        <SignInDialog openDialog={openLoginDialog} closeDialog={setOpenLoginDialog} />
      </div>
    )
  }

  return (
    <div className="w-full p-4 flex items-center justify-between gap-4">
      <div className='flex gap-2 sm:gap-3 items-center mt-2 shrink-0'>
      <div onClick={toggleSidebar} className='cursor-pointer'> <PanelRight width={28} height={28}/> </div>
      <div className="text-xl sm:text-2xl font-semibold">CodeDevAI</div>
      </div>
      {!userDetails?.name ?
            <div className="flex gap-2 sm:gap-5">
      <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:bg-accent hover:text-accent-foreground h-9 px-3 sm:px-4 py-2"
          onClick={()=>setOpenLoginDialog(true)}
     >
          Sign In
        </button>
        <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 shadow h-9 px-3 sm:px-4 py-2 text-white bg-[#5F8F7B] hover:bg-[#527D6C] whitespace-nowrap">
          Get Started
        </button>
        </div>:
          <div className='flex items-center justify-end shrink-0'>
          {userDetails && <Image src={userDetails?.picture} alt='user' width={30} height={30}
           className='rounded-full w-[30px] cursor-pointer'
           onClick={toggleSidebar}
           />}
          </div>
          }


           <SignInDialog openDialog={openLoginDialog}  closeDialog={setOpenLoginDialog} />
      </div>
  )
}

export default Header
