import type { DownloadError } from './types'

/**
 * Map a domain DownloadError to user-visible copy.
 * Rate-limit messaging must mention rate (case-insensitive) per product contract.
 */
export function mapDownloadErrorMessage(error: DownloadError): string {
  switch (error.kind) {
    case 'rate_limited':
      return (
        'GitHub hit the rate limit. ' +
        'Add a personal access token, or wait and try again.'
      )
    case 'invalid_url':
      return error.message || 'Invalid GitHub URL'
    case 'not_found':
      return (
        'GitHub returned 404. The path may be wrong, or this repository is private. ' +
        'Add a personal access token in Token settings.'
      )
    case 'network':
      return error.message || 'Network request failed'
    case 'partial':
      return error.message || 'Some files failed to download'
    case 'unknown':
    default:
      return error.message || 'Download failed'
  }
}
