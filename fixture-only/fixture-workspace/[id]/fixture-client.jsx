"use client"
// FIXTURE RENDERER - not part of the product.
// Renders the REAL workspace components against an in-memory stub client with
// synthetic data so layout changes can be reviewed without a backend, a
// sign-in, or any live data. Only registered in builds made with
// NEXT_PUBLIC_FIXTURE=1; every other build renders 404. The stub client has
// no network access and its mutation is a no-op, so nothing here can read or
// write a real deployment.
import React, { Suspense, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { ConvexProvider } from 'convex/react'
import { UserDetailsContext } from '@/context/UserDetailContext'
import { ContextMessages } from '@/context/ContextMessages'
import { ActionContext } from '@/context/ActionContext'
import { WorkspaceViewContext } from '@/context/WorkspaceViewContext'
import Header from '@/components/custom/Header'
import Workspace from '@/app/(main)/workspace/[id]/page'

const FIXTURE_MESSAGES = [
  { role: 'user', content: 'Create a todo app with a dark theme, a header, and the ability to check items off.' },
  { role: 'ai', content: 'Here is the plan:\n\n- **App.js** - page shell, dark background, header with the app title\n- **components/TodoList.js** - state for the list, add input, toggle and delete\n- **components/TodoItem.js** - one row with a checkbox and a remove button\n\nGenerating the files now - the preview will update on the right.' },
  { role: 'user', content: 'Looks good. Make the header slimmer and add a way to clear the completed items.' },
  { role: 'ai', content: 'Done - the header is now a compact bar, and a "Clear completed" action sits under the list. I also tightened the row spacing and gave the checkboxes a proper accent color so the list reads cleanly. Updated **components/TodoList.js** and **styles.css**.' },
  { role: 'user', content: 'Nice. Show how many tasks are still open.' },
  { role: 'ai', content: 'Added - a live count of open tasks now sits above the list, and it updates as you check items off. One small touch: completed rows dim to the muted gray so the open work stands out.' },
]

// Conversation-length variants for layout verification only (?conv=short|long).
const FIXTURE_MESSAGES_SHORT = [
  { role: 'user', content: 'Create a todo app with a dark theme.' },
  { role: 'ai', content: 'Here is the plan:\n\n- **App.js** - page shell and header\n- **components/TodoList.js** - list state and add input\n\nGenerating the files now.' },
]

const FIXTURE_MESSAGES_LONG = [
  { role: 'user', content: 'Create a todo app with a dark theme, a header, and the ability to check items off.' },
  { role: 'ai', content: 'Here is the plan:\n\n- **App.js** - page shell, dark background, header with the app title\n- **components/TodoList.js** - state for the list, add input, toggle and delete\n- **components/TodoItem.js** - one row with a checkbox and a remove button\n\nGenerating the files now - the preview will update on the right.' },
  { role: 'user', content: 'Looks good. Make the header slimmer and add a way to clear the completed items.' },
  { role: 'ai', content: 'Done - the header is now a compact bar, and a "Clear completed" action sits under the list. I also tightened the row spacing and gave the checkboxes a proper accent color so the list reads cleanly. Updated **components/TodoList.js** and **styles.css**.' },
  { role: 'user', content: 'Nice. Show how many tasks are still open.' },
  { role: 'ai', content: 'Added - a live count of open tasks now sits above the list, and it updates as you check items off. One small touch: completed rows dim to the muted gray so the open work stands out.' },
  { role: 'user', content: 'Can the input submit on Enter instead of needing the button?' },
  { role: 'ai', content: 'Yes - the add input now submits on Enter as well as the button, and it clears itself after adding. No layout change, just the keyboard handler in **components/TodoList.js**.' },
  { role: 'user', content: 'Give the delete button a hover state.' },
  { role: 'ai', content: 'Added - the remove control now brightens and picks up a subtle background on hover so it reads as interactive without shouting.' },
]

const FIXTURE_FILES = {
  '/App.js': { code: "import React from 'react';\nimport './styles.css';\nimport TodoList from './components/TodoList';\n\nexport default function App() {\n  return (\n    <div className=\"app\">\n      <header className=\"header\">\n        <h1>My <span>Tasks</span></h1>\n      </header>\n      <main>\n        <TodoList />\n      </main>\n    </div>\n  );\n}\n" },
  '/components/TodoList.js': { code: "import React, { useState } from 'react';\nimport TodoItem from './TodoItem';\n\nexport default function TodoList() {\n  const [todos, setTodos] = useState([\n    { id: 1, text: 'Sketch the dark theme', done: true },\n    { id: 2, text: 'Wire up the checkbox state', done: true },\n    { id: 3, text: 'Refine the row spacing', done: false },\n    { id: 4, text: 'Ship it', done: false },\n  ]);\n  const [draft, setDraft] = useState('');\n  const open = todos.filter((t) => !t.done).length;\n\n  const add = () => {\n    if (!draft.trim()) return;\n    setTodos([...todos, { id: Date.now(), text: draft.trim(), done: false }]);\n    setDraft('');\n  };\n\n  return (\n    <div>\n      <p className=\"count\">{open} open</p>\n      <div className=\"card\">\n        <div className=\"add-row\">\n          <input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder=\"Add a task\" />\n          <button onClick={add}>Add</button>\n        </div>\n        {todos.map((t) => (\n          <TodoItem key={t.id} todo={t}\n            onToggle={() => setTodos(todos.map((x) => x.id === t.id ? { ...x, done: !x.done } : x))}\n            onDelete={() => setTodos(todos.filter((x) => x.id !== t.id))} />\n        ))}\n        <div className=\"clear-row\">\n          <button onClick={() => setTodos(todos.filter((t) => !t.done))}>Clear completed</button>\n        </div>\n      </div>\n    </div>\n  );\n}\n" },
  '/components/TodoItem.js': { code: "import React from 'react';\n\nexport default function TodoItem({ todo, onToggle, onDelete }) {\n  return (\n    <div className=\"todo-item\">\n      <label>\n        <input type=\"checkbox\" checked={todo.done} onChange={onToggle} />\n        <span className={todo.done ? 'done' : ''}>{todo.text}</span>\n      </label>\n      <button className=\"del\" onClick={onDelete} aria-label=\"Delete task\">x</button>\n    </div>\n  );\n}\n" },
  '/styles.css': { code: ".app { background: #0D1010; color: #EDE8DC; min-height: 100vh; font-family: system-ui, sans-serif; }\n.header { padding: 12px 20px; border-bottom: 1px solid #232928; background: #101314; }\n.header h1 { font-size: 15px; font-weight: 600; margin: 0; color: #EDE8DC; }\n.header h1 span { color: #7FB39D; }\nmain { max-width: 480px; margin: 28px auto; padding: 0 20px; }\n.count { font-size: 12px; color: #8A9492; margin: 0 0 10px; }\n.card { background: #141819; border: 1px solid #232928; border-radius: 12px; overflow: hidden; }\n.add-row { display: flex; gap: 8px; padding: 12px; border-bottom: 1px solid #232928; }\n.add-row input { flex: 1; background: #0D1010; border: 1px solid #2A3130; color: inherit; padding: 8px 12px; border-radius: 8px; font-size: 13px; outline: none; }\n.add-row input:focus { border-color: #5F8F7B; }\n.add-row button { background: #5F8F7B; color: #0D1010; border: 0; padding: 8px 14px; border-radius: 8px; font-weight: 600; font-size: 13px; cursor: pointer; }\n.todo-item { display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 12px 14px; border-bottom: 1px solid #1B2120; }\n.todo-item label { display: flex; align-items: center; gap: 10px; font-size: 14px; cursor: pointer; }\n.todo-item input[type=checkbox] { accent-color: #5F8F7B; width: 15px; height: 15px; margin: 0; }\n.done { text-decoration: line-through; color: #5A6361; }\n.del { background: none; border: 0; color: #5A6361; font-size: 14px; cursor: pointer; padding: 2px 6px; border-radius: 6px; }\n.del:hover { color: #EDE8DC; background: #1B2120; }\n.clear-row { padding: 10px 14px; text-align: right; }\n.clear-row button { background: none; border: 1px solid #2A3130; color: #8A9492; font-size: 12px; padding: 6px 10px; border-radius: 8px; cursor: pointer; }\n.clear-row button:hover { color: #EDE8DC; border-color: #3A4240; }\n" },
}

const FIXTURE_WORKSPACE = {
  _id: 'fixture-workspace',
  user: 'fixture-user',
  messages: FIXTURE_MESSAGES,
  fileData: FIXTURE_FILES,
}

// Duck-typed stand-in for ConvexReactClient: one-shot query + no-op mutation.
// The workspace components only use convex.query(...) and useMutation(...).
const stubClient = {
  query: async () => FIXTURE_WORKSPACE,
  mutation: async () => null,
}

// A structurally valid but unsigned and clearly fake JWT: lets the app shell's
// session check pass inside this fixture build only. It is accepted by nothing
// real (the backend verifies signatures against Google's keys).
const FAKE_JWT =
  'eyJhbGciOiJOT05FLUZJWFRVUkUtTk9ULUEtVE9LRU4ifQ.eyJuYW1lIjoiRml4dHVyZSBVc2VyIiwiZW1haWwiOiJmaXh0dXJlQGV4YW1wbGUuaW52YWxpZCIsImV4cCI6NDEwMjQ0NDgwMH0.Zml4dHVyZS1ub3QtYS1zaWduYXR1cmU'

// Seed the fixture session at module load (before any provider effect can
// run and redirect): the app shell's session check passes inside this fixture
// build only.
if (typeof window !== 'undefined') {
  localStorage.setItem('codedev.session', JSON.stringify({
    idToken: FAKE_JWT, name: 'Fixture User', email: 'fixture@example.invalid', picture: '', exp: 4102444800,
  }))
}

function FixtureInner() {
  const params = useSearchParams()
  const pane = params.get('pane') === 'ide' ? 'ide' : 'chat'
  const codeTab = params.get('tab') === 'preview' ? 'preview' : 'code'

  const conv = params.get('conv')
  const convMessages = conv === 'short' ? FIXTURE_MESSAGES_SHORT : conv === 'long' ? FIXTURE_MESSAGES_LONG : FIXTURE_MESSAGES
  const messagesState = useMemo(() => ({ messages: convMessages, setMessages: () => {} }), [convMessages])
  const userState = useMemo(() => ({
    userDetails: { _id: 'fixture-user', name: 'Siva Dheeraj', email: 'fixture@example.invalid', picture: '' },
    setUserDetails: () => {},
  }), [])
  const actionState = useMemo(() => ({ action: undefined, setAction: () => {} }), [])
  const [workspaceView, setWorkspaceView] = useState(codeTab)
  const viewState = useMemo(() => ({ workspaceView, setWorkspaceView }), [workspaceView])

  return (
    <ConvexProvider client={stubClient}>
      <UserDetailsContext.Provider value={userState}>
        <ContextMessages.Provider value={messagesState}>
          <ActionContext.Provider value={actionState}>
            <WorkspaceViewContext.Provider value={viewState}>
              <div className='flex h-svh flex-col overflow-hidden'>
                <div id='fixture-banner' className='shrink-0 bg-[#7a5c00] text-[#101314] text-center text-xs font-semibold py-1 px-3'>
                  FIXTURE PREVIEW - synthetic workspace, no backend, no live data
                </div>
                <div className='shrink-0'><Header /></div>
                <div className='min-h-0 flex-1'>
                  <Workspace initialMobilePane={pane} />
                </div>
              </div>
            </WorkspaceViewContext.Provider>
          </ActionContext.Provider>
        </ContextMessages.Provider>
      </UserDetailsContext.Provider>
    </ConvexProvider>
  )
}

export default function FixtureClient() {
  return (
    <Suspense>
      <FixtureInner />
    </Suspense>
  )
}
