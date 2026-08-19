import { handleExtRequest, isExtRequest } from '../lib/messages'

export default defineBackground(() => {
  browser.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (!isExtRequest(message)) {
      return
    }
    void handleExtRequest(message).then(sendResponse)
    return true
  })
})
