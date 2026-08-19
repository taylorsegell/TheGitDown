import { handleExtRequest, isExtRequest } from '../lib/messages'

export default defineBackground(() => {
  browser.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (!isExtRequest(message)) {
      return
    }
    sendResponse(handleExtRequest(message))
    return true
  })
})
