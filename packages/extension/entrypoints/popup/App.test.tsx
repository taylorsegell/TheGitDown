/** @vitest-environment jsdom */
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { mapDownloadErrorMessage } from '@gitdown/core'
import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom/vitest'
import { afterEach, describe, expect, it, vi } from 'vitest'
import App, { JOB_POLL_MS, type SendExtMessage } from './App'
import type {
  Detection,
  DownloadJobState,
  ExtRequest,
  ExtResponse,
} from '../../lib/messages'

const IMAGES_URL =
  'https://github.com/taylorsegell/TheGitDown/tree/master/images'

const notGithub: Detection = {
  ok: false,
  source: 'tab',
  url: 'https://example.com',
  reason: 'not_github',
}

const imagesDir: Detection = {
  ok: true,
  source: 'tab',
  url: IMAGES_URL,
  ref: {
    owner: 'taylorsegell',
    repo: 'TheGitDown',
    ref: 'master',
    path: 'images',
    kind: 'dir',
  },
}

function mockSendExtMessage(options?: {
  detection?: Detection
  state?: DownloadJobState
  hasToken?: boolean
  accepted?: boolean
}): SendExtMessage {
  const detection = options?.detection ?? notGithub
  const state = options?.state ?? ({ status: 'idle' } as const)
  const hasToken = options?.hasToken ?? false
  const accepted = options?.accepted ?? true

  return vi.fn(async (msg: ExtRequest) => {
    switch (msg.type) {
      case 'GET_ACTIVE_DETECTION':
        return { detection } as ExtResponse<'GET_ACTIVE_DETECTION'>
      case 'GET_JOB_STATE':
        return { state } as ExtResponse<'GET_JOB_STATE'>
      case 'AUTH_GET_STATUS':
        return { hasToken } as ExtResponse<'AUTH_GET_STATUS'>
      case 'START_DOWNLOAD':
        return { accepted } as ExtResponse<'START_DOWNLOAD'>
      default:
        throw new Error(`unexpected message ${msg.type}`)
    }
  }) as SendExtMessage
}

async function renderPopup(sendMessage: SendExtMessage) {
  const openOptionsPage = vi.fn()
  const user = userEvent.setup()
  const view = render(
    <App
      sendMessage={sendMessage}
      openOptionsPage={openOptionsPage}
      pollMs={60_000}
    />,
  )
  return { ...view, openOptionsPage, user }
}

describe('popup App', () => {
  afterEach(() => {
    cleanup()
  })

  it('shows empty copy and disables Download when the tab is not GitHub', async () => {
    const sendExtMessage = mockSendExtMessage({ detection: notGithub })
    await renderPopup(sendExtMessage)

    expect(await screen.findByText(/Open a GitHub/)).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Download' })).toBeDisabled()
  })

  it('enables Download and shows owner/repo for the images directory fixture', async () => {
    const sendExtMessage = mockSendExtMessage({ detection: imagesDir })
    await renderPopup(sendExtMessage)

    expect(await screen.findByText('taylorsegell/TheGitDown')).toBeTruthy()
    expect(screen.getByText('images')).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Download' })).toBeEnabled()
  })

  it('shows running progress as downloaded / total', async () => {
    const sendExtMessage = mockSendExtMessage({
      detection: imagesDir,
      state: {
        status: 'running',
        url: IMAGES_URL,
        downloaded: 2,
        total: 5,
      },
    })
    await renderPopup(sendExtMessage)

    const progress = await screen.findByText(/\d+\s*\/\s*\d+/)
    expect(progress.textContent).toMatch(/2\s*\/\s*5/)
    expect(progress.textContent).toContain('2')
    expect(progress.textContent).toContain('5')
  })

  it('maps a rate_limited job failure with mapDownloadErrorMessage', async () => {
    const error = { kind: 'rate_limited' as const, message: '' }
    const sendExtMessage = mockSendExtMessage({
      detection: imagesDir,
      state: {
        status: 'fail',
        url: IMAGES_URL,
        error,
      },
    })
    await renderPopup(sendExtMessage)

    const alert = await screen.findByRole('alert')
    expect(alert.getAttribute('data-testid')).toBe('error')
    expect(alert.textContent).toMatch(/rate/i)
    expect(alert.textContent).toBe(mapDownloadErrorMessage(error))
  })

  it('sends START_DOWNLOAD with the detected URL', async () => {
    const sendExtMessage = mockSendExtMessage({ detection: imagesDir })
    const { user } = await renderPopup(sendExtMessage)

    await screen.findByRole('button', { name: 'Download' })
    await user.click(screen.getByRole('button', { name: 'Download' }))

    await waitFor(() => {
      expect(sendExtMessage).toHaveBeenCalledWith({
        type: 'START_DOWNLOAD',
        url: IMAGES_URL,
      })
    })
  })

  it('opens options from Token settings', async () => {
    const sendExtMessage = mockSendExtMessage({ hasToken: true })
    const { openOptionsPage, user } = await renderPopup(sendExtMessage)

    expect(await screen.findByText('Token saved')).toBeTruthy()
    await user.click(screen.getByRole('button', { name: 'Token settings' }))
    expect(openOptionsPage).toHaveBeenCalledTimes(1)
  })

  it('polls GET_JOB_STATE no faster than 200ms', () => {
    expect(JOB_POLL_MS).toBeGreaterThanOrEqual(200)
  })

  it('specifies popup root width in the 360–380px range', () => {
    const css = readFileSync(
      join(dirname(fileURLToPath(import.meta.url)), 'style.css'),
      'utf8',
    )
    const widths = [...css.matchAll(/(?:^|[^\w-])(?:min-)?width:\s*(\d+)px/g)].map(
      (match) => Number(match[1]),
    )
    const inRange = widths.filter((px) => px >= 360 && px <= 380)
    expect(inRange.length).toBeGreaterThan(0)
    expect(css).toMatch(/\.popup\s*\{[^}]*width:\s*360px/)
  })

  it('does not advertise a site handoff, URL paste, or in-popup download', () => {
    const dir = dirname(fileURLToPath(import.meta.url))
    const sources = ['App.tsx', 'main.tsx', 'index.html', 'style.css'].map(
      (name) => readFileSync(join(dir, name), 'utf8'),
    )
    const joined = sources.join('\n')
    expect(joined).not.toContain(['Open', 'in', 'GitDown'].join(' '))
    expect(joined).not.toMatch(new RegExp(`<${'input'}\\b`))
    expect(readFileSync(join(dir, 'App.tsx'), 'utf8')).not.toContain(
      'download' + 'GitHubPath',
    )
  })
})
