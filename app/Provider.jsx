"use client"
import React, { useEffect } from 'react'
import { ThemeProvider } from "next-themes"
import Header from '@/components/custom/Header'
import { ContextMessages } from '@/context/ContextMessages'
import { UserDetailsContext } from '@/context/UserDetailContext'
import { useState } from 'react'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { ConvexProvider, ConvexReactClient } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { SidebarProvider } from '@/components/ui/sidebar'
import AppSidebar from '@/components/custom/AppSidebar'
import { ActionContext } from '@/context/ActionContext'
import { useRouter } from 'next/navigation'

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL
const convex = new ConvexReactClient(convexUrl)
const Provider = ({children}) => {
  const [messages, setMessages] = useState()
  const [userDetails, setUserDetails] = useState()
  const [action, setAction] = useState()
  const router = useRouter()
  useEffect(() => {
    const isAuthenticated = async () => {
      try {
        if(typeof window !== 'undefined') {
          const storedUser = localStorage.getItem('user')
          console.log("Stored user (raw):", storedUser)
           
          if(!storedUser) {
            router.push('/')
          } else
          if (storedUser) {
            const parsedUser = JSON.parse(storedUser)
            console.log("Parsed user:", parsedUser)
            
            const convexUser = await convex.query(api.users.GetUser, {
              email: parsedUser.email
            })
            console.log("Convex query result:", convexUser)
            
            if (convexUser) {
              const userWithId = {
                ...parsedUser,
                _id: convexUser._id
              }
              console.log("Setting user with ID:", userWithId)
              localStorage.setItem('user', JSON.stringify(userWithId))
              setUserDetails(userWithId)
            }
          }
        }
      } catch (error) {
        console.error("Error in isAuthenticated:", error)
      }
    }
    
    isAuthenticated()
  }, [])

  useEffect(() => {
    console.log("Current userDetails:", userDetails)
  }, [userDetails])

  return (
    <ConvexProvider client={convex}>
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
              <div className="max-h-screen">
                <SidebarProvider defaultOpen={false}>
                  <div className='absolute'>
                  <AppSidebar />
                  </div>
                  <div className='pl-0'>
                    <Header />
                    <main>{children}</main>
                  </div>
                </SidebarProvider>
              </div>
            </ThemeProvider>
            </ActionContext.Provider>
          </ContextMessages.Provider>
        </UserDetailsContext.Provider>
      </GoogleOAuthProvider>
    </ConvexProvider>
  )
}

export default Provider