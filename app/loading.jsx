import React from 'react'
import { Loader2Icon } from 'lucide-react'
const loading = () => {
  return (
    <div className='h-screen w-screen flex justify-center items-center'>
       <Loader2Icon className='animate-spin' width={60} height={60}></Loader2Icon> 
    </div>
  )
}

export default loading