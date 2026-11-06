// Server wrapper for the fixture renderer. notFound() runs here, before any
// client code streams, so production builds (no NEXT_PUBLIC_FIXTURE=1) return a
// real 404 status instead of a soft client-side not-found.
import { notFound } from 'next/navigation'
import FixtureClient from './fixture-client'

export const dynamic = 'force-dynamic'

export default function FixtureWorkspacePage() {
  if (process.env.NEXT_PUBLIC_FIXTURE !== '1') {
    notFound()
  }
  return <FixtureClient />
}
