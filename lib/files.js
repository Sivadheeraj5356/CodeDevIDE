// Merge AI-generated files over the default template.
// Generated entries win on key conflicts; defaults fill everything else.
export function mergeFiles(defaultFiles, generatedFiles) {
  return { ...(defaultFiles || {}), ...(generatedFiles || {}) };
}
