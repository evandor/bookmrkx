
export class Bookmark {
  // id: string // internal id, do not want to rely on .chromeTabId
  created: number
  updated: number
  lastActive: number
  activatedCount: number
  loadedCount: number
  chromeBookmark: chrome.bookmarks.BookmarkTreeNode
  selected: boolean = false
  name: string | undefined

  constructor(public id: string, chromeBookmark: chrome.bookmarks.BookmarkTreeNode) {
    this.created = new Date().getTime()
    this.updated = new Date().getTime()
    this.lastActive = 0
    this.activatedCount = 0
    this.loadedCount = 0
    this.chromeBookmark = chromeBookmark
    this.name = undefined
  }

}
