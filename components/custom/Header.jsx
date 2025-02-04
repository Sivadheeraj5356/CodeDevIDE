"use client"
import { UserDetailsContext } from '@/context/UserDetailContext'
import { useTheme } from 'next-themes'
import { useContext, useEffect, useState } from 'react'
import { PanelRight } from 'lucide-react'
import { useSidebar } from '@/components/ui/sidebar'
import { ActionContext } from '@/context/ActionContext'
import SignInDialog from './SignInDialog'
import { usePathname } from 'next/navigation'
import { Button } from '../ui/button'
import { LucideDownload } from 'lucide-react'
import { Rocket } from 'lucide-react'
import Image from 'next/image'

const Header = () => {
 const {userDetails,setUserDetails} = useContext(UserDetailsContext)
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

  return (
    <div className="p-4 justify-between flex items-center">
      <div className='flex gap-3 justify-between items-center mt-2 pl-3'>
      <div onClick={toggleSidebar} className='cursor-pointer'> <PanelRight width={28} height={28}/> </div>
      <div className="text-2xl font-semibold">CodeDevAI</div>
      </div>
      {!userDetails?.name ?
            <div className="flex gap-5">
      <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2"
          onClick={()=>setOpenLoginDialog(true)}
     >
          Sign In
        </button>
        <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 shadow h-9 px-4 py-2 text-white bg-blue-500 hover:bg-blue-600">
          Get Started
        </button> 
        </div>:
          path?.includes('workspace')?
          <div className='flex gap-5 items-center justify-end'>
            <Button variant="ghost" onClick={()=>onActionBtn('export')} ><LucideDownload/> Export</Button>
            <Button className="bg-blue-500 text-white hover:bg-blue-600"
            onClick={()=>onActionBtn('export')}>  Open in Editor </Button>
            <Button className="bg-blue-500 text-white hover:bg-blue-600"
            onClick={()=>onActionBtn('deploy')}><Rocket/>  Deploy </Button>
             {userDetails&& <Image src={userDetails?.picture} alt='user' width={30} height={30}
           className='rounded-full w-[30px] cursor-pointer'
           onClick={toggleSidebar}
           />}
          </div>:
          <>
          {userDetails && <Image src={userDetails?.picture} alt='user' width={30} height={30}
            className='rounded-full w-[30px] cursor-pointer'
            onClick={toggleSidebar}
            />}
          </>
          }
           
  
           <SignInDialog openDialog={openLoginDialog}  closeDialog={setOpenLoginDialog} />
      </div>
  )
}

export default Header