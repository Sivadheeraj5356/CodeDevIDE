import React, { useContext, useEffect, useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
  } from "@/components/ui/dialog"
import { Button } from '../ui/button'
import { GoogleLogin } from '@react-oauth/google'
import { UserDetailsContext } from '@/context/UserDetailContext'
import { useGoogleLogin } from '@react-oauth/google'
import axios from 'axios'
import { useMutation, useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import uuid4 from 'uuid4'

const SignInDialog = ({openDialog, closeDialog}) => {
  const {userDetails, setUserDetails} = useContext(UserDetailsContext)
  const createUser = useMutation(api.users.CreateUser)
  const [signInError, setSignInError] = useState(null)

  useEffect(() => {
    if (userDetails?._id) {
      closeDialog(false)
    }
  }, [userDetails])

  const googleLogin = useGoogleLogin({
    // Always show the account chooser instead of silently reusing whichever
    // Google account the browser is already signed in to.
    prompt: 'select_account',
    onSuccess: async (tokenResponse) => {
      try {
        setSignInError(null)
        const userInfo = await axios.get(
          'https://www.googleapis.com/oauth2/v3/userinfo',
          { headers: { Authorization: 'Bearer '+ tokenResponse?.access_token } },
        );

        const user = userInfo.data;
        const convexUser = await createUser({
          name: user?.name,
          email: user?.email,
          picture: user?.picture,
          uid: uuid4()
        });

        const userWithId = {
          ...user,
          _id: convexUser._id
        };

        localStorage.setItem('user', JSON.stringify(userWithId));
        setUserDetails(userWithId);
        closeDialog(false);
      } catch (err) {
        console.error('Sign in failed:', err);
        setSignInError(err?.message || 'Sign in failed. Please try again.');
      }
    },
    onError: errorResponse => {
      console.error('Google sign in failed:', errorResponse);
      setSignInError(
        errorResponse?.error_description ||
        errorResponse?.error ||
        'Google rejected the sign in. If the popup showed "origin_mismatch", add ' +
        (typeof window !== 'undefined' ? window.location.origin : '') +
        ' as an authorized JavaScript origin on the OAuth client in Google Cloud Console.'
      );
    },
    // Fires when the popup itself fails (blocked by the browser, or closed
    // before Google returned a token) - these never reach onError.
    onNonOAuthError: nonOAuthError => {
      console.error('Google popup did not complete:', nonOAuthError);
      setSignInError(
        nonOAuthError?.type === 'popup_closed'
          ? 'The Google window closed before sign in finished. If it showed "Access blocked / origin_mismatch", add ' +
            (typeof window !== 'undefined' ? window.location.origin : '') +
            ' as an authorized JavaScript origin on the OAuth client in Google Cloud Console.'
          : 'Could not open the Google sign in window. Check that popups are allowed for this site.'
      );
    },
  });

  if (userDetails?._id) return null;

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
          <Button
            className='bg-blue-500 text-white hover:bg-blue-400 mt-3'
            onClick={googleLogin}
          >
            Sign In with Google
          </Button>
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