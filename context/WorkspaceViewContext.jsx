"use client"
import { createContext } from 'react'

// Shared view state for the authenticated workspace: the top bar's segmented
// Code/Preview switch and the page's panes read the same value.
export const WorkspaceViewContext = createContext()
