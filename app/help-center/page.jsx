'use client'
import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import PageShell from '@/components/custom/PageShell'

const steps = [
  {
    title: 'Describe what you want to build',
    body: 'Type a prompt on the home page, or pick one of the suggestions. Be specific about the screens and the behaviour you expect, since that is all the model gets.'
  },
  {
    title: 'Wait for the project',
    body: 'The chat panel answers with a short plan while the editor fills up with the generated files. A full project usually takes 25 to 45 seconds.'
  },
  {
    title: 'Edit and preview',
    body: 'Switch between Code and Preview at the top of the editor. Files are editable, and the preview reruns as you type. Use the maximize icon for a full screen preview.'
  },
  {
    title: 'Keep refining',
    body: 'Send another message in the chat to change the project. Each new prompt regenerates the files, so ask for changes in one message rather than several small ones.'
  }
]

const troubleshooting = [
  {
    q: 'The response got cut off',
    a: 'The project was too large for a single reply. Ask for fewer screens or a simpler layout, then build the rest up with follow up prompts.'
  },
  {
    q: 'The preview is blank',
    a: 'Open the Console tab inside the preview. The generated code can only use the dependencies this app pre-installs, so an import of an unlisted package will fail to resolve.'
  },
  {
    q: 'Deploy opened CodeSandbox',
    a: 'That is expected. Deploy publishes the generated project to a CodeSandbox preview and Export opens the same project in the CodeSandbox editor. Neither one deploys to a domain of your own.'
  },
  {
    q: 'My projects are missing',
    a: 'Projects are tied to the Google account you signed in with. Check the sidebar under Your Chats, and make sure you are signed in with the same account.'
  }
]

const HelpCenter = () => {
  const router = useRouter()

  return (
    <PageShell>
      <h1 className='text-3xl font-bold'>Help Center</h1>
      <p className='text-gray-400 mt-1'>How CodeDevAI works and what to do when it misbehaves.</p>

      <section className='mt-8'>
        <h2 className='font-semibold mb-4'>Getting started</h2>
        <ol className='space-y-3'>
          {steps.map((step, index) => (
            <li key={step.title} className='border rounded-xl bg-[#151515] p-5 flex gap-4'>
              <span className='shrink-0 h-7 w-7 rounded-full bg-blue-500/20 text-blue-400 text-sm flex items-center justify-center'>
                {index + 1}
              </span>
              <div>
                <div className='font-medium'>{step.title}</div>
                <p className='text-sm text-gray-400 mt-1 leading-6'>{step.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className='mt-10'>
        <h2 className='font-semibold mb-4'>Common problems</h2>
        <div className='space-y-3'>
          {troubleshooting.map((item) => (
            <div key={item.q} className='border rounded-xl bg-[#151515] p-5'>
              <div className='font-medium'>{item.q}</div>
              <p className='text-sm text-gray-400 mt-1 leading-6'>{item.a}</p>
            </div>
          ))}
        </div>
      </section>

      <section className='mt-10 border rounded-xl bg-[#151515] p-6'>
        <h2 className='font-semibold'>Still stuck?</h2>
        <p className='text-sm text-gray-400 mt-1'>
          CodeDevAI is an open source project. Report a bug or read the code on{' '}
          <Link
            href='https://github.com/Sivadheeraj5356/CodeDevIDE'
            target='_blank'
            className='text-blue-400 hover:underline'
          >
            GitHub
          </Link>
          .
        </p>
        <div className='flex flex-wrap gap-3 mt-4'>
          <Button
            className='bg-blue-500 text-white hover:bg-blue-600'
            onClick={() => router.push('/')}
          >
            Start a new project
          </Button>
          <Button variant='ghost' className='border' onClick={() => router.push('/pricing')}>
            View subscription
          </Button>
        </div>
      </section>
    </PageShell>
  )
}

export default HelpCenter
