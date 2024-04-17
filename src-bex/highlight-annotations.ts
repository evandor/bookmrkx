// @ts-ignore
import {bexContent} from 'quasar/wrappers'

export default bexContent((bridge: any) => {

  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'highlight-annotation') {
      let highlighter = rangy.createHighlighter();
      highlighter.addClassApplier(rangy.createClassApplier('ts-highlight'));
      console.log("tabsets: got highlight-annotation request with range", request.range, window.getSelection(), highlighter)

      window.getSelection()?.removeAllRanges();
      // @ts-ignore
      const r: WrappedRange = rangy.deserializeRange(request.range) as WrappedRange
      document.getSelection()?.addRange(r.nativeRange)
      highlighter.highlightSelection('ts-highlight');
      window.getSelection()?.removeAllRanges();
      sendResponse({content: "hi"});
    }
    sendResponse({content: "unknown request in highlight-annotations: " + request});
    return true
  })

  return "done!"

})
