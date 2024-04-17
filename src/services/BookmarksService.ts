import {Bookmark} from "src/models/Bookmark";
import {useBookmarksStore} from "src/stores/bookmarksStore";
import {useNotificationsStore} from "src/stores/notificationsStore";
import {useSearchStore} from "src/stores/searchStore";
import {useUiStore} from "stores/uiStore";
import {useUtils} from "src/services/Utils";

const {inBexMode} = useUtils()

async function getParentChain(parentId: string, chain: string[] = []): Promise<string[]> {
  if (!parentId || parentId === "0") {
    return chain
  }
  // @ts-ignore
  const results: any[] = await chrome.bookmarks.get(parentId)
  if (results && results.length > 0 && results[0] !== "0") {
    chain.push(results[0].parentId)
    return getParentChain(results[0].parentId, chain)
  }
  return chain;
}

class BookmarksService {

  async init() {
    console.debug(" ...initializing BookmarksService")
    if (inBexMode()) {
      useBookmarksStore().loadBookmarks()
        .then(res => {
          useSearchStore().populateFromBookmarks()
        })
    }
  }

  deleteBookmarksFolder(folderId: string) {
    console.log("deleting folder", folderId)
    if (folderId && folderId !== '1') {
      chrome.bookmarks.removeTree(folderId)
    }
  }

  deleteBookmark(bm: Bookmark) {
    chrome.bookmarks.remove(bm.chromeBookmark.id)
    useBookmarksStore().remove(bm)
  }

  async expandTreeForBookmarkId(bookmarkId: string): Promise<number> {
    // @ts-ignore
    const results: any[] = await chrome.bookmarks.get(bookmarkId)
    if (results && results.length > 0) {
      const node = results[0]
      if (node.parentId) {
        const parentChain: string[] = await getParentChain(node.parentId)
        useNotificationsStore().bookmarksExpanded = parentChain
        return Promise.resolve(node.parentId)
      }
      return Promise.reject("no parent id for bookmark node " + bookmarkId)
    } else {
      return Promise.reject("no result getting bookmark " + bookmarkId)
    }
  }

  async createBookmarkFolder(folderName: string, parentFolderId: string): Promise<chrome.bookmarks.BookmarkTreeNode> {
    console.log("createing folder", folderName, parentFolderId)
    // @ts-ignore
    const res: chrome.bookmarks.BookmarkTreeNode = await chrome.bookmarks.create({
      title: folderName,
      parentId: parentFolderId
    })
    return Promise.resolve(res)
  }
}

export default new BookmarksService();

