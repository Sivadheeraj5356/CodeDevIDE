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

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL
const convex = new ConvexReactClient(convexUrl)

const Provider = ({children}) => {
  const [messages, setMessages] = useState()
  const [userDetails, setUserDetails] = useState()

  useEffect(() => {
    const isAuthenticated = async () => {
      try {
        if(typeof window !== 'undefined') {
          const storedUser = localStorage.getItem('user')
          console.log("Stored user (raw):", storedUser)
          
          if (storedUser) {
            const parsedUser = JSON.parse(storedUser)
            console.log("Parsed user:", parsedUser)
            
            // Get the user from Convex using email
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
              // Update localStorage with the merged data
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

  // Debug log when userDetails changes
  useEffect(() => {
    console.log("Current userDetails:", userDetails)
  }, [userDetails])

  return (
    <ConvexProvider client={convex}>
      <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_AUTH_KEY}>
        <UserDetailsContext.Provider value={{userDetails, setUserDetails}}>
          <ContextMessages.Provider value={{messages, setMessages}}>
            <ThemeProvider
              attribute="class"
              defaultTheme="dark"
              enableSystem={false}
              forcedTheme="dark"
            >
              <div className="min-h-screen">
                <Header />
                {children}
              </div>
            </ThemeProvider>
          </ContextMessages.Provider>
        </UserDetailsContext.Provider>
      </GoogleOAuthProvider>
    </ConvexProvider>
  )
}

export default Provider