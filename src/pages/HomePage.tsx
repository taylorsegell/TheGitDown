import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  createLocalStorageCredentialStore,
  type CredentialStore,
} from '../domain/credentials'
import { downloadGitHubPath } from '../domain/download'
import { createGitHubHttp } from '../domain/githubHttp'
import { parseGitHubUrl } from '../domain/githubUrl'
import type { DownloadParams } from '../domain/types'
import { mapDownloadErrorMessage } from '../ui/downloadErrorMessage'
import { saveBlob } from '../ui/saveBlob'
import { buildShareLink } from '../ui/shareLink'
import { TokenSettings } from '../ui/TokenSettings'

/** Shared with downloads + TokenSettings so PAT changes apply immediately. */
const credentialStore: CredentialStore = createLocalStorageCredentialStore()

type ProgressState = { downloaded: number; total: number }

function paramsFromQuery(
  url: string,
  fileName: string | null,
  rootDirectory: string | null,
): DownloadParams {
  const params: DownloadParams = { url }
  if (fileName != null && fileName !== '') {
    params.fileName = fileName
  }
  if (rootDirectory != null && rootDirectory !== '') {
    params.rootDirectory = rootDirectory
  }
  return params
}

export function HomePage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const urlFromQuery = searchParams.get('url')
  const fileNameFromQuery = searchParams.get('fileName')
  const rootDirectoryFromQuery = searchParams.get('rootDirectory')

  const [urlInput, setUrlInput] = useState(urlFromQuery ?? '')
  const [shareLink, setShareLink] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState<ProgressState | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const http = useMemo(
    () => createGitHubHttp({ credentials: credentialStore }),
    [],
  )

  const runIdRef = useRef(0)

  const startDownload = useCallback(
    async (params: DownloadParams) => {
      const runId = ++runIdRef.current

      setError(null)
      setShareLink('')
      setProgress(null)
      setIsProcessing(true)

      try {
        for await (const event of downloadGitHubPath(params, { http })) {
          if (runId !== runIdRef.current) {
            return
          }

          if (event.type === 'progress') {
            setProgress({
              downloaded: event.downloaded,
              total: event.total,
            })
          } else if (event.type === 'redirect') {
            setIsProcessing(false)
            window.location.assign(event.url)
            return
          } else if (event.type === 'done') {
            saveBlob(event.blob, event.fileName)
            setIsProcessing(false)
            setProgress(null)
            return
          } else if (event.type === 'fail') {
            setError(mapDownloadErrorMessage(event.error))
            setIsProcessing(false)
            setProgress(null)
            return
          }
        }
      } catch (err) {
        if (runId !== runIdRef.current) {
          return
        }
        const message =
          err instanceof Error ? err.message : 'Download failed unexpectedly'
        setError(message)
        setIsProcessing(false)
        setProgress(null)
      }
    },
    [http],
  )

  // Deep-link: `#/home?url=…` (plus optional fileName / rootDirectory) auto-starts download.
  useEffect(() => {
    if (!urlFromQuery) {
      return
    }

    setUrlInput(urlFromQuery)
    void startDownload(
      paramsFromQuery(urlFromQuery, fileNameFromQuery, rootDirectoryFromQuery),
    )

    return () => {
      runIdRef.current += 1
    }
  }, [urlFromQuery, fileNameFromQuery, rootDirectoryFromQuery, startDownload])

  function handleDownload() {
    const githubUrl = urlInput.trim()
    if (!githubUrl) {
      setError('Enter a GitHub file or directory URL')
      return
    }

    const parsed = parseGitHubUrl(githubUrl)
    if ('ok' in parsed && parsed.ok === false) {
      setError(mapDownloadErrorMessage(parsed.error))
      return
    }

    const next = new URLSearchParams()
    next.set('url', githubUrl)
    if (fileNameFromQuery != null && fileNameFromQuery !== '') {
      next.set('fileName', fileNameFromQuery)
    }
    if (rootDirectoryFromQuery != null && rootDirectoryFromQuery !== '') {
      next.set('rootDirectory', rootDirectoryFromQuery)
    }

    // fileName / rootDirectory are preserved from the current query unchanged,
    // so URL equality alone tells us whether the effect will re-fire.
    const alreadySynced = searchParams.get('url') === githubUrl

    setSearchParams(next, { replace: true })

    // If hash query already matches, the effect will not re-run — start here.
    if (alreadySynced) {
      void startDownload(
        paramsFromQuery(githubUrl, fileNameFromQuery, rootDirectoryFromQuery),
      )
    }
  }

  function handleCreateLink() {
    const githubUrl = urlInput.trim()
    if (!githubUrl) {
      setError('Enter a GitHub file or directory URL')
      setShareLink('')
      return
    }

    const parsed = parseGitHubUrl(githubUrl)
    if ('ok' in parsed && parsed.ok === false) {
      setError(mapDownloadErrorMessage(parsed.error))
      setShareLink('')
      return
    }

    setError(null)
    setShareLink(buildShareLink(window.location.origin, githubUrl))
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter') {
      event.preventDefault()
      handleDownload()
    }
  }

  return (
    <main className="home-page">
      <h1 className="home-brand">TheGitDown</h1>
      <p className="home-tagline">Create GitHub Resource Download Link</p>

      <div className="home-controls">
        <label className="home-url-label" htmlFor="github-url">
          GitHub URL
        </label>
        <input
          id="github-url"
          name="url"
          type="url"
          className="home-url-input"
          placeholder="GitHub File or Directory Link"
          value={urlInput}
          onChange={(e) => setUrlInput(e.target.value)}
          onKeyDown={handleKeyDown}
          autoComplete="off"
          spellCheck={false}
        />

        <div className="home-actions">
          <button
            type="button"
            className="home-btn"
            onClick={handleCreateLink}
            disabled={isProcessing}
          >
            Create Download Link
          </button>
          <button
            type="button"
            className="home-btn home-btn-primary"
            onClick={handleDownload}
            disabled={isProcessing}
          >
            Download
          </button>
        </div>

        {isProcessing && progress != null && (
          <p className="home-progress" aria-live="polite">
            Downloaded {progress.downloaded} of {progress.total} files
          </p>
        )}

        {isProcessing && progress == null && (
          <p className="home-progress" aria-live="polite">
            Starting download…
          </p>
        )}

        {error != null && (
          <p className="home-error" role="alert">
            {error}
          </p>
        )}

        {shareLink !== '' && (
          <textarea
            className="home-share-link"
            readOnly
            value={shareLink}
            aria-label="Shareable download link"
            rows={3}
          />
        )}
      </div>

      <TokenSettings credentials={credentialStore} />
    </main>
  )
}
