import {Tabset} from "src/models/Tabset";
import {CLEANUP_PERIOD_IN_MINUTES, MONITORING_PERIOD_IN_MINUTES} from "boot/constants";
import _ from "lodash"
import NavigationService from "src/services/NavigationService";
import IndexedDbPersistenceService from "src/services/IndexedDbPersistenceService";
import {useSearchStore} from "src/stores/searchStore";
import {SearchDoc} from "src/models/SearchDoc";
import {usePermissionsStore} from "src/stores/permissionsStore";
import {Tab} from "src/models/Tab";
import {uid} from "quasar";
import {FeatureIdent} from "src/models/AppFeature";
import {RequestInfo} from "src/models/RequestInfo";
import {useWindowsStore} from "stores/windowsStore";
import {Router, useRoute, useRouter} from "vue-router";

const persistenceService = IndexedDbPersistenceService


class ChromeApi {

  onHeadersReceivedListener = function (details: any) {
    if (details.url) {
      persistenceService.saveRequest(details.url, new RequestInfo(details.statusCode as number, details.responseHeaders || []))
        .then(() => console.debug("added request"))
        .catch(err => console.warn("err", err))
    }
  }

  init(router: Router) {

    if (process.env.MODE !== 'bex') {
      return
    }

    console.debug(" ...initializing ChromeApi")

    chrome.runtime.onUpdateAvailable.addListener(
      (details: any) => {
        NavigationService.updateAvailable(details)
      }
    )

    if (usePermissionsStore().hasAllOrigins() && usePermissionsStore().hasFeature(FeatureIdent.ANALYSE_TABS)) {
      this.startWebRequestListener()
    } else {
      this.stopWebRequestListener()
    }
  }

  startWebRequestListener() {
    console.log("adding WebRequestListener")
    chrome.webRequest.onHeadersReceived.addListener(
      this.onHeadersReceivedListener,
      {urls: ['*://*/*'], types: ['main_frame']},
      ['responseHeaders']
    )
  }

  stopWebRequestListener() {
    if (chrome.webRequest) {
      console.debug("removing WebRequestListener if running", chrome.webRequest)
      chrome.webRequest.onHeadersReceived.removeListener(this.onHeadersReceivedListener)
    }
  }

  buildContextMenu(caller: string) {
    if (process.env.MODE !== 'bex') {
      return
    }

    console.log(" building context menu", caller)
    if (chrome && chrome.contextMenus) {
      chrome.contextMenus.removeAll(
        () => {
          console.log("creating contextmenu for tabset_extension")
          chrome.contextMenus.create({
              id: 'tabset_extension',
              title: 'Bookmrkx Extension',
              documentUrlPatterns: ['https://*/*', 'https://*/'],
              contexts: ['page']},
            () => {

              console.log("context menu move_to_window", useWindowsStore().currentChromeWindows)
              const currentWindows = useWindowsStore().currentChromeWindows
              if (currentWindows.length > 1) {
                chrome.contextMenus.create({
                  id: 'move_to_window',
                  parentId: 'tabset_extension',
                  title: 'Move current tab...',
                  documentUrlPatterns: ['https://*/*', 'https://*/'],
                  contexts: ['all']
                })
                // rest of logic in windowsStore
              }

            })
        }
      )
      chrome.contextMenus.onClicked.addListener(
        (e: chrome.contextMenus.OnClickData, tab: chrome.tabs.Tab | undefined) => {
          //console.log("listening to", e, tab)
          if (e.menuItemId === "open_tabsets_page") {
            chrome.tabs.query({title: `Tabsets Extension`}, (result: chrome.tabs.Tab[]) => {
              if (result && result[0]) {
                chrome.tabs.highlight({tabs: result[0].index});
              } else {
                // const selfId = localStorage.getItem("selfId")
                // if (selfId) {
                chrome.tabs.create({
                  active: true,
                  pinned: false,
                  //url: "chrome-extension://" + selfId + "/www/index.html#/start"
                  url: chrome.runtime.getURL("www/index.html#/start")
                })
                // }
              }
            })
          } else if (e.menuItemId === "website_clip") {
            console.log("creating Clip", tab)
            if (tab && tab.id) {
              this.executeClippingJS(tab.id)
            }
            // } else if (e.menuItemId === "website_quote") {
            //   console.log("creating Quote", tab)
            //   if (tab && tab.id) {
            //     this.executeQuoteJS(tab.id)
            //   }
          } else if (e.menuItemId === 'save_to_currentTS') {
            const tabId = tab?.id || 0
          } else if (e.menuItemId === 'annotate_website') {
            console.log("creating annotation JS", tab)
            if (tab && tab.id) {
              this.executeAnnotationJS(tab.id)
            }
          } else if (e.menuItemId.toString().startsWith("save_as_tab|")) {
            //console.log("got", e, e.menuItemId.split("|"))
            const tabId = tab?.id || 0
            const tabsetId = e.menuItemId.toString().split("|")[1]
            console.log("got tabsetId", tabsetId, e.menuItemId)
            this.executeAddToTS(tabId, tabsetId)
          } else if (e.menuItemId.toString().startsWith("move_to|")) {
            console.log("got", e, e.menuItemId.toString().split("|"))
            const tabId = tab?.id || 0
            const windowId = e.menuItemId.toString().split("|")[1]
            console.log("got windowId", tabId, windowId)
            this.executeMoveToWindow(tabId, Number(windowId))
          }
        })
    }

  }


  private createSubmenu(ts: Tabset, parentId: string, title: string) {
    chrome.contextMenus.create({
      id: 'save_as_tab|' + ts.id,
      parentId,
      title,
      documentUrlPatterns: ['https://*/*', 'https://*/'],
      contexts: ['page']
    })
  }

  async closeAllTabs() {
    console.log(" --- closing all tabs: start ---")
    const currentTab = await this.getCurrentTab()
    // @ts-ignore
    const t: chrome.tabs.Tab[] = await chrome.tabs.query({currentWindow: true})//, (t: chrome.tabs.Tab[]) => {
    const ids: number[] = t.filter((r: chrome.tabs.Tab) => r.id !== currentTab.id)
      .filter(r => r.id !== undefined)
      .map(r => r.id || 0);
    console.log("ids to close", ids)
    ids.forEach(id => {
      try {
        chrome.tabs.remove(id)
      } catch (err) {
        console.warn("got error removing tabs", err, ids)
      }
    })
    console.log(" --- closing all tabs: end ---")
  }

  restore(tabset: Tabset, windowName: string | undefined = undefined, inNewWindow: boolean = true) {
    console.log("restoring tabset ", tabset.id, windowName, inNewWindow)

    const urlAndGroupArray: object[] = _.map(tabset.tabs, (t: Tab) => {
      return {url: t.url, group: t.groupName} || {url: '', group: undefined}
    })
    console.log("restoring urls and groups:", urlAndGroupArray)
    if (inNewWindow && !windowName) {
      console.log("creating new window with urls", urlAndGroupArray)
      chrome.windows.create({
        focused: true,
        left: 50,
        top: 50,
        url: _.map(urlAndGroupArray, a => a['url' as keyof object])
      })
    } else if (windowName) { // open in named window
      NavigationService.openOrCreateTab(
        _.map(urlAndGroupArray, a => a['url' as keyof object]),
        undefined,
        _.map(urlAndGroupArray, a => a['group' as keyof object]))
    } else {
      console.log("opening urls", urlAndGroupArray)
      NavigationService.openOrCreateTab(_.map(urlAndGroupArray, a => a['url' as keyof object]),
        undefined, _.map(urlAndGroupArray, a => a['group' as keyof object]))
    }
  }

  async getCurrentTab(): Promise<chrome.tabs.Tab> {
    if (process.env.MODE !== 'bex') {
      return Promise.reject("not in bex mode, but " + process.env.MODE)
    }

    return new Promise((resolve, reject) => {
      let queryOptions = {active: true, lastFocusedWindow: true};
      try {
        chrome.tabs.query(queryOptions, function (tabs) {
          //console.log("got tab", tabs[0])
          resolve(tabs[0]);
        })
      } catch (e) {
        reject(e);
      }
    })
  }

  highlight(tabIndex: number | undefined) {
    if (tabIndex) {
      chrome.tabs.highlight({tabs: tabIndex})
    }
  }

  async childrenFor(bookmarkFolderId: string): Promise<chrome.bookmarks.BookmarkTreeNode[]> {
    console.log("bookmarkFolderId", bookmarkFolderId)
    // @ts-ignore
    return chrome.bookmarks.getChildren(bookmarkFolderId)
  }

  async getTab(tabId: number): Promise<chrome.tabs.Tab> {
    console.log("call to chromeapi get tab", tabId)
    // @ts-ignore
    return chrome.tabs.get(tabId)
  }

  createChromeTabObject(title: string, url: string, favIconUrl: string = "https://tabsets.web.app/icons/favicon-128x128.png") {
    return {
      active: false,
      discarded: true,
      // @ts-ignore
      groupId: -1,
      autoDiscardable: true,
      favIconUrl: favIconUrl,
      index: 0,
      highlighted: false,
      title: title,
      pinned: false,
      url: url,
      name: '',
      windowId: 0,
      incognito: false,
      selected: false
    }
  }

  createChromeBookmarkObject(title: string, url: string, favIconUrl: string) {
    return {
      id: uid(),
      active: false,
      discarded: true,
      // @ts-ignore
      groupId: -1,
      autoDiscardable: true,
      favIconUrl: favIconUrl,
      index: 0,
      highlighted: false,
      title: title,
      pinned: false,
      url: url,
      windowId: 0,
      incognito: false,
      selected: false
    }
  }

  createFolderNode(title: string, children: chrome.bookmarks.BookmarkTreeNode[] | undefined = undefined): chrome.bookmarks.BookmarkTreeNode {
    // index?: number | undefined;
    // dateAdded?: number | undefined;
    // dateGroupModified?: number | undefined;
    // parentId?: string | undefined;
    return {
      id: uid(),
      title,
      url: undefined,
      children
    }
  }

  createBmNode(title: string, url: string, children: chrome.bookmarks.BookmarkTreeNode[] | undefined = undefined): chrome.bookmarks.BookmarkTreeNode {
    return {
      id: uid(),
      title,
      url: url,
      children
    }
  }

  createChromeTabGroupObject(id: number, title: string, color: chrome.tabGroups.ColorEnum) {
    return {
      id: id,
      title: title,
      color: color,
      collapsed: false,
      windowId: 1
    }
  }

  createChromeWindowObject(id: number, top: number, left: number, tabs: chrome.tabs.Tab[] = []) {
    return {
      id,
      alwaysOnTop: false,
      focused: true,
      incognito: false,
      height: 400,
      width: 600,
      top: top,
      left: left,
      state: 'normal' as chrome.windows.windowStateEnum,
      type: 'normal' as chrome.windows.windowTypeEnum,
      tabs
    }
  }

  executeClippingJS(tabId: number) {
    // @ts-ignore
    chrome.scripting.insertCSS({
      target: {tabId: tabId},
      files: ['assets/content.css']
    }, () => {
      const lastError = chrome.runtime.lastError;
      if (lastError) {
        alert(JSON.stringify(lastError))
        return
      }
      // @ts-ignore
      chrome.scripting.executeScript({
        target: {tabId: tabId},
        files: ['clipping.js']
      });
    });
  }

  executeAnnotationJS(tabId: number) {
    chrome.scripting.executeScript({
      target: {tabId: tabId},
      files: ['annotation.js']
    });
  }

  async executeMoveToWindow(tabId: number, windowId: number) {
    try {
      const tab = await chrome.tabs.get(tabId)
      const url = tab.url
      if (!url || !tab.id) {
        return
      }
      console.log("found tab", tab.id, url)
      const window = await chrome.windows.get(windowId)
      console.log("found window", window.id)
      await chrome.tabs.create({windowId: window.id, url: url})
      await chrome.tabs.remove(tab.id)
    } catch (err) {
      console.log("error", err)
    }

  }

  executeAddToTS(tabId: number, tabsetId: string) {
    // @ts-ignore
    chrome.scripting.executeScript({
      target: {tabId: tabId, allFrames: true},
      args: [tabId, tabsetId],
      func: (tabId: number, tabsetId: string) => {

        if (window.getSelection()?.anchorNode && window.getSelection()?.anchorNode !== null) {
          const msg = {
            msg: "addTabToTabset",
            tabId: tabId,
            tabsetId: tabsetId
          }
          console.log("sending message", msg)
          chrome.runtime.sendMessage(msg, function (response) {
            console.log("created new tab in current tabset:", response)
            if (chrome.runtime.lastError) {
              console.warn("got runtime error", chrome.runtime.lastError)
            }
          });
        }
      }
    });
  }
}

export default new ChromeApi();

