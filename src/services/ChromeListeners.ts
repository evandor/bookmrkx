import {useUtils} from "src/core/services/Utils";
import {SidePanelView, useUiStore} from "stores/uiStore";

const {inBexMode} = useUtils()

function inIgnoredMessages(request: any) {
  // TODO name vs. msg!
  return request.name === 'progress-indicator' ||
    request.name === 'feature-activated' ||
    request.name === 'feature-deactivated' ||
    request.action === 'highlight-annotation'

}


class ChromeListeners {

  inProgress = false;

  private onMessageListener = (request: any, sender: chrome.runtime.MessageSender, sendResponse: any) => this.onMessage(request, sender, sendResponse)

  async initListeners() {

    if (process.env.MODE === 'bex') {
      console.debug(" ...initializing chrome tab listeners")
      // chrome.runtime.setUninstallURL("https://tabsets.web.app/#/uninstall")
      //chrome.tabs.onZoomChange.addListener((info) => this.onZoomChange(info))
      chrome.runtime.onMessage.addListener(this.onMessageListener)
    }

    // https://stackoverflow.com/questions/77089404/chrom-extension-close-event-not-available-on-sidepanel-closure
    if (inBexMode() && chrome && chrome.runtime) {
      chrome.runtime.connect({name: 'tabsetsSidepanel'});
    }

  }

  async resetListeners() {
    console.log(" ...resetting listeners (after re-initialization)")
    chrome.runtime.onMessage.removeListener(this.onMessageListener)
  }

  clearWorking() {
    if (this.inProgress) {

    }
    this.inProgress = false
  }

  intervalID = setInterval(() => this.clearWorking(), 5000);

  onMessage(request: any, sender: chrome.runtime.MessageSender, sendResponse: any) {
    if (inIgnoredMessages(request)) {
      return true
    }
    console.debug(" <<< got message in ChromeListeners", request)
    if (request.msg === 'captureThumbnail') {
    } else if (request.msg === 'html2text') {
    } else if (request.name === 'sidepanel-switch-view') {
      useUiStore().sidePanelSetActiveView(SidePanelView.MAIN)
    } else {
      console.log("got unknown message", request)
    }
    return true;
  }

}

export default new ChromeListeners();

