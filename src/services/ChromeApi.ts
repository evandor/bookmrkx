import NavigationService from "src/services/NavigationService";
import IndexedDbPersistenceService from "src/services/IndexedDbPersistenceService";
import {uid} from "quasar";
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

