// Includes the fixture workspace route ONLY in builds made with
// NEXT_PUBLIC_FIXTURE=1. In every other build the route is absent from the
// app tree entirely, so the deployable product cannot serve it (real 404,
// no fixture bytes shipped).
import { cpSync, existsSync, rmSync } from 'node:fs'

const dest = 'app/fixture-workspace'
if (process.env.NEXT_PUBLIC_FIXTURE === '1') {
  rmSync(dest, { recursive: true, force: true })
  cpSync('fixture-only/fixture-workspace', dest, { recursive: true })
  console.log('fixture-gate: fixture route INCLUDED (NEXT_PUBLIC_FIXTURE=1)')
} else {
  if (existsSync(dest)) {
    rmSync(dest, { recursive: true, force: true })
    console.log('fixture-gate: fixture route REMOVED (flag absent)')
  } else {
    console.log('fixture-gate: fixture route absent, nothing to do')
  }
}
