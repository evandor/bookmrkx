import {useNotificationsStore} from "src/stores/notificationsStore";
import {openURL, uid} from "quasar";
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


        openURL(withUrls[0])

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

