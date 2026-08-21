import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  bindSavePort,
  clearSavePortForTests,
  saveBlobViaPort,
  SAVE_PORT_NAME,
  SAVE_PORT_READY,
  SAVE_ZIP,
} from './savePort'

describe('saveBlobViaPort', () => {
  afterEach(() => {
    clearSavePortForTests()
  })
  it('posts zip bytes and resolves when the host replies', async () => {
    const listeners: Array<(message: unknown) => void> = []
    const port = {
      postMessage: vi.fn(),
      onMessage: {
        addListener: (listener: (message: unknown) => void) => {
          listeners.push(listener)
        },
        removeListener: (listener: (message: unknown) => void) => {
          const index = listeners.indexOf(listener)
          if (index >= 0) {
            listeners.splice(index, 1)
          }
        },
      },
      onDisconnect: {
        addListener: vi.fn(),
      },
    }

    bindSavePort(port)

    expect(port.postMessage).toHaveBeenCalledWith({ type: SAVE_PORT_READY })
    port.postMessage.mockClear()

    const blob = new Blob(['zip-bytes'], { type: 'application/zip' })
    const promise = saveBlobViaPort(blob, 'op-session.zip')

    await vi.waitFor(() => {
      expect(port.postMessage).toHaveBeenCalledOnce()
    })
    const request = port.postMessage.mock.calls[0]![0] as {
      type: string
      requestId: string
      fileName: string
      buffer: ArrayBuffer
    }
    expect(request.type).toBe(SAVE_ZIP)
    expect(request.fileName).toBe('op-session.zip')
    expect(request.buffer).toBeInstanceOf(ArrayBuffer)
    expect(request.buffer.byteLength).toBeGreaterThan(0)

    for (const listener of listeners) {
      listener({
        type: 'SAVE_ZIP_RESULT',
        requestId: request.requestId,
        ok: true,
        id: 42,
      })
    }

    await expect(promise).resolves.toBe(42)
  })
})

describe('SAVE_PORT_NAME', () => {
  it('uses a stable port name', () => {
    expect(SAVE_PORT_NAME).toBe('gitdown-save')
  })
})
