"use client"
import { UserDetailsContext } from '@/context/UserDetailContext'
import { api } from '@/convex/_generated/api';
import { useConvex } from 'convex/react';

import React, { useContext, useEffect, useState } from 'react'
import { useSidebar } from '../ui/sidebar';
import Link from 'next/link';

function WorkspaceHistory() {
    const {userDetails}=useContext(UserDetailsContext);
    const convex=useConvex();
    const [workspaceList,setWorkspaceList]=useState();
    const {toggleSidebar}=useSidebar();
    useEffect(()=>{
        userDetails?._id&&GetAllWorkspace();
    },[userDetails])

    const GetAllWorkspace=async()=>{
        try{
            const result=await convex.query(api.workspace.GetAllWorkspace,{
                userId:userDetails?._id
            });
            setWorkspaceList(result);
        }catch(err){
            console.error('Failed to load workspace history:', err);
        }
    }
  return (
    <div>
        <h2 className='font-medium text-lg'>Your Chats</h2>
        <div>
            {workspaceList&&workspaceList?.map((workspace,index)=>(
                <Link href={'/workspace/'+workspace?._id} key={index}>
                    <h2 onClick={toggleSidebar} className='text-sm text-gray-400 my-4 
                    font-light cursor-pointer hover:text-white'>
                        {workspace?.messages[0]?.content}
                    </h2>
                </Link>
            ))}
            
        </div>
    </div>
  )
}

export default WorkspaceHistory