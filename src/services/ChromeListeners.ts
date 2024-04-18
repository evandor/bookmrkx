import {HTMLSelection, Tab} from "src/models/Tab";
import {uid} from "quasar";
import {usePermissionsStore} from "src/stores/permissionsStore";
import {MetaLink} from "src/models/MetaLink";
import {Suggestion, SuggestionState, SuggestionType} from "src/models/Suggestion";
import {useSuggestionsStore} from "src/stores/suggestionsStore";
import {FeatureIdent} from "src/models/AppFeature";
import {Extractor, Extractors, ExtractorType} from "src/config/Extractors";
import {useUtils} from "src/services/Utils";
import NavigationService from "src/services/NavigationService";
import {EMAIL_LINK_REDIRECT_DOMAIN} from "boot/constants";
import {SidePanelView, useUiStore} from "stores/uiStore";

const {sanitize, sendMsg, inBexMode} = useUtils()

function inIgnoredMessages(request: any) {
  // TODO name vs. msg!
  return request.name === 'progress-indicator' ||
    request.name === 'current-tabset-id-change' ||
    request.action === 'highlight-annotation'
  //request.name === 'recogito-annotation-created'

}

function runOnNotificationClick(notificationId: string, buttonIndex: number) {
  console.log("notification button clicked", notificationId, buttonIndex)
  const notification = useSuggestionsStore().getSuggestion(notificationId)
  console.log("found notificastion", notification)
  if (notification) {
    switch (buttonIndex) {
      case 0: // show
        const url = chrome.runtime.getURL('www/index.html') + "#/mainpanel/suggestions/" + notificationId
        NavigationService.openOrCreateTab([url])
        useSuggestionsStore().updateSuggestionState(notificationId, SuggestionState.CHECKED)
        break;
      default: // ignore
        useSuggestionsStore().updateSuggestionState(notificationId, SuggestionState.IGNORED)
    }
  }
}

class ChromeListeners {

  inProgress = false;

  thumbnailsActive = true

  private onUpdatedListener = (number: number, info: chrome.tabs.TabChangeInfo, tab: chrome.tabs.Tab) => this.onUpdated(number, info, tab)
  private onRemovedListener = (number: number, info: chrome.tabs.TabRemoveInfo) => this.onRemoved(number, info)
  private onAttachedListener = (number: number, info: chrome.tabs.TabAttachInfo) => this.onAttached(number, info)
  private onDetachedListener = (number: number, info: chrome.tabs.TabDetachInfo) => this.onDetached(number, info)
  private onHighlightedListener = (info: chrome.tabs.TabHighlightInfo) => this.onHighlighted(info)
  private onMessageListener = (request: any, sender: chrome.runtime.MessageSender, sendResponse: any) => this.onMessage(request, sender, sendResponse)

  async initListeners() {

    if (process.env.MODE === 'bex') {

      console.debug(" ...initializing chrome tab listeners")

      // chrome.runtime.setUninstallURL("https://tabsets.web.app/#/uninstall")

      chrome.tabs.onUpdated.addListener(this.onUpdatedListener)
      chrome.tabs.onRemoved.addListener(this.onRemovedListener)
      chrome.tabs.onAttached.addListener(this.onAttachedListener)
      chrome.tabs.onDetached.addListener(this.onDetachedListener)
      chrome.tabs.onHighlighted.addListener(this.onHighlightedListener)
      //chrome.tabs.onZoomChange.addListener((info) => this.onZoomChange(info))

      chrome.runtime.onMessage.addListener(this.onMessageListener)

      // TODO removed listeners as well?
      if (usePermissionsStore().hasFeature(FeatureIdent.NOTIFICATIONS)) {
        chrome.notifications.onButtonClicked.addListener(
          (notificationId, buttonIndex) => {
            runOnNotificationClick(notificationId, buttonIndex);
          })
        chrome.notifications.onClicked.addListener(
          (notificationId) => {
            runOnNotificationClick(notificationId, 0);
          })
      }
    }

    // https://stackoverflow.com/questions/77089404/chrom-extension-close-event-not-available-on-sidepanel-closure
    if (inBexMode() && chrome && chrome.runtime) {
      chrome.runtime.connect({name: 'tabsetsSidepanel'});
    }

  }

  async resetListeners() {
    console.log(" ...resetting listeners (after re-initialization)")
    chrome.tabs.onUpdated.removeListener(this.onUpdatedListener)
    chrome.tabs.onRemoved.removeListener(this.onRemovedListener)
    chrome.tabs.onAttached.removeListener(this.onAttachedListener)
    chrome.tabs.onDetached.removeListener(this.onDetachedListener)
    chrome.tabs.onHighlighted.removeListener(this.onHighlightedListener)
    chrome.runtime.onMessage.removeListener(this.onMessageListener)
  }

  clearWorking() {
    if (this.inProgress) {

    }
    this.inProgress = false
  }

  intervalID = setInterval(() => this.clearWorking(), 5000);

  eventTriggered() {
    this.inProgress = true
  }

  createThumbnails(b: boolean) {
    console.log("thumbnails active set to ", b)
    this.thumbnailsActive = b
  }


  async onUpdated(number: number, info: chrome.tabs.TabChangeInfo, chromeTab: chrome.tabs.Tab) {
    const selfUrl = chrome.runtime.getURL("")
    if (chromeTab.url?.startsWith(selfUrl)) {
      console.debug(`onUpdated:   tab ${number}: >>> .url starts with '${selfUrl}' <<<`)
      return
    }

    this.eventTriggered()


  }

  onRemoved(number: number, info: chrome.tabs.TabRemoveInfo) {
    this.eventTriggered()
    console.debug("onRemoved tab event: ", number, info)
  }

  onAttached(number: number, info: chrome.tabs.TabAttachInfo) {
    console.debug(`onAttached: tab ${number} attached: ${JSON.stringify(info)}`)
  }

  onDetached(number: number, info: chrome.tabs.TabDetachInfo) {
    console.debug(`onDetached: tab ${number} detached: ${JSON.stringify(info)}`)
  }

  onHighlighted(info: chrome.tabs.TabHighlightInfo) {
    console.debug(`onHighlighted: tab ${info.tabIds} highlighted: ${JSON.stringify(info)}`)
  }

  onMessage(request: any, sender: chrome.runtime.MessageSender, sendResponse: any) {
    if (inIgnoredMessages(request)) {
      return true
    }
    console.debug(" <<< got message in ChromeListeners", request)
    if (request.msg === 'captureThumbnail') {
    } else if (request.msg === 'html2text') {
    } else if (request.msg === 'html2links') {
    } else if (request.msg === 'addTabToTabset') {
    } else if (request.msg === 'captureClipping') {
    } else if (request.msg === 'capture-annotation') {
    } else if (request.msg === 'websiteImg') {
    } else if (request.name === 'sidepanel-switch-view') {
      useUiStore().sidePanelSetActiveView(SidePanelView.MAIN)
    } else {
      console.log("got unknown message", request)
    }
    return true;
  }


}

export default new ChromeListeners();

