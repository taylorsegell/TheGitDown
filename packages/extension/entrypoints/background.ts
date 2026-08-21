import { bindSavePort, SAVE_PORT_NAME } from '../lib/savePort'
import { registerContextMenus } from '../lib/menu'
import {
  addJobStateListener,
  handleExtRequest,
  isExtRequest,
} from '../lib/messages'

export default defineBackground(() => {
  browser.runtime.onConnect.addListener((port) => {
    if (port.name === SAVE_PORT_NAME) {
      bindSavePort(port)
    }
  })

  registerContextMenus()

  addJobStateListener((state) => {
    const text = state.status === 'running' ? '…' : ''
    try {
      void browser.action.setBadgeText({ text })
    } catch {
      // action badge is optional; ignore if the API is unavailable
    }
  })

  browser.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (!isExtRequest(message)) {
      return
    }
    void handleExtRequest(message).then(sendResponse)
    return true
  })
})
