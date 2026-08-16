import { HelpCircle, LogOut, Settings, Wallet } from 'lucide-react'
import React from 'react'
import { Button } from '../ui/button'
import { useRouter } from 'next/navigation'
import { googleLogout } from '@react-oauth/google';
import { useSidebar } from '@/components/ui/sidebar'
const CustomSidebarFooter = () => {
    const router=useRouter();
    const {toggleSidebar}=useSidebar();
    const options=[
        {
            name:'Settings',
            icon:Settings,
            path:'/settings'
        },
        {
            name:'Help Center',
            icon:HelpCircle,
            path:'/help-center'
        },
        {
            name:'My Subscription',
            icon:Wallet,
            path:'/pricing'
        },
        {
            name:'Sign Out',
            icon:LogOut,
            path:'signOut'
        }
    ]

    const onOptionClick=(option)=>{
        if(option?.path=='signOut')
        {
            googleLogout();
            localStorage.clear();
            router.push('/');
            window.location.reload();
            return ;
        }

        if(!option?.path) return

        toggleSidebar()
        router.push(option.path)
    }
  return (
    <div className='p-2 mb-10'>
        {options.map((option,index)=>(
            <Button variant="ghost" 
            onClick={()=>onOptionClick(option)}
            className="w-full flex justify-start my-3" key={index}>
                <option.icon/>
                {option.name}
            </Button>
        ))}
    </div>
  )
}

export default CustomSidebarFooter