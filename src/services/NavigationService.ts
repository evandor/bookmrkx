import {useNotificationsStore} from "src/stores/notificationsStore";
import {openURL, uid} from "quasar";
import {useWindowsStore} from "src/stores/windowsStore";
import JsUtils from "src/utils/JsUtils";
import {usePermissionsStore} from "stores/permissionsStore";
import {FeatureIdent} from "src/models/AppFeature";
import {Suggestion, SuggestionType} from "src/models/Suggestion";
import {useSuggestionsStore} from "stores/suggestionsStore";
import {ExecutionResult} from "src/domain/ExecutionResult";
import {useNotificationHandler} from "src/services/ErrorHandler";

const {handleSuccess} = useNotificationHandler()

class NavigationService {

  placeholderPattern = /\${[^}]*}/gm

  async openChromeTab(chromeTab: chrome.tabs.Tab) {
    const window = await chrome.tabs.highlight({windowId: chromeTab.windowId, tabs: chromeTab.index})
    if (typeof window.id === "number") {
      await chrome.windows.update(window.id, {focused: true})
    }
  }

  async openOrCreateTab(
    withUrls: string[],
    matcher: string | undefined = undefined,
    groups: string[] = [],
    forceCurrent: boolean = false,
    forceReload: boolean = false
  ) {
    withUrls.map(u => u.replace(this.placeholderPattern, ""));
    const useWindowIdent = this.getUseWindowIdent(forceCurrent, withUrls)
    console.log(` > opening url(s) ${withUrls} in window: '${useWindowIdent}', groups: '${groups}', mode: '${process.env.MODE}'`)

    const windowFromDb = await useWindowsStore().windowFor(useWindowIdent)
    const existingWindow = await useWindowsStore().currentWindowFor(useWindowIdent)

    if (useWindowIdent !== 'current') {
      //console.log("existingWindow", existingWindow)
      if (!existingWindow) {

        const createData: any = {url: withUrls}
        if (windowFromDb) {
          const w = windowFromDb.browserWindow
          createData['left' as keyof object] = w?.left || 50
          createData['top' as keyof object] = w?.top || 50 //(w.top || 0) < 0 ? 0 : w.top
          createData['width' as keyof object] = w?.width || 1200 //(w.width || -1) < 0 ? 600 : w.width
          createData['height' as keyof object] = w?.height || 800 //(w.top || -1) < 0 ? 400 : w.height
          // window does not exist anymore, remove from 'allWindows'
          await useWindowsStore().removeWindow(windowFromDb.id)
        }

        await this.createNewWindow(createData, useWindowIdent, withUrls, groups)

        return
      }
    }

    if (process.env.MODE === "bex") {
      for (const url of withUrls) {
        // get all tabs with this url

      }

      const useWindowId = existingWindow?.id || chrome.windows.WINDOW_ID_CURRENT
      const queryInfo = {windowId: useWindowId}

      // getting all tabs from this window
      chrome.tabs.query(queryInfo, (t: chrome.tabs.Tab[]) => {
        const ctx = this
        withUrls.forEach(function (url, i) {
          let found = false;
          t.filter(r => r.url)
            .map(r => {
              let matchCondition = url === r.url
              if (matcher && r.url) {
                //console.log("matcher yielded", JsUtils.match(matcher, r.url))
                matchCondition = JsUtils.match(matcher, r.url)
              }
              // console.log("===>", matchCondition, url, r.url)
              if (matchCondition) {
                if (!found) { // highlight only first hit
                  found = true
                  console.debug("found something", r)
                  if (r.active) {
                    handleSuccess(new ExecutionResult("", "already opened..."))
                  }
                  chrome.tabs.highlight({tabs: r.index, windowId: useWindowId});
                  chrome.windows.update(useWindowId, {focused: true})

                  if (forceReload && r.id) {
                    console.debug("forced reload")
                    chrome.tabs.reload(r.id)
                  }

                  if (groups.length > i) {
                    ctx.handleGroup(groups[i], useWindowId, r);
                  }
                }
              }
            });
          if (!found) {
            console.debug("tab not found, creating new one:", url)
            chrome.tabs.create({
              active: true,
              pinned: false,
              url: url,
              windowId: useWindowId
            }, (tab: chrome.tabs.Tab) => {
              chrome.windows.update(useWindowId, {focused: true})

              if (!usePermissionsStore().hasFeature(FeatureIdent.ANALYSE_TABS)) {
                setTimeout(() => {
                  // check potential redirect
                  chrome.tabs.get(tab.id || 0, (potentiallyChangedTab: chrome.tabs.Tab) => {
                    if (tab.url !== potentiallyChangedTab.url && tab.url?.trim() !== "" && potentiallyChangedTab.url?.trim() !== "") {
                      console.log("tab's URL change during one second, assuming 30x redirect, creating suggestion", tab, potentiallyChangedTab)
                      const suggestionId = uid()
                      const suggestion = new Suggestion(suggestionId,
                        "Tab's URL changed", "Seems like the tab's URL has changed according to the server. " +
                        "Should the URL be updated?",
                        "/suggestions/" + suggestionId,
                        SuggestionType.REDIRECT_HAPPENED_FOR_TAB)
                      suggestion.setData({url, location: potentiallyChangedTab.url})
                      useSuggestionsStore().addSuggestion(suggestion).catch((err) => {
                        console.log("got error", err)
                      })
                    }
                  })
                }, 1000)
              }

              if (groups.length > i) {
                ctx.handleGroup(groups[i], useWindowId, tab);
              }

            })

          }
        })
      })
    } else {
      openURL(withUrls[0])
    }
  }

  private getUseWindowIdent(forceCurrent: boolean, urls: string[]) {
      return 'current'
  }

  openTab(tabId: number) {
    return chrome.tabs.update(tabId, {active: true})
  }

  async openSingleTab(url: string): Promise<chrome.tabs.Tab> {
    return await chrome.tabs.create({url: url})
  }

  closeChromeTab(tab: chrome.tabs.Tab) {
    console.log("closing chrome tab", tab.id, tab?.id)
    try {
      chrome.tabs.remove(tab.id || 0)
    } catch (err) {
      console.log("error clsosing chrome tab", err)
    }
  }

  updateAvailable(details: any) {
    console.log("details: UpdateAvailableDetails", details)
    useNotificationsStore().updateAvailable(true, details.version)
  }

  private async createNewWindow(createData: any, useWindowIdent: string, withUrls: string[], groups: string[]) {
    console.log("opening new window with", createData)

    chrome.windows.create(createData, (window) => {
      //console.log("creating window", useWindowIdent, window)
      if (chrome.runtime.lastError) {
        // probably out of bounds issues
        chrome.windows.create({}, (window) => {
          if (window) {
            this.createWindow(useWindowIdent, window, 0, withUrls, groups);
          }
        })
      } else if (window) {
        this.createWindow(useWindowIdent, window, 0, withUrls, groups);
      }
    })

  }

  private createWindow(useWindowIdent: string, window: chrome.windows.Window, index: number = 0, withUrls: string[], groups: string[]) {
    //useWindowsStore().assignWindow(useWindowIdent, window.id || 0)
    useWindowsStore().upsertWindow(window, useWindowIdent, index)
    const ctx = this
    withUrls.forEach(function (url, i) {
      if (groups.length > i) {
        const group = groups[i]
        if (group && window.id && window.tabs && window.tabs.length > i) {
          console.log("assiging group", group, i)
        }
      }
    })
  }
}

export default new NavigationService();

