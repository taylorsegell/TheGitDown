import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react'
import { useSearchParams } from 'react-router-dom'
import brandMark from '../../images/TheGitDown.svg'
import espressoMark from '../../images/espresso.svg'
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
  const [brandMarkFailed, setBrandMarkFailed] = useState(false)

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
      <header className="home-hero">
        <h1 className="home-brand">
          {brandMarkFailed ? (
            <span className="home-brand-text">TheGitDown</span>
          ) : (
            <img
              className="home-brand-mark"
              src={brandMark}
              alt="TheGitDown"
              width={828}
              height={149}
              onError={() => setBrandMarkFailed(true)}
            />
          )}
        </h1>
        <p className="home-tagline">
          Paste a GitHub file or directory URL to download a zip or share a link.
        </p>
      </header>

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
            className="home-btn home-btn-primary"
            onClick={handleDownload}
            disabled={isProcessing}
          >
            Download
          </button>
          <button
            type="button"
            className="home-btn"
            onClick={handleCreateLink}
            disabled={isProcessing}
          >
            Create Link
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

      <footer className="home-footer">
        <nav className="home-footer-links" aria-label="Credits">
          <a
            className="home-footer-link"
            href="https://github.com/taylorsegell"
            target="_blank"
            rel="noreferrer"
            aria-label="GitHub"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 496 512" aria-hidden="true">
              <path d="M165.9 397.4c0 2-2.3 3.6-5.2 3.6-3.3.3-5.6-1.3-5.6-3.6 0-2 2.3-3.6 5.2-3.6 3-.3 5.6 1.3 5.6 3.6zm-31.1-4.5c-.7 2 1.3 4.3 4.3 4.9 2.6 1 5.6 0 6.2-2s-1.3-4.3-4.3-5.2c-2.6-.7-5.5.3-6.2 2.3zm44.2-1.7c-2.9.7-4.9 2.6-4.6 4.9.3 2 2.9 3.3 5.9 2.6 2.9-.7 4.9-2.6 4.6-4.6-.3-1.9-3-3.2-5.9-2.9zM244.8 8C106.1 8 0 113.3 0 252c0 110.9 69.8 205.8 169.5 239.2 12.8 2.3 17.3-5.6 17.3-12.1 0-6.2-.3-40.4-.3-61.4 0 0-70 15-84.7-29.8 0 0-11.4-29.1-27.8-36.6 0 0-22.9-15.7 1.6-15.4 0 0 24.9 2 38.6 25.8 21.9 38.6 58.6 27.5 72.9 20.9 2.3-16 8.8-27.1 16-33.7-55.9-6.2-112.3-14.3-112.3-110.5 0-27.5 7.6-41.3 23.6-58.9-2.6-6.5-11.1-33.3 2.6-67.9 20.9-6.5 69 27 69 27 20-5.6 41.5-8.5 62.8-8.5s42.8 2.9 62.8 8.5c0 0 48.1-33.6 69-27 13.7 34.7 5.2 61.4 2.6 67.9 16 17.7 25.8 31.5 25.8 58.9 0 96.5-58.9 104.2-114.8 110.5 9.2 7.9 17 22.9 17 46.4 0 33.7-.3 75.4-.3 83.6 0 6.5 4.6 14.4 17.3 12.1C428.2 457.8 496 362.9 496 252 496 113.3 383.5 8 244.8 8zM97.2 352.9c-1.3 1-1 3.3.7 5.2 1.6 1.6 3.9 2.3 5.2 1 1.3-1 1-3.3-.7-5.2-1.6-1.6-3.9-2.3-5.2-1zm-10.8-8.1c-.7 1.3.3 2.9 2.3 3.9 1.6 1 3.6.7 4.3-.7.7-1.3-.3-2.9-2.3-3.9-2-.6-3.6-.3-4.3.7zm32.4 35.6c-1.6 1.3-1 4.3 1.3 6.2 2.3 2.3 5.2 2.6 6.5 1 1.3-1.3.7-4.3-1.3-6.2-2.2-2.3-5.2-2.6-6.5-1zm-11.4-14.7c-1.6 1-1.6 3.6 0 5.9 1.6 2.3 4.3 3.3 5.6 2.3 1.6-1.3 1.6-3.9 0-6.2-1.4-2.3-4-3.3-5.6-2z" />
            </svg>
          </a>
          <a
            className="home-footer-link"
            href="https://linkedin.com/in/segell"
            target="_blank"
            rel="noreferrer"
            aria-label="LinkedIn"
          >
            <svg viewBox="0 0 992 992" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path d="M95.1771 358.404H271.888V889H95.1771V358.404ZM184.612 103C124.629 103 85 142.629 85 194.594C85 245.428 123.036 286.136 182.453 286.136H183.533C245.109 286.136 283.659 245.428 283.145 194.594C282.579 142.629 245.109 103 184.612 103ZM704.466 346.068C610.456 346.068 568.617 397.57 545.436 433.909V358.404H369.29C369.29 358.404 371.449 408.21 369.29 889H545.436V592.888C545.436 576.851 547.081 561.277 551.296 549.558C564.197 517.948 593.032 485.309 641.861 485.309C705.494 485.309 731.194 534.036 731.194 605.224V889H907.391V584.87C907.391 422.088 820.629 346.068 704.466 346.068Z" />
            </svg>
          </a>
          <a
            className="home-footer-link"
            href="https://taylorsegell.com"
            target="_blank"
            rel="noreferrer"
            aria-label="taylorsegell.com"
          >
            <svg viewBox="0 0 992 992" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M243 203.9L285.3 179.5L327.2 155.3L369.5 130.9L411.4 106.7L453.8 82.2L495.7 58L538 82.5L579.9 106.7L622.3 131.1L664.2 155.3L706.5 179.8L748.4 203.9L790.8 228.4V325.7L748.4 301.2L706.5 277L664.2 252.6L622.3 228.4L579.9 203.9L538 179.8V277L579.9 301.2L622.3 325.7L664.2 349.9L706.5 374.3L748.4 398.5L790.8 423V520.2L748.4 495.8L706.5 471.6L664.2 447.2L622.3 423L579.9 398.5L538 374.3V666.2L579.9 690.4L622.3 714.8L664.2 739L706.5 714.6V666.2L664.2 641.7L622.3 617.5L559.7 581.4V484.1L579.9 495.8L622.3 520.2L664.2 544.4L706.5 568.9L748.4 593.1L790.8 617.5V763.2L748.4 787.6L706.5 811.8L664.2 836.3L622.3 812.1L579.9 787.6L538 763.5V860.7L579.9 884.9L538 909.1L495.7 933.6L453.8 909.4L411.5 884.9L453.8 860.5V568.6L411.4 593.1L369.5 617.3L327.2 641.7L285.3 665.9L243 690.4L201 714.6V422.7L243 398.5L285.3 374.1L327.2 349.9L369.5 325.4L411.4 301.2L432.2 289.3V386.6L411.4 398.5L369.5 422.7L327.2 447.2L285.3 471.3V568.6L327.2 544.4L369.5 520L411.5 495.8L453.8 471.3V179.5L411.5 203.9L369.5 228.1L327.2 252.6L285.3 276.8L243 301.2L201 325.4V228.1L243 203.9ZM432.3 678.4V775.7L411.5 787.6L369.6 811.8L327.3 836.3L285.4 812.1L243 787.6L285.4 763.2L327.3 739L369.6 714.5L411.5 690.4L432.3 678.4Z"
              />
            </svg>
          </a>
        </nav>

        <a
          className="home-footer-coffee"
          href="https://www.buymeacoffee.com/segell"
          target="_blank"
          rel="noreferrer"
        >
          <img src={espressoMark} alt="Buy Me A Coffee" width={217} height={60} />
        </a>

        <p className="home-footer-copy">
          <a
            href="https://github.com/Taylorsegell/TheGitDown"
            target="_blank"
            rel="noreferrer"
          >
            TheGitDown
          </a>{' '}
          by{' '}
          <a href="https://github.com/taylorsegell" target="_blank" rel="noreferrer">
            Taylor Segell
          </a>
        </p>
      </footer>
    </main>
  )
}
