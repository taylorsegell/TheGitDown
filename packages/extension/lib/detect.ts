import { parseGitHubUrl } from '@gitdown/core'
import type { Detection } from './messages'

export type { Detection }

export function detectGithubUrl(
  url: string | null | undefined,
  source: Detection['source'],
): Detection {
  if (url == null || url.trim() === '') {
    return { ok: false, source, url: url ?? null, reason: 'not_github' }
  }

  let parsed: URL
  try {
    parsed = new URL(url)
  } catch {
    return { ok: false, source, url, reason: 'not_github' }
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return { ok: false, source, url, reason: 'not_github' }
  }

  const host = parsed.hostname.toLowerCase()
  if (host !== 'github.com' && host !== 'www.github.com') {
    return { ok: false, source, url, reason: 'not_github' }
  }

  const result = parseGitHubUrl(url)
  if ('ok' in result && result.ok === false) {
    return { ok: false, source, url, reason: 'invalid_url' }
  }

  return { ok: true, source, url, ref: result }
}
