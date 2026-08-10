/**
 * Build a shareable deep-link for the current origin.
 * Uses HashRouter path `/#/home?url=…`.
 */
export function buildShareLink(origin: string, githubUrl: string): string {
  const base = origin.replace(/\/$/, '')
  return `${base}/#/home?url=${encodeURIComponent(githubUrl)}`
}
