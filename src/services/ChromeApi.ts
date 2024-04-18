import NavigationService from "src/services/NavigationService";
import IndexedDbPersistenceService from "src/services/IndexedDbPersistenceService";
import {usePermissionsStore} from "src/stores/permissionsStore";
import {uid} from "quasar";
import {FeatureIdent} from "src/models/AppFeature";
import {Router} from "vue-router";

const persistenceService = IndexedDbPersistenceService


class ChromeApi {

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

