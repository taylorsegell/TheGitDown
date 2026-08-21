import { saveZipBlobInPage } from './saveZipInPage'
import {
  SAVE_PORT_NAME,
  SAVE_PORT_READY,
  SAVE_ZIP,
  SAVE_ZIP_RESULT,
  type SaveZipRequest,
} from './savePort'

function isSaveZipRequest(message: unknown): message is SaveZipRequest {
  if (typeof message !== 'object' || message === null) {
    return false
  }
  const record = message as SaveZipRequest
  return (
    record.type === SAVE_ZIP &&
    typeof record.requestId === 'string' &&
    typeof record.fileName === 'string' &&
    record.buffer instanceof ArrayBuffer
  )
}

function isSavePortReady(message: unknown): boolean {
  return (
    typeof message === 'object' &&
    message !== null &&
    (message as { type?: unknown }).type === SAVE_PORT_READY
  )
}

let readyPromise: Promise<void> | undefined

/**
 * Wait until the background service worker has accepted this page's save port.
 * The popup waits before starting a job so its blob-URL save path cannot race
 * the service worker and silently fall back to a data URL.
 */
export function waitForSavePortHost(): Promise<void> {
  return readyPromise ?? Promise.resolve()
}

/** Popup / offscreen: accept zip bytes over a port and save with a real blob URL. */
export function installSavePortHost(): void {
  const runtime = globalThis.chrome?.runtime ?? globalThis.browser?.runtime
  if (!runtime?.connect) {
    return
  }

  const port = runtime.connect({ name: SAVE_PORT_NAME })
  readyPromise = new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error('Save service did not become ready'))
    }, 1_000)

    port.onDisconnect?.addListener(() => {
      clearTimeout(timeout)
      reject(new Error('Save service disconnected'))
    })

    port.onMessage.addListener((message: unknown) => {
      if (isSavePortReady(message)) {
        clearTimeout(timeout)
        resolve()
      }
    })
  })

  port.onMessage.addListener((message: unknown) => {
    if (!isSaveZipRequest(message)) {
      return
    }

    void (async () => {
      try {
        const blob = new Blob([message.buffer], { type: 'application/zip' })
        const id = await saveZipBlobInPage(blob, message.fileName)
        port.postMessage({
          type: SAVE_ZIP_RESULT,
          requestId: message.requestId,
          ok: true,
          id,
        })
      } catch (err) {
        port.postMessage({
          type: SAVE_ZIP_RESULT,
          requestId: message.requestId,
          ok: false,
          error: err instanceof Error ? err.message : String(err),
        })
      }
    })()
  })
}
