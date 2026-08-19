import type { DownloadError } from './types'

/**
 * Map a domain DownloadError to user-visible copy.
 * Rate-limit messaging must mention rate (case-insensitive) per product contract.
 */
export function mapDownloadErrorMessage(error: DownloadError): string {
  switch (error.kind) {
    case 'rate_limited':
      return (
        'GitHub API rate limit exceeded. ' +
        'Add an optional personal access token, or wait and try again.'
      )
    case 'invalid_url':
      return error.message || 'Invalid GitHub URL'
    case 'not_found':
      return error.message || 'GitHub resource not found'
    case 'network':
      return error.message || 'Network request failed'
    case 'partial':
      return error.message || 'Some files failed to download'
    case 'unknown':
    default:
      return error.message || 'Download failed'
  }
}
