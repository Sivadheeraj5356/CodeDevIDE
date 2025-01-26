"use client"
import { UserDetailsContext } from '@/context/UserDetailContext'
import { useTheme } from 'next-themes'
import { useContext, useEffect, useState } from 'react'
import { PanelRight } from 'lucide-react'
import { useSidebar } from '@/components/ui/sidebar'
const Header = () => {
 const {userDetails,setUserDetails} = useContext(UserDetailsContext)
 const {toggleSidebar} = useSidebar()

  return (
    <div className="p-4 justify-between flex items-center">
      <div className='flex gap-5 justify-between items-center mt-2'>
      <div onClick={toggleSidebar} className='cursor-pointer'> <PanelRight /> </div>
      <div className="text-2xl">CodeDevAI</div>
      </div>
      <div className="flex gap-5">
      {!userDetails?.name && 
      <>
      <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2">
          Sign In
        </button>
        <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 shadow h-9 px-4 py-2 text-white bg-blue-500 hover:bg-blue-600">
          Get Started
        </button> 
        </>}  
        
      </div>
    </div>
  )
}

export default Header