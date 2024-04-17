// @ts-ignore
import {bexContent} from 'quasar/wrappers'
let lastRectX = -1
let lastRectY = -1

export default bexContent((bridge: any) => {

  console.log("tabsets: initializing content script for website annotation")

  //rangy.init()
  //rangy.deleteContents()

  let selection = rangy.getSelection()

  // @ts-ignore
  if (selection?.rangeCount > 0) {
    const range = selection?.getRangeAt(0)
    const rect = window.getSelection()?.getRangeAt(0).getBoundingClientRect()
    const serializedRange: string = rangy.serializeRange(range, true)

    //console.log("checking", rect?.x,window.lastRectX,rect?.y,window.lastRectY)
    // @ts-ignore
    if (rect?.x !== window.lastRectX || rect?.y !== window.lastRectY) {
      console.log(`selection for '${selection?.toString()}' was made: ${serializedRange}`)
      // @ts-ignore
      window.lastRectX = rect?.x || -1
      // @ts-ignore
      window.lastRectY = rect?.y || -1
      const msg = {
        msg: 'capture-annotation',
        text: selection?.toString(),
        range: rangy.serializeRange(range, true),
        rect: rect,
        elementOffset: document.documentElement.scrollHeight,
        pageHeight: document.body.scrollHeight
      }
      console.log("sending message", msg)

      window.getSelection()?.removeAllRanges();

      chrome.runtime.sendMessage(msg, (callback) => {
        if (chrome.runtime.lastError) {
          console.warn("got runtime error", chrome.runtime.lastError)
        }
      })
    } else {
      // @ts-ignore
      console.log("ignoring range with same range:", rect?.x,window.lastRectX,rect?.y,window.lastRectY)
    }
  }

  var savedSel = rangy.saveSelection();
  //console.log(" .  savedSel", savedSel)
})
