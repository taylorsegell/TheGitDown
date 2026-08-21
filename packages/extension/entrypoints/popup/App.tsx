import { mapDownloadErrorMessage } from '@gitdown/core'
import { useCallback, useEffect, useState } from 'react'
import {
  sendExtMessage,
  type Detection,
  type DownloadJobState,
  type ExtRequest,
  type ExtResponse,
} from '../../lib/messages'
import { withZipExtension, zipFileNameFor } from '../../lib/zipFileName'
import { waitForSavePortHost } from '../../lib/installSavePortHost'

export const JOB_POLL_MS = 250

export type SendExtMessage = <T extends ExtRequest>(
  msg: T,
) => Promise<ExtResponse<T['type']>>

export type AppProps = {
  sendMessage?: SendExtMessage
  openOptionsPage?: () => void
  pollMs?: number
  waitForSavePort?: () => Promise<void>
}

function defaultOpenOptionsPage() {
  void browser.runtime.openOptionsPage()
}

export default function App({
  sendMessage = sendExtMessage,
  openOptionsPage = defaultOpenOptionsPage,
  pollMs = JOB_POLL_MS,
  waitForSavePort = waitForSavePortHost,
}: AppProps = {}) {
  const [detection, setDetection] = useState<Detection | null>(null)
  const [job, setJob] = useState<DownloadJobState>({ status: 'idle' })
  const [hasToken, setHasToken] = useState(false)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let cancelled = false
    let intervalId: ReturnType<typeof setInterval> | undefined

    async function readJob() {
      const response = await sendMessage({ type: 'GET_JOB_STATE' })
      if (!cancelled) {
        setJob(response.state)
      }
    }

    async function bootstrap() {
      try {
        const [detectionRes, jobRes, authRes] = await Promise.all([
          sendMessage({ type: 'GET_ACTIVE_DETECTION' }),
          sendMessage({ type: 'GET_JOB_STATE' }),
          sendMessage({ type: 'AUTH_GET_STATUS' }),
        ])
        if (cancelled) {
          return
        }
        setDetection(detectionRes.detection)
        setJob(jobRes.state)
        setHasToken(authRes.hasToken)
      } finally {
        if (!cancelled) {
          setReady(true)
        }
      }

      if (cancelled) {
        return
      }
      intervalId = setInterval(() => {
        void readJob()
      }, pollMs)
    }

    void bootstrap()

    return () => {
      cancelled = true
      if (intervalId !== undefined) {
        clearInterval(intervalId)
      }
    }
  }, [pollMs, sendMessage])

  const handleDownload = useCallback(async () => {
    if (detection == null || !detection.ok) {
      return
    }
    try {
      await waitForSavePort()
    } catch {
      setJob({
        status: 'fail',
        url: detection.url,
        error: {
          kind: 'unknown',
          message: 'Download save service is unavailable. Reopen the GitDown popup and try again.',
        },
      })
      return
    }
    await sendMessage({ type: 'START_DOWNLOAD', url: detection.url })
    const response = await sendMessage({ type: 'GET_JOB_STATE' })
    setJob(response.state)
  }, [detection, sendMessage, waitForSavePort])

  const canDownload =
    ready && detection?.ok === true && job.status !== 'running'
  const zipName =
    detection?.ok === true ? zipFileNameFor(detection.ref) : null
  const progressMax = job.status === 'running' ? job.total : 0
  const progressNow = job.status === 'running' ? job.downloaded : 0
  const progressPct =
    progressMax > 0 ? Math.min(100, (progressNow / progressMax) * 100) : 0

  return (
    <main className="popup">
      <header className="popup-brand">
        <img
          className="popup-logo"
          src="/logo.svg"
          alt=""
          width={36}
          height={36}
        />
        <h1 className="popup-wordmark">
          The<span className="popup-wordmark-accent">GitDown</span>
        </h1>
      </header>

      <section className="popup-frame" aria-label="Download">
        <span className="popup-cross popup-cross-tl" aria-hidden="true" />
        <span className="popup-cross popup-cross-tr" aria-hidden="true" />
        <span className="popup-cross popup-cross-bl" aria-hidden="true" />
        <span className="popup-cross popup-cross-br" aria-hidden="true" />

        <p className="popup-label">[ Download ]</p>

        {ready && detection?.ok === true ? (
          <div className="popup-target">
            <p className="popup-repo">
              {detection.ref.owner}/{detection.ref.repo}
            </p>
            {detection.ref.path !== '' && (
              <p className="popup-path">{detection.ref.path}</p>
            )}
          </div>
        ) : ready ? (
          <p className="popup-empty">Open a GitHub file or folder</p>
        ) : null}

        <div className="popup-controls">
          <button
            type="button"
            className="popup-download"
            onClick={() => {
              void handleDownload()
            }}
            disabled={!canDownload}
            aria-busy={job.status === 'running'}
          >
            {zipName ? `Download ${zipName}` : 'Download'}
          </button>

          {job.status === 'running' && (
            <div className="popup-progress" aria-live="polite">
              <p className="popup-progress-label">
                {progressMax > 0
                  ? `${progressNow} / ${progressMax}`
                  : 'Starting…'}
              </p>
              <div
                className="popup-meter"
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={progressMax > 0 ? progressMax : 1}
                aria-valuenow={progressNow}
              >
                <span
                  className="popup-meter-fill"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>
          )}

          {job.status === 'done' && (
            <p className="popup-done" aria-live="polite">
              Saved {withZipExtension(job.fileName)}
            </p>
          )}

          {job.status === 'fail' && (
            <p className="popup-error" role="alert" data-testid="error">
              {mapDownloadErrorMessage(job.error)}
            </p>
          )}
        </div>
      </section>

      <footer className="popup-auth">
        <p className="popup-label">[ Auth ]</p>
        <div className="popup-auth-row">
          <p className="popup-token-status">
            {hasToken ? 'Token saved' : 'No token saved'}
          </p>
          <button
            type="button"
            className="popup-options"
            onClick={openOptionsPage}
          >
            Token settings
          </button>
        </div>
      </footer>
    </main>
  )
}
