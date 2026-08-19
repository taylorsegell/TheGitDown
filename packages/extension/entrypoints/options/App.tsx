import { useCallback, useEffect, useState, type FormEvent } from 'react'
import {
  sendExtMessage,
  type ExtRequest,
  type ExtResponse,
} from '../../lib/messages'

export type SendExtMessage = <T extends ExtRequest>(
  msg: T,
) => Promise<ExtResponse<T['type']>>

export type AppProps = {
  sendMessage?: SendExtMessage
}

export default function App({
  sendMessage = sendExtMessage,
}: AppProps = {}) {
  const [token, setToken] = useState('')
  const [hasToken, setHasToken] = useState(false)
  const [ready, setReady] = useState(false)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function loadStatus() {
      try {
        const response = await sendMessage({ type: 'AUTH_GET_STATUS' })
        if (!cancelled) {
          setHasToken(response.hasToken)
        }
      } finally {
        if (!cancelled) {
          setReady(true)
        }
      }
    }

    void loadStatus()

    return () => {
      cancelled = true
    }
  }, [sendMessage])

  const refreshStatus = useCallback(async () => {
    const response = await sendMessage({ type: 'AUTH_GET_STATUS' })
    setHasToken(response.hasToken)
  }, [sendMessage])

  const handleSave = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      if (busy) {
        return
      }
      setBusy(true)
      try {
        await sendMessage({ type: 'AUTH_SET_TOKEN', token })
        setToken('')
        await refreshStatus()
      } finally {
        setBusy(false)
      }
    },
    [busy, refreshStatus, sendMessage, token],
  )

  const handleClear = useCallback(async () => {
    if (busy) {
      return
    }
    setBusy(true)
    try {
      await sendMessage({ type: 'AUTH_CLEAR_TOKEN' })
      setToken('')
      await refreshStatus()
    } finally {
      setBusy(false)
    }
  }, [busy, refreshStatus, sendMessage])

  return (
    <main className="options">
      <header>
        <p className="options-label">[ Auth ]</p>
        <h1 className="options-wordmark">
          The<span className="options-wordmark-accent">GitDown</span>
        </h1>
      </header>

      <section className="options-frame" aria-label="GitHub token">
        <span className="options-cross options-cross-tl" aria-hidden="true" />
        <span className="options-cross options-cross-tr" aria-hidden="true" />
        <span className="options-cross options-cross-bl" aria-hidden="true" />
        <span className="options-cross options-cross-br" aria-hidden="true" />

        <p className="options-copy">
          The token stays in this browser’s extension storage and is sent only
          to GitHub (no TheGitDown backend).
        </p>

        <form className="options-form" onSubmit={(event) => void handleSave(event)}>
          <label className="options-field-label" htmlFor="github-token">
            GitHub personal access token
          </label>
          <input
            id="github-token"
            name="github-token"
            type="password"
            className="options-input"
            value={token}
            onChange={(event) => setToken(event.target.value)}
            autoComplete="off"
            spellCheck={false}
            disabled={!ready || busy}
          />

          <div className="options-actions">
            <button
              type="submit"
              className="options-save"
              disabled={!ready || busy}
            >
              Save token
            </button>
            <button
              type="button"
              className="options-clear"
              onClick={() => {
                void handleClear()
              }}
              disabled={!ready || busy}
            >
              Clear token
            </button>
          </div>
        </form>

        <p className="options-status" aria-live="polite">
          {ready ? (hasToken ? 'Token saved' : 'No token saved') : null}
        </p>
      </section>
    </main>
  )
}
