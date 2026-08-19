import { useState, type KeyboardEvent } from 'react'
import type { CredentialStore } from '@gitdown/core'

export type TokenSettingsProps = {
  credentials: CredentialStore
}

function maskToken(token: string): string {
  if (token.length <= 4) {
    return '••••'
  }
  return `••••••••${token.slice(-4)}`
}

export function TokenSettings({ credentials }: TokenSettingsProps) {
  const existing = credentials.getToken()
  const [draft, setDraft] = useState('')
  const [savedToken, setSavedToken] = useState<string | null>(existing)
  const [status, setStatus] = useState<string | null>(
    existing != null ? 'Token saved' : null,
  )

  function handleSave() {
    const trimmed = draft.trim()
    if (trimmed === '') {
      setStatus('Enter a token to save')
      return
    }

    credentials.setToken(trimmed)
    const stored = credentials.getToken()
    setSavedToken(stored)
    setDraft('')
    setStatus(stored != null ? 'Token saved' : null)
  }

  function handleClear() {
    credentials.clearToken()
    setSavedToken(null)
    setDraft('')
    setStatus(null)
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter') {
      event.preventDefault()
      handleSave()
    }
  }

  return (
    <div className="token-settings" role="group" aria-labelledby="token-settings-heading">
      <h2 id="token-settings-heading" className="token-settings-heading">
        Optional GitHub token
      </h2>
      <p className="token-settings-help">
        Stored only in this browser. Raises GitHub API rate limits for larger
        trees — TheGitDown has no server.
      </p>

      <label className="visually-hidden" htmlFor="github-token">
        Personal access token
      </label>
      <input
        id="github-token"
        name="github-token"
        type="password"
        className="token-settings-input"
        placeholder="ghp_… or github_pat_…"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={handleKeyDown}
        autoComplete="off"
        spellCheck={false}
      />

      <div className="token-settings-actions">
        <button type="button" className="home-btn" onClick={() => handleSave()}>
          Save token
        </button>
        <button
          type="button"
          className="home-btn"
          onClick={handleClear}
          disabled={savedToken == null}
        >
          Clear
        </button>
      </div>

      {savedToken != null && (
        <p className="token-settings-status" aria-live="polite" data-testid="token-saved">
          {status ?? 'Token saved'} ({maskToken(savedToken)})
        </p>
      )}

      {savedToken == null && status != null && (
        <p className="token-settings-status" aria-live="polite">
          {status}
        </p>
      )}
    </div>
  )
}
