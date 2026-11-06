import React, { useContext, useEffect, useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
  } from "@/components/ui/dialog"
import { GoogleLogin } from '@react-oauth/google'
import { UserDetailsContext } from '@/context/UserDetailContext'
import { useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { saveSession } from '@/lib/session'
import { applyStoredAuth } from '@/lib/convex-client'

const SignInDialog = ({openDialog, closeDialog}) => {
  const {userDetails, setUserDetails} = useContext(UserDetailsContext)
  const createUser = useMutation(api.users.CreateUser)
  const [signInError, setSignInError] = useState(null)
  const [signingIn, setSigningIn] = useState(false)

  useEffect(() => {
    if (userDetails?._id) {
      closeDialog(false)
    }
  }, [userDetails])

  const onGoogleSuccess = async (credentialResponse) => {
    const idToken = credentialResponse?.credential
    const session = idToken ? saveSession(idToken) : null
    if (!session) {
      setSignInError('Google did not return a usable sign-in token. Please try again.')
      return
    }

    try {
      setSignInError(null)
      setSigningIn(true)
      // Register the token with Convex BEFORE the first authed call so the
      // backend sees the verified Google identity, not a client-made profile.
      applyStoredAuth()

      let convexUser
      try {
        convexUser = await createUser({})
      } catch (firstErr) {
        // Token propagation after setAuth can lag one round trip; retry once.
        await new Promise((resolve) => setTimeout(resolve, 700))
        convexUser = await createUser({})
      }

      setUserDetails({
        name: session.name,
        email: session.email,
        picture: session.picture,
        _id: convexUser._id
      })
      closeDialog(false)
    } catch (err) {
      console.error('Sign in failed:', err)
      setSignInError(err?.message || 'Sign in failed. Please try again.')
    } finally {
      setSigningIn(false)
    }
  }

  if (userDetails?._id) return null

  return (
    <Dialog open={openDialog} onOpenChange={closeDialog}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className='font-bold text-2xl text-center'>Continue with CodeDevAI</DialogTitle>
          <DialogDescription className='mt-2 text-center'>
            To use CodeDev login your account or create one
          </DialogDescription>
        </DialogHeader>
        <div className='flex flex-col items-center justify-center gap-3'>
          <div className={signingIn ? 'opacity-50 pointer-events-none mt-3' : 'mt-3'}>
            <GoogleLogin
              onSuccess={onGoogleSuccess}
              onError={() => setSignInError('Google sign in failed. Check that popups are allowed for this site.')}
              theme='filled_black'
              size='large'
              shape='rectangular'
              text='signin_with'
              width='260'
            />
          </div>
          {signingIn && <div className='text-sm text-muted-foreground'>Signing you in...</div>}
          {signInError && <div className='w-full bg-red-500/10 border border-red-500/40 text-red-300 text-sm rounded-md p-3 break-words'>
            {signInError}
          </div>}
          <div className='text-sm text-muted-foreground text-center'>CodeDev collects the data for analytics for improved performance</div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default SignInDialog
