import {HTMLSelection, Tab} from "src/models/Tab";
import {uid, useQuasar} from "quasar";
import throttledQueue from 'throttled-queue';
import {useWindowsStore} from "src/stores/windowsStore";
import {useSettingsStore} from "src/stores/settingsStore";
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

function annotationScript(tabId: string, annotations: any[]) {
  console.log("!!! here in annotation script", tabId, annotations)

  var l: HTMLLinkElement = document.createElement('link');
  l.setAttribute("href", chrome.runtime.getURL('www/css/ts-content-script.css'))
  l.setAttribute("rel", "stylesheet")
  document.head.appendChild(l)

  var s = document.createElement('script');
  //s.type = "module"
  s.src = chrome.runtime.getURL('www/js/rangy/rangy.js');
  s.setAttribute("type", 'text/javascript');
  //s.src = "https://cdn.jsdelivr.net/npm/rangy@1.3.1/lib/rangy-core.min.js";
  document.body.appendChild(s);

  // var s3 = document.createElement('script');
  // s3.dataset.id = 'tabsets-rangy-annotation-data';
  // s3.dataset.annotations = JSON.stringify(annotations);
  // (document.head || document.documentElement).appendChild(s3);

}

function inIgnoredMessages(request: any) {
  // TODO name vs. msg!
  return request.name === 'progress-indicator' ||
    request.name === 'current-tabset-id-change' ||
    request.name === 'tab-being-dragged' ||
    request.name === 'note-changed' ||
    request.name === 'tab-added' ||
    request.name === 'tab-deleted' ||
    request.name === 'tabset-added' ||
    request.name === 'tabset-renamed' ||
    request.name === 'mark-tabset-deleted' ||
    request.name === 'feature-activated' ||
    request.name === 'feature-deactivated' ||
    request.name === 'tabsets-imported' ||
    request.name === 'fullUrls-changed' ||
    request.name === 'reload-suggestions' ||
    request.name === 'reload-tabset' ||
    request.name === 'reload-spaces' ||
    request.name === 'detail-level-perTabset-changed' ||
    request.name === 'detail-level-changed' ||
    request.name === 'reload-application' ||
    request.name === 'window-updated' ||
    request.name === 'entity-changed' ||
    request.name === 'reload-entities' ||
    request.name === 'api-changed' ||
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

  throttleOnePerSecond = throttledQueue(1, 1000, true)

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
    useWindowsStore().refreshTabsetWindow(info.windowId)
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

  onZoomChange(info: chrome.tabs.ZoomChangeInfo) {
    //console.log(`onZoomChange: tab ${info.tabId} zoom change: ${JSON.stringify(info)}`)
  }

  onMessage(request: any, sender: chrome.runtime.MessageSender, sendResponse: any) {
    if (inIgnoredMessages(request)) {
      return true
    }
    console.debug(" <<< got message in ChromeListeners", request)
    if (request.msg === 'captureThumbnail') {
      const screenShotWindow = useWindowsStore().screenshotWindow
    } else if (request.msg === 'html2text') {
      this.handleHtml2Text(request, sender, sendResponse)
    } else if (request.msg === 'html2links') {
      this.handleHtml2Links(request, sender, sendResponse)
    } else if (request.msg === 'addTabToTabset') {
      this.handleAddTabToTabset(request, sender, sendResponse)
    } else if (request.msg === 'captureClipping') {
    } else if (request.msg === 'capture-annotation') {
      // } else if (request.msg === 'websiteQuote') {
      //   this.handleMessageWebsiteQuote(request, sender, sendResponse)
    } else if (request.msg === 'websiteImg') {
      // } else if (request.name === 'recogito-annotation-created') {
      //   //this.handleMessageWebsiteImage(request, sender, sendResponse)
      //   useTabsetService().handleAnnotationMessage(request)
    } else if (request.name === 'sidepanel-switch-view') {
      useUiStore().sidePanelSetActiveView(SidePanelView.MAIN)
    } else {
      console.log("got unknown message", request)
    }
    return true;
  }

  private handleHtml2Text(request: any, sender: chrome.runtime.MessageSender, sendResponse: any) {

    console.debug("handleHtml2Text", request.html?.length)

    if (sender && sender.url && request.html) {
      try {
        const hostname = new URL(sender.url).hostname
        new Extractors().getExtractors().forEach((e: Extractor) => {
          if (hostname.indexOf(e.hostnameMatch) >= 0) {
            console.log("matched", hostname, e.hostnameMatch)
            let candidate = ""
            switch (e.type) {
              case ExtractorType.REGEX:
                const matches = request.html.matchAll(e.regex)
                for (const match of matches) {
                  //console.log("found desc", match[1])
                  candidate = match[1].replace("\n", "<br>")
                }
                break;
              case ExtractorType.HTML_SELECTOR:
                // const doc = request.html
                const domParser = new DOMParser()
                const doc = domParser.parseFromString(request.html, "text/html")
                console.log("doc", typeof doc)
                if (e.selector) {
                  const selection =
                    doc.querySelector(e.selector)
                  console.log("selection", e.target.toString(), selection?.outerHTML)
                  candidate = selection?.outerHTML || ''
                } else {
                  console.log("could not find ", e.selector)
                }
                break;
              default:
                break;
            }
            if (candidate.length > 0) {
              request.metas[e.target.toString()] = sanitize(candidate)
            }
          }
        })
      } catch (err) {
        console.log("error", err)
      }
    }

    sendResponse({html2text: 'done'});
  }

  private handleHtml2Links(request: any, sender: chrome.runtime.MessageSender, sendResponse: any) {
    if (sender.tab) {
      console.debug("handleHtml2Links")

      if (usePermissionsStore().hasFeature(FeatureIdent.RSS)) {
        request.links.forEach((metaLink: MetaLink) => {
          if ("application/rss+xml" === metaLink.type) {
            console.log("hier!!!", metaLink)
            useSuggestionsStore().addSuggestion(new Suggestion(uid(), metaLink.title || 'Found RSS Feed', "An RSS Link was found in one of your tabs", metaLink.href, SuggestionType.RSS))
          }
        })
      }
    }
    sendResponse({html2links: 'done'});
  }

  private handleAddTabToTabset(request: any, sender: chrome.runtime.MessageSender, sendResponse: any) {
    console.log("handleAddTabToTabset", request, sender)
    if (sender.tab) {
    }
    sendResponse({addTabToCurrent: 'done'});
  }

  private ignoreUrl(tab: Tab, info: chrome.tabs.TabChangeInfo) {
    return (tab.url?.startsWith("chrome")) ||
      (tab.url?.startsWith("about")) ||
      info.url?.startsWith("chrome") ||
      info.url?.startsWith("about") ||
      info.url?.startsWith("https://skysail.eu.auth0.com/")
  }




  private checkOriginForEmailLink(url: string) {
    try {
      const theUrl = new URL(url)
      const urlOrigin = theUrl.origin;
      //console.log("theURL", theUrl)
      const res = urlOrigin === EMAIL_LINK_REDIRECT_DOMAIN || urlOrigin === "http://localhost:9000"
      if (res) {
        //console.log("checking: origin ok")
        const params = theUrl.searchParams
        if (!params.has("apiKey") || !params.has("oobCode") || !params.has("mode")) {
          //console.log("checking: missing key", params)
          return false
        }
        if (!params.get("apiKey")?.startsWith("AIzaS") || params.get("mode") !== "signIn") {
          //console.log("checking: wrong key", params.get("apiKey"))
          //console.log("checking: wrong key", params.get("mode"))
          return false
        }
        console.log("%cfound email authorization link @", "border:1px solid green", url)
        return true
      }
      return false
    } catch (err) {
      console.log("could not check url for auth link", url)
    }
  }
}

export default new ChromeListeners();

