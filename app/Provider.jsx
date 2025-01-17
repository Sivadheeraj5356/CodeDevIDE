"use client"
import React from 'react'
import { ThemeProvider } from "next-themes"
import Header from '@/components/custom/Header'
import { ContextMessages } from '@/context/ContextMessages'
import { useState } from 'react'
import { UserDetailsContext } from '@/context/UserDetailContext'
import { GoogleOAuthProvider } from '@react-oauth/google';

const Provider = ({children}) => {
  const [messages, setMessages] = useState()
  const [userDetails , setUserDetails] = useState()
  return (
    <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_AUTH_KEY}>
    <UserDetailsContext.Provider value={{userDetails , setUserDetails}}>
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
  )
}

export default Provider