"use client"
import React, { useEffect } from 'react'
import { ThemeProvider } from "next-themes"
import Header from '@/components/custom/Header'
import { ContextMessages } from '@/context/ContextMessages'
import { UserDetailsContext } from '@/context/UserDetailContext'
import { useState } from 'react'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { useConvex } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { SidebarProvider } from '@/components/ui/sidebar'
import AppSidebar from '@/components/custom/AppSidebar'
import { ActionContext } from '@/context/ActionContext'
import { usePathname, useRouter } from 'next/navigation'

const Provider = ({children}) => {
  const [messages, setMessages] = useState()
  const [userDetails, setUserDetails] = useState()
  const [action, setAction] = useState()
  const router = useRouter()
  const pathname = usePathname()
  const convex = useConvex()
  useEffect(() => {
    const isAuthenticated = async () => {
      try {
        const storedUser = localStorage.getItem('user')

        if (!storedUser) {
          if (pathname !== '/') {
            router.push('/')
          }
          return
        }

        const parsedUser = JSON.parse(storedUser)
        const convexUser = await convex.query(api.users.GetUser, {
          email: parsedUser.email
        })

        if (!convexUser) {
          // The stored session points at a user that no longer exists in this
          // Convex deployment. Keeping it would leave the app signed in with no
          // usable id, so drop it and let the user sign in again.
          console.warn('Stored session is no longer valid, signing out:', parsedUser.email)
          localStorage.removeItem('user')
          setUserDetails(undefined)
          return
        }

        const userWithId = {
          ...parsedUser,
          _id: convexUser._id
        }
        localStorage.setItem('user', JSON.stringify(userWithId))
        setUserDetails(userWithId)
      } catch (error) {
        console.error("Error in isAuthenticated:", error)
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
            <ThemeProvider
              attribute="class"
              defaultTheme="dark"
              enableSystem={false}
              forcedTheme="dark"
            >
              <div className="max-h-screen w-full">
                <SidebarProvider defaultOpen={false}>
                  <div className='absolute'>
                  <AppSidebar />
                  </div>
                  <div className='relative flex min-h-svh w-full min-w-0 flex-1 flex-col'>
                    <Header />
                    <main className='w-full flex-1'>{children}</main>
                  </div>
                </SidebarProvider>
              </div>
            </ThemeProvider>
            </ActionContext.Provider>
          </ContextMessages.Provider>
        </UserDetailsContext.Provider>
      </GoogleOAuthProvider>
    </>
  )
}

export default Provider