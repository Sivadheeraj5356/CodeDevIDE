import React from 'react'
import { Loader2Icon } from 'lucide-react'
const loading = () => {
  return (
    <div className='h-[80vh] w-[80vw] flex justify-center items-center'>
       <Loader2Icon className='animate-spin' width={60} height={60}></Loader2Icon> 
    </div>
  )
}

export default loading