'use client'
import React, { useContext, useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useConvex } from 'convex/react'
import { googleLogout } from '@react-oauth/google'
import { useRouter } from 'next/navigation'
import { LogOut, Moon, ShieldCheck } from 'lucide-react'
import { UserDetailsContext } from '@/context/UserDetailContext'
import { api } from '@/convex/_generated/api'
import { Button } from '@/components/ui/button'
import PageShell from '@/components/custom/PageShell'

const Settings = () => {
  const { userDetails } = useContext(UserDetailsContext)
  const convex = useConvex()
  const router = useRouter()
  const [workspaceCount, setWorkspaceCount] = useState(null)

  useEffect(() => {
    if (!userDetails?._id) return

    const loadWorkspaces = async () => {
      try {
        const result = await convex.query(api.workspace.GetAllWorkspace, {
          userId: userDetails._id
        })
        setWorkspaceCount(result?.length ?? 0)
      } catch (err) {
        console.error('Could not load workspaces:', err)
      }
    }

    loadWorkspaces()
  }, [userDetails])

  const signOut = () => {
    googleLogout()
    localStorage.clear()
    router.push('/')
    window.location.reload()
  }

  return (
    <PageShell>
      <h1 className='text-3xl font-bold'>Settings</h1>
      <p className='text-gray-400 mt-1'>Your account and how this workspace behaves.</p>

      <section className='mt-8 border rounded-xl bg-[#151515] p-6'>
        <h2 className='font-semibold mb-4'>Account</h2>
        {userDetails ? (
          <div className='flex items-center gap-4'>
            {userDetails.picture && (
              <Image
                src={userDetails.picture}
                alt={userDetails.name || 'profile picture'}
                width={56}
                height={56}
                className='rounded-full'
              />
            )}
            <div className='min-w-0'>
              <div className='font-medium truncate'>{userDetails.name}</div>
              <div className='text-sm text-gray-400 truncate'>{userDetails.email}</div>
            </div>
          </div>
        ) : (
          <p className='text-sm text-gray-400'>You are not signed in.</p>
        )}

        <dl className='grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 text-sm'>
          <div className='border rounded-lg p-4'>
            <dt className='text-gray-400'>Projects created</dt>
            <dd className='text-2xl font-semibold mt-1'>
              {workspaceCount === null ? '—' : workspaceCount}
            </dd>
          </div>
          <div className='border rounded-lg p-4'>
            <dt className='text-gray-400'>Plan</dt>
            <dd className='text-2xl font-semibold mt-1'>Free</dd>
            <Link href='/pricing' className='text-sm text-blue-400 hover:underline mt-2 inline-block'>
              Manage subscription
            </Link>
          </div>
        </dl>
      </section>

      <section className='mt-6 border rounded-xl bg-[#151515] p-6'>
        <h2 className='font-semibold mb-4'>Preferences</h2>
        <div className='flex items-start gap-3 text-sm'>
          <Moon className='h-5 w-5 shrink-0 text-gray-400' />
          <div>
            <div className='font-medium'>Dark theme</div>
            <p className='text-gray-400'>
              CodeDevAI is dark only for now, so the editor and the preview stay consistent.
            </p>
          </div>
        </div>
        <div className='flex items-start gap-3 text-sm mt-5'>
          <ShieldCheck className='h-5 w-5 shrink-0 text-gray-400' />
          <div>
            <div className='font-medium'>Sign in</div>
            <p className='text-gray-400'>
              You are signed in with Google. Your session is stored in this browser, so signing out
              here removes it from this device only.
            </p>
          </div>
        </div>
      </section>

      <section className='mt-6 border border-red-500/40 rounded-xl bg-red-500/5 p-6'>
        <h2 className='font-semibold'>Sign out</h2>
        <p className='text-sm text-gray-400 mt-1 mb-4'>
          Clears the session stored in this browser. Your projects stay saved and come back when you
          sign in again.
        </p>
        <Button variant='ghost' className='border border-red-500/40 text-red-300' onClick={signOut}>
          <LogOut /> Sign out
        </Button>
      </section>
    </PageShell>
  )
}

export default Settings
