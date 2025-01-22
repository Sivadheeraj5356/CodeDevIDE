import React, { useContext, useEffect } from 'react'
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

  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      setUserDetails(JSON.parse(storedUser))
      closeDialog(false)
    }
  }, [])

  useEffect(() => {
    if (userDetails) {
      closeDialog(false)
    }
  }, [userDetails])

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
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
       
      if(typeof window !== 'undefined'){
        localStorage.setItem('user', JSON.stringify(userWithId));
      }

      setUserDetails(userWithId);
      closeDialog(false);
    },
    onError: errorResponse => console.log(errorResponse),
  });

  if (userDetails) return null;

  return (
    <Dialog open={openDialog} onOpenChange={closeDialog}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle></DialogTitle>
          <DialogDescription>
            <div className='flex flex-col items-center justify-center gap-3'>
              <div className='font-bold text-2xl text-center'>Continue with CodeDevAI</div>
              <div className='mt-2 text-center'>To use CodeDev login your account or create one</div>
              <Button 
                className='bg-blue-500 text-white hover:bg-blue-400 mt-3' 
                onClick={googleLogin}
              > 
                Sign In with Google
              </Button>
              <div>CodeDev collects the data for analytics for improved performance</div>
            </div>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  )
}

export default SignInDialog