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
const AppSidebar = () => {
    return (
        <Sidebar>
            <SidebarHeader className='p-4'>
                <div className='p-5 text-2xl font-semibold '>
                    CodeDevIDE
                </div>
                <Button> <MessageCircleCode></MessageCircleCode> Create a New Chat </Button>
            </SidebarHeader>
            <SidebarContent className='p-4'>
                <SidebarGroup />
                <WorkSpaceHistory />
                {/* <SidebarGroup /> */}
            </SidebarContent>
            <SidebarFooter>
                <CustomSidebarFooter />
            </SidebarFooter>
        </Sidebar>
    )
}

export default AppSidebar