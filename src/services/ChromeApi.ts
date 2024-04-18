import NavigationService from "src/services/NavigationService";
import IndexedDbPersistenceService from "src/services/IndexedDbPersistenceService";
import {usePermissionsStore} from "src/stores/permissionsStore";
import {uid} from "quasar";
import {FeatureIdent} from "src/models/AppFeature";
import {RequestInfo} from "src/models/RequestInfo";
import {Router} from "vue-router";

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
                    } else if (e.menuItemId === 'save_to_currentTS') {
                    }
                })
        }

    }

    highlight(tabIndex: number | undefined) {
        if (tabIndex) {
            chrome.tabs.highlight({tabs: tabIndex})
        }
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


}

export default new ChromeApi();

