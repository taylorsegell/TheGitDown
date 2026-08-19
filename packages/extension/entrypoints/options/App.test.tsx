/** @vitest-environment jsdom */
import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom/vitest'
import { afterEach, describe, expect, it, vi } from 'vitest'
import App, { type SendExtMessage } from './App'
import type { ExtRequest, ExtResponse } from '../../lib/messages'

function mockSendExtMessage(options?: { hasToken?: boolean }): SendExtMessage {
  let hasToken = options?.hasToken ?? false

  return vi.fn(async (msg: ExtRequest) => {
    switch (msg.type) {
      case 'AUTH_GET_STATUS':
        return { hasToken } as ExtResponse<'AUTH_GET_STATUS'>
      case 'AUTH_SET_TOKEN':
        hasToken = msg.token.trim() !== ''
        return { ok: true } as ExtResponse<'AUTH_SET_TOKEN'>
      case 'AUTH_CLEAR_TOKEN':
        hasToken = false
        return { ok: true } as ExtResponse<'AUTH_CLEAR_TOKEN'>
      default:
        throw new Error(`unexpected message ${msg.type}`)
    }
  }) as SendExtMessage
}

async function renderOptions(sendMessage: SendExtMessage) {
  const user = userEvent.setup()
  const view = render(<App sendMessage={sendMessage} />)
  await waitFor(() => {
    expect(screen.getByRole('button', { name: 'Save token' })).toBeEnabled()
  })
  return { ...view, user }
}

describe('options App', () => {
  afterEach(() => {
    cleanup()
  })

  it('shows Save token and Clear token', async () => {
    await renderOptions(mockSendExtMessage())

    expect(screen.getByRole('button', { name: 'Save token' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Clear token' })).toBeTruthy()
  })

  it('saves via AUTH_SET_TOKEN then clears the input', async () => {
    const sendMessage = mockSendExtMessage()
    const { user } = await renderOptions(sendMessage)
    const input = screen.getByLabelText('GitHub personal access token')

    await user.type(input, 'ghp_test_token')
    expect(input).toHaveValue('ghp_test_token')

    await user.click(screen.getByRole('button', { name: 'Save token' }))

    await waitFor(() => {
      expect(sendMessage).toHaveBeenCalledWith({
        type: 'AUTH_SET_TOKEN',
        token: 'ghp_test_token',
      })
    })
    expect(input).toHaveValue('')
    expect(await screen.findByText('Token saved')).toBeTruthy()
    expect(screen.queryByDisplayValue('ghp_test_token')).toBeNull()
  })

  it('clears via AUTH_CLEAR_TOKEN', async () => {
    const sendMessage = mockSendExtMessage({ hasToken: true })
    const { user } = await renderOptions(sendMessage)

    expect(await screen.findByText('Token saved')).toBeTruthy()
    await user.click(screen.getByRole('button', { name: 'Clear token' }))

    await waitFor(() => {
      expect(sendMessage).toHaveBeenCalledWith({ type: 'AUTH_CLEAR_TOKEN' })
    })
    expect(await screen.findByText('No token saved')).toBeTruthy()
  })

  it('loads AUTH_GET_STATUS into No token saved vs Token saved', async () => {
    const empty = mockSendExtMessage({ hasToken: false })
    const { unmount } = await renderOptions(empty)

    expect(empty).toHaveBeenCalledWith({ type: 'AUTH_GET_STATUS' })
    expect(await screen.findByText('No token saved')).toBeTruthy()
    unmount()

    const saved = mockSendExtMessage({ hasToken: true })
    await renderOptions(saved)

    expect(saved).toHaveBeenCalledWith({ type: 'AUTH_GET_STATUS' })
    expect(await screen.findByText('Token saved')).toBeTruthy()
  })
})
