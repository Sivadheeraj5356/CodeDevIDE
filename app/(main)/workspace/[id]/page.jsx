"use client"
import React, { useContext, useState } from 'react'
import Link from 'next/link'
import ChatView from '@/components/custom/ChatView'
import CodeView from '@/components/custom/CodeView'
import { WorkspaceViewContext } from '@/context/WorkspaceViewContext'
import { UserDetailsContext } from '@/context/UserDetailContext'
import { useSidebar } from '@/components/ui/sidebar'
import { House, SquarePen } from 'lucide-react'

const MOBILE_TABS = [
  { key: 'chat', label: 'Chat' },
  { key: 'code', label: 'Code' },
  { key: 'preview', label: 'Preview' },
]

// v0-style three-zone workspace (desktop): a slim global rail (real routes
// only), the conversation column, and the workbench. Mobile keeps the
// approved 3-way pill switcher and stacked panes. The Code/Preview state
// lives in WorkspaceViewContext so the workbench toolbar switch and the
// mobile switcher drive the same panes.
const Workspace = ({ initialMobilePane = 'chat' }) => {
  const [mobilePane, setMobilePane] = useState(initialMobilePane)
  const { workspaceView: codeTab, setWorkspaceView: setCodeTab } = useContext(WorkspaceViewContext)
  const { userDetails } = useContext(UserDetailsContext)
  const { toggleSidebar } = useSidebar()

  const select = (key) => {
    if (key === 'chat') {
      setMobilePane('chat')
    } else {
      setMobilePane('ide')
      setCodeTab(key)
    }
  }
  const activeKey = mobilePane === 'chat' ? 'chat' : codeTab

  return (
    <div className='flex h-full min-h-0 flex-col'>
      <div className='md:hidden flex justify-center mb-2 shrink-0 px-3 pt-2'>
        <div className='flex items-center bg-[#101314] p-1 gap-1 rounded-lg border border-[#2A3130]' role='tablist' aria-label='Workspace view'>
          {MOBILE_TABS.map((t) => (
            <button key={t.key} type='button' role='tab' aria-selected={activeKey === t.key}
              onClick={() => select(t.key)}
              className={`text-[13px] px-4 py-1.5 rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7FB39D] ${activeKey === t.key ? 'text-[#7FB39D] bg-[#5F8F7B]/25' : 'text-[#9AA4A1] hover:text-[#EDE8DC]'}`}>
              {t.label}
            </button>
          ))}
        </div>
      </div>
      <div className='flex min-h-0 flex-1'>
        {/* Global rail: real destinations only. Desktop only. */}
        <nav aria-label='Workspace navigation'
          className='hidden md:flex w-[52px] shrink-0 flex-col items-center gap-1 border-r border-[#232928] py-3'>
          <Link href='/' aria-label='Home'
            className='flex h-9 w-9 items-center justify-center rounded-lg text-[#9AA4A1] transition-colors hover:bg-[#1B2120] hover:text-[#EDE8DC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7FB39D]'>
            <House className='h-[18px] w-[18px]' />
          </Link>
          <Link href='/' aria-label='New workspace'
            className='flex h-9 w-9 items-center justify-center rounded-lg text-[#9AA4A1] transition-colors hover:bg-[#1B2120] hover:text-[#EDE8DC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7FB39D]'>
            <SquarePen className='h-[18px] w-[18px]' />
          </Link>
          <div className='flex-1' />
          <button type='button' onClick={toggleSidebar} aria-label='Account and history'
            className='flex h-8 w-8 items-center justify-center rounded-full bg-[#5F8F7B]/25 text-[11px] font-semibold text-[#7FB39D] transition-colors hover:bg-[#5F8F7B]/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7FB39D]'>
            {(userDetails?.name ?? '?').trim().charAt(0).toUpperCase()}
          </button>
        </nav>

        {/* Conversation column */}
        <div className={`min-h-0 w-full md:w-[368px] md:shrink-0 md:border-r md:border-[#232928] ${mobilePane === 'chat' ? 'flex' : 'hidden'} md:flex`}>
          <ChatView />
        </div>

        {/* Workbench */}
        <div className={`min-h-0 min-w-0 flex-1 ${mobilePane === 'ide' ? '' : 'hidden'} md:block`}>
          <CodeView activeTab={codeTab} setActiveTab={setCodeTab} />
        </div>
      </div>
    </div>
  )
}

export default Workspace
