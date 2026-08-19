import { mapDownloadErrorMessage } from '@gitdown/core'
import { useCallback, useEffect, useState } from 'react'
import {
  sendExtMessage,
  type Detection,
  type DownloadJobState,
  type ExtRequest,
  type ExtResponse,
} from '../../lib/messages'

export const JOB_POLL_MS = 250

export type SendExtMessage = <T extends ExtRequest>(
  msg: T,
) => Promise<ExtResponse<T['type']>>

export type AppProps = {
  sendMessage?: SendExtMessage
  openOptionsPage?: () => void
  pollMs?: number
}

function defaultOpenOptionsPage() {
  void browser.runtime.openOptionsPage()
}

export default function App({
  sendMessage = sendExtMessage,
  openOptionsPage = defaultOpenOptionsPage,
  pollMs = JOB_POLL_MS,
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
    await sendMessage({ type: 'START_DOWNLOAD', url: detection.url })
    const response = await sendMessage({ type: 'GET_JOB_STATE' })
    setJob(response.state)
  }, [detection, sendMessage])

  const canDownload =
    ready && detection?.ok === true && job.status !== 'running'

  return (
    <main className="popup">
      <header>
        <p className="popup-label">[ Download ]</p>
        <h1 className="popup-wordmark">
          The<span className="popup-wordmark-accent">GitDown</span>
        </h1>
      </header>

      <section className="popup-frame" aria-label="Download">
        <span className="popup-cross popup-cross-tl" aria-hidden="true" />
        <span className="popup-cross popup-cross-tr" aria-hidden="true" />
        <span className="popup-cross popup-cross-bl" aria-hidden="true" />
        <span className="popup-cross popup-cross-br" aria-hidden="true" />

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
          >
            Download
          </button>

          {job.status === 'running' && (
            <p className="popup-progress" aria-live="polite">
              {job.downloaded} / {job.total}
            </p>
          )}

          {job.status === 'done' && (
            <p className="popup-done" aria-live="polite">
              Saved {job.fileName}
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
      </footer>
    </main>
  )
}
