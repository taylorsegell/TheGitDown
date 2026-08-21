export const SAVE_PORT_NAME = 'gitdown-save' as const
export const SAVE_PORT_READY = 'SAVE_PORT_READY' as const
export const SAVE_ZIP = 'SAVE_ZIP' as const
export const SAVE_ZIP_RESULT = 'SAVE_ZIP_RESULT' as const

export type SaveZipRequest = {
  type: typeof SAVE_ZIP
  requestId: string
  fileName: string
  buffer: ArrayBuffer
}

export type SaveZipResult =
  | { type: typeof SAVE_ZIP_RESULT; requestId: string; ok: true; id: number }
  | {
      type: typeof SAVE_ZIP_RESULT
      requestId: string
      ok: false
      error: string
    }

export type SavePortReady = { type: typeof SAVE_PORT_READY }

export type SavePortMessage = SaveZipRequest | SaveZipResult | SavePortReady

type SaveRuntimePort = {
  postMessage: (message: SavePortMessage) => void
  onMessage: {
    addListener: (listener: (message: SavePortMessage) => void) => void
    removeListener: (listener: (message: SavePortMessage) => void) => void
  }
  onDisconnect: {
    addListener: (listener: () => void) => void
  }
}

let activePort: SaveRuntimePort | null = null

export function bindSavePort(port: SaveRuntimePort): void {
  activePort = port
  port.postMessage({ type: SAVE_PORT_READY })
  port.onDisconnect.addListener(() => {
    if (activePort === port) {
      activePort = null
    }
  })
}

export function clearSavePortForTests(): void {
  activePort = null
}

export function hasSavePort(): boolean {
  return activePort !== null
}

export async function saveBlobViaPort(
  blob: Blob,
  fileName: string,
): Promise<number> {
  if (!activePort) {
    throw new Error('no save port connected')
  }

  const requestId = crypto.randomUUID()
  const buffer =
    typeof blob.arrayBuffer === 'function'
      ? await blob.arrayBuffer()
      : await new Response(blob).arrayBuffer()
  const port = activePort

  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      cleanup()
      reject(new Error('save port timed out'))
    }, 30_000)

    const onMessage = (message: SavePortMessage) => {
      if (message.type !== SAVE_ZIP_RESULT) {
        return
      }
      if (message.requestId !== requestId) {
        return
      }
      cleanup()
      if (message.ok) {
        resolve(message.id)
        return
      }
      reject(new Error(message.error))
    }

    const cleanup = () => {
      clearTimeout(timeout)
      port.onMessage.removeListener(onMessage)
    }

    port.onMessage.addListener(onMessage)
    port.postMessage({
      type: SAVE_ZIP,
      requestId,
      fileName,
      buffer,
    })
  })
}
