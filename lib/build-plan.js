// Parse the assistant's build plan into structured file steps.
// A plan entry is a LIST line whose first token is a bold file path, e.g.
// "- **components/TodoList.js** - state for the list". Bold file names
// mentioned mid-sentence ("Updated **App.js**") are not a plan.
const PLAN_LINE_RE = /^[ \t]*[-*•]?[ \t]*\*\*([A-Za-z0-9_\-./]+\.(?:js|jsx|ts|tsx|css|html|json))\*\*[ \t]*(?:[-–—:][ \t]*(.*))?[ \t]*$/

export const parsePlanFiles = (messages) => {
  // The plan is stated once, early; later turns only reference files. Scan
  // oldest-first and take the first real plan so follow-up messages do not
  // hide it.
  for (const msg of messages ?? []) {
    if (msg?.role !== 'ai' || !msg?.content) continue
    const files = []
    for (const line of msg.content.split('\n')) {
      const m = PLAN_LINE_RE.exec(line)
      if (m) files.push({ path: m[1], note: (m[2] || '').trim() })
    }
    if (files.length) return files
  }
  return []
}

// Remove the plan lines from a message body so the structured card can show
// them instead (avoids showing the same list twice).
export const stripPlanLines = (content, files) =>
  (content ?? '')
    .split('\n')
    .filter((line) => !files.some((f) => line.includes(`**${f.path}**`)))
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
