"use client"
import React, { useEffect } from 'react'
import { ThemeProvider } from "next-themes"
import Header from '@/components/custom/Header'
import { ContextMessages } from '@/context/ContextMessages'
import { UserDetailsContext } from '@/context/UserDetailContext'
import { useState } from 'react'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { useConvex } from 'convex/react'
import { loadSession, clearSession } from '@/lib/session'
import { applyStoredAuth } from '@/lib/convex-client'
import { api } from '@/convex/_generated/api'
import { SidebarProvider } from '@/components/ui/sidebar'
import AppSidebar from '@/components/custom/AppSidebar'
import { ActionContext } from '@/context/ActionContext'
import { WorkspaceViewContext } from '@/context/WorkspaceViewContext'
import { usePathname, useRouter } from 'next/navigation'

const Provider = ({children}) => {
  const [messages, setMessages] = useState()
  const [userDetails, setUserDetails] = useState()
  const [action, setAction] = useState()
  const [workspaceView, setWorkspaceView] = useState('code')
  const router = useRouter()
  const pathname = usePathname()
  // Fixture preview routes render their own self-contained chrome.
  const isFixtureRoute = pathname?.startsWith('/fixture-workspace')
  const convex = useConvex()
  useEffect(() => {
    const isAuthenticated = async () => {
      try {
        const session = loadSession()

        if (!session) {
          // Drop any legacy unsigned session too: a forged "user" key must
          // never count as signed in.
          clearSession()
          if (!isFixtureRoute && pathname !== '/') {
            router.push('/')
          }
          return
        }

        // Register the stored Google ID token so the GetUser call below is
        // authenticated; the backend resolves the account from the verified
        // identity, never from client-supplied data.
        applyStoredAuth()

        let convexUser
        try {
          convexUser = await convex.query(api.users.GetUser, {})
        } catch (firstErr) {
          // Token propagation after setAuth can lag one round trip; retry once.
          await new Promise((resolve) => setTimeout(resolve, 700))
          convexUser = await convex.query(api.users.GetUser, {})
        }

        setUserDetails({
          name: session.name,
          email: session.email,
          picture: session.picture,
          _id: convexUser._id
        })
      } catch (error) {
        console.error("Error in isAuthenticated:", error)
        clearSession()
      }
    }

    isAuthenticated()
  }, [])

  return (
    <>
      <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_AUTH_KEY}>
        <UserDetailsContext.Provider value={{userDetails, setUserDetails}}>
          <ContextMessages.Provider value={{messages, setMessages}}>
            <ActionContext.Provider value={{action, setAction}}>
            <WorkspaceViewContext.Provider value={{workspaceView, setWorkspaceView}}>
            <ThemeProvider
              attribute="class"
              defaultTheme="dark"
              enableSystem={false}
              forcedTheme="dark"
            >
              <div className="max-h-screen w-full">
                <SidebarProvider defaultOpen={false}>
                  {!isFixtureRoute && <div className='absolute'>
                  <AppSidebar />
                  </div>}
                  <div className='relative flex min-h-svh w-full min-w-0 flex-1 flex-col'>
                    {!isFixtureRoute && <Header />}
                    <main className='h-full w-full min-h-0 flex-1'>{children}</main>
                  </div>
                </SidebarProvider>
              </div>
            </ThemeProvider>
            </WorkspaceViewContext.Provider>
            </ActionContext.Provider>
          </ContextMessages.Provider>
        </UserDetailsContext.Provider>
      </GoogleOAuthProvider>
    </>
  )
}

export default Provider
