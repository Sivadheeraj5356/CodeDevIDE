import React from 'react'
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarHeader,
} from "@/components/ui/sidebar"
import { MessageCircleCode } from 'lucide-react'
import { Button } from '../ui/button'
import CustomSidebarFooter from './CustomSidebarFooter'
import WorkSpaceHistory from './WorkSpaceHistory'
import { useRouter } from 'next/navigation'
import { useSidebar } from '@/components/ui/sidebar'
import { PanelRight } from 'lucide-react'

const AppSidebar = () => {
    const router = useRouter()
    const {toggleSidebar} = useSidebar()
    return (
        <Sidebar>
            <SidebarHeader className='p-4'>
                <div className='flex justify-center items-center gap-3 py-4 text-2xl font-semibold '>
                    <div onClick={toggleSidebar} className='cursor-pointer'> <PanelRight width={28} height={28} /> </div>
                    <div>
                   CodeDevIDE
                    </div>
                </div>
                <Button onClick={()=>router.push('/')}> <MessageCircleCode></MessageCircleCode> Create a New Chat </Button>
            </SidebarHeader>
            <SidebarContent className='p-4 scrollbar-hide'>
               <SidebarGroup>
                <WorkSpaceHistory />
               </SidebarGroup>
                {/* <SidebarGroup /> */}
            </SidebarContent>
            <SidebarFooter>
                <CustomSidebarFooter />
            </SidebarFooter>
        </Sidebar>
    )
}

export default AppSidebar