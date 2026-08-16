'use client'
import React from 'react'

/** Shared centered layout for settings / help / pricing so content is not stuck left. */
const PageShell = ({ children, wide = false }) => {
  return (
    <div className='w-full min-h-[calc(100vh-4.5rem)]'>
      <div
        className={`mx-auto w-full px-6 py-10 sm:px-8 ${
          wide ? 'max-w-5xl' : 'max-w-3xl'
        }`}
      >
        {children}
      </div>
    </div>
  )
}

export default PageShell
