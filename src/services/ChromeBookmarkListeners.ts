import {useBookmarksStore} from "src/stores/bookmarksStore";

class ChromeBookmarkListeners {

  inProgress = false;

  onCreatedListener = (name: string, bm: any) => this.onCreated(bm)
  onMovedListener = (id: string, info: any) => this.reload()
  onRemovedListener = (id: string, info: any) => this.reload()
  onChangedListener = (id: string, info: any) => this.reload()
  onChildrenReorderedListener = (id: string, info: any) => this.reload()


  initListeners() {
    if (process.env.MODE === 'bex') {
    chrome.permissions.contains(
      {permissions: ["bookmarks"]},
      (res: boolean) => {
        if (res) {
          console.debug(" ...init chrome bookmark listeners")
          chrome.bookmarks.onCreated.addListener(this.onCreatedListener)
          chrome.bookmarks.onMoved.addListener(this.onMovedListener)
          chrome.bookmarks.onRemoved.addListener(this.onRemovedListener)
          chrome.bookmarks.onChanged.addListener(this.onChangedListener)
          //chrome.bookmarks.onChildrenReordered.addListener(this.onChildrenReorderedListener)
        }
      })
    }
  }

  removeListeners() {
    if (process.env.MODE === 'bex') {
      console.log("removing chrome bookmark listeners")
      chrome.bookmarks.onCreated.removeListener(this.onCreatedListener)
      chrome.bookmarks.onMoved.removeListener(this.onMovedListener)
      chrome.bookmarks.onRemoved.removeListener(this.onRemovedListener)
      chrome.bookmarks.onChanged.removeListener(this.onChangedListener)
      //chrome.bookmarks.onChildrenReordered.removeListener(this.onChildrenReorderedListener)
    }
  }

  clearWorking() {
    if (this.inProgress) {
      useBookmarksStore().loadBookmarks()
        .then(() => console.log("loaded when clearing workload"))
    }
    this.inProgress = false
  }

  intervalID = setInterval(() => this.clearWorking(), 500);

  eventTriggered() {
    this.inProgress = true
  }

  // @ts-ignore
  onCreated(bm: chrome.bookmarks.BookmarkTreeNode) {
    if (!this.inProgress) {
      this.eventTriggered()
      let msg = `bookmark ${bm.url} created`
      console.log("msg", msg)
      useBookmarksStore().loadBookmarks()
        .then(() => console.log("loaded on Created"))
    }
  }


  reload() {
    useBookmarksStore().loadBookmarks()
      .then(() => console.log("loaded on reload"))
  }
}

export default new ChromeBookmarkListeners();

