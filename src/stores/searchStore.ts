import {defineStore} from 'pinia';
import Fuse from 'fuse.js'
import _ from "lodash"
import {SearchDoc} from "src/models/SearchDoc";
import {Tabset} from "src/models/Tabset";
import {ref} from "vue";
import {Tab} from "src/models/Tab";
import {useWindowsStore} from "src/stores/windowsStore";
import {useBookmarksStore} from "src/bookmarks/stores/bookmarksStore";
import {uid} from "quasar";

function dummyPromise(timeout: number, tabToCloseId: number | undefined = undefined): Promise<string> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (tabToCloseId) {
        chrome.tabs.remove(tabToCloseId)
      }
      resolve("Success!");
    }, timeout);
  });
}


function overwrite(ident: string, doc: SearchDoc, removed: SearchDoc[]) {
  if (!doc[ident as keyof object]) {
    doc[ident as keyof object] = removed[0][ident as keyof object]
  }
}

export const useSearchStore = defineStore('search', () => {

  const term = ref<string>('')

  const history = ref([] as unknown as string[])

  const searchIndex = ref(null as unknown as any)

  const fuse = ref(null as unknown as Fuse<SearchDoc>)

  const stats = ref<Map<string, number>>(new Map())

  const options = ref({
    keys: [
      {name: 'name', weight: 10},
      {name: 'title', weight: 6},
      {name: 'url', weight: 4},
      {name: 'description', weight: 3},
      {name: 'keywords', weight: 2},
      {name: 'content', weight: 1},
      {name: 'note', weight: 10}
    ],
    includeScore: true,
    includeMatches: true,
    minMatchCharLength: 3,
    threshold: 0.0,
    // ignoreFieldNorm: true
    ignoreLocation: true,
    useExtendedSearch: true
  })

  var urlSet: Set<string> = new Set()

  async function init() {
    console.debug(" ...(re-)initializing searchStore")
    urlSet = new Set()
    searchIndex.value = Fuse.createIndex(options.value.keys, [])
    fuse.value = new Fuse([], options.value, searchIndex.value)
  }

  // @ts-ignore
  function getIndex(): Fuse.FuseIndex<SearchDoc> {
    return fuse.value ? fuse.value.getIndex() : null
  }

  function search(term: string, limit: number | undefined = undefined) {
    if (limit) {
      return fuse.value.search(term, {limit})
    }
    return fuse.value ? fuse.value.search(term) : []
  }

  function remove(f: any) {
    fuse.value.remove(f)
  }

  function addToIndex(id: string, name: string, title: string, url: string, description: string, content: string, tabsets: string[], favIconUrl: string): number {
    const doc: SearchDoc = new SearchDoc(
      id, name, title, url, description, '', content, tabsets, '', favIconUrl
    )
    //console.log("adding to index", doc)
    // @ts-ignore
    const indexLength = fuse.value.getIndex().size()
    fuse.value.add(doc)
    return indexLength
  }

  function update(url: string, key: string, value: string) {
    //console.log("updating search index", url, key, value)
    if (!fuse || !fuse.value) {
      return // called too early?
    }
    const removed: SearchDoc[] = fuse.value.remove((doc: SearchDoc) => doc.url === url)
    console.debug("found removed: ", removed)
    if (removed && removed.length > 0) {
      let newDoc: SearchDoc = removed[0]
      switch (key) {
        case 'name':
          newDoc.name = value
          break
        case 'note':
          newDoc.note = value
          break
        case 'description':
          newDoc.description = value
          break
        case 'keywords':
          newDoc.keywords = value
          break
        default:
          console.log("could not update", key)
      }
      console.debug("adding new doc", newDoc)
      fuse.value.add(newDoc)
    }
  }

  async function reindexTab(tab: Tab): Promise<number> {
    console.log("reindexing tab", tab)
    const window = await chrome.windows.create({focused: true, width: 1024, height: 800})
    // @ts-ignore
    if (window) {
      // @ts-ignore
      useWindowsStore().screenshotWindow = window.id
      // @ts-ignore
      let tabToClose = await chrome.tabs.create({windowId: window.id, url: tab.url})
      // @ts-ignore
      if (tabToClose) {
        // @ts-ignore
        const promise = dummyPromise(3000, tabToClose.id)
        return promise.then((res) => {
          return window.id || 0
        })
      }
      return Promise.reject("could not get tab")
    }
    return Promise.reject("could not get window")

  }

  function reindex(values: Tabset[]) {
    const urls = values.flatMap((ts: Tabset)=>_.map(ts.tabs, t=>t.url || ''))
    useWindowsStore().openThrottledInWindow(urls)
    // const throttleOnePerXSeconds = throttledQueue(1, 3000, true)
    // chrome.windows.create({focused: true, width: 1024, height: 800}, (window: any) => {
    //   useWindowsStore().screenshotWindow = window.id
    //   let tabToClose: number | undefined = undefined
    //
    //   const res: Promise<any>[] = values.flatMap((ts: Tabset) => {
    //     return ts.tabs.map((t) => {
    //       return throttleOnePerXSeconds(async () => {
    //         chrome.tabs.create({windowId: window.id, url: t.url}, (tab: chrome.tabs.Tab) => {
    //           tabToClose = tab.id
    //           dummyPromise(3000, tab.id)
    //         })
    //         return dummyPromise(3000)
    //       })
    //     })
    //   })
    //
    //   Promise.all(res)
    //     .then(() => {
    //       chrome.windows.remove(window.id)
    //       useWindowsStore().screenshotWindow = null as unknown as number
    //     })
    //
    // })
  }

  async function populateFromTabsets() {
    // --- add data from tabs directly, like url and title
    console.debug(" populating search index from tabsets")
    const minimalIndex: SearchDoc[] = []


    console.debug(` populating search index from tabsets with ${minimalIndex.length} entries`)
    minimalIndex.forEach((doc: SearchDoc) => {
      const removed = fuse.value.remove((d) => {
        return d.url === doc.url
      })
      if (removed && removed[0]) {
        overwrite('name', doc, removed)
        overwrite('description', doc, removed)
        overwrite('keywords', doc, removed)
        overwrite('content', doc, removed)

      }
      fuse.value.add(doc)
    })
  }
  async function populateFromBookmarks() {
    // --- add data from bookmarks directly, like url and title
    console.debug(" ...populating search index from bookmarks")
    const indexFromBookmarks: SearchDoc[] = []
    _.forEach(useBookmarksStore().bookmarksLeaves, (bookmark: any) => {
        if (bookmark && bookmark.url && !urlSet.has(bookmark.url)) {
          urlSet.add(bookmark.url)
          const doc = new SearchDoc("", "", bookmark.title || '', bookmark.url, "", "", "", [], bookmark.id, "")
          indexFromBookmarks.push(doc)
        }
      }
    )
    console.log(` populating search index from bookmarks with ${indexFromBookmarks.length} entries`)
    indexFromBookmarks.forEach((doc: SearchDoc) => fuse.value.add(doc))
  }

  /**
   * Initial population of search index when the extension is reloaded (and when run the first time)
   *
   * @param contentPromise
   */
  async function populateFromContent(contentPromise: Promise<any[]>) {
    console.debug(" populating search index from content")
    // --- add data from stored content
    let count = 0
    let countFiltered = 0
    let overwritten = 0
    const content = await contentPromise
    // .then(content => {
    content.forEach(c => {
      if (c.expires === 0) {
        const searchDoc = new SearchDoc(c.id, c.name, c.title, c.url, c.description, c.keywords, c.content, c.tabsets, '', c.favIconUrl)
        if (c.metas && c.metas['description']) {
          searchDoc.description = c.metas['description']
        }
        if (c.metas && c.metas['keywords']) {
          searchDoc.keywords = c.metas['keywords']
        }
        const removed = fuse.value.remove((doc) => {
          return doc.url === searchDoc.url
        })
        overwritten += removed.length
        fuse.value.add(searchDoc)
        urlSet.add(c.url)
        count++
      } else {
        countFiltered++
      }
    })
    console.debug(` populating search index from content with ${count} entries (${overwritten} of which overwritten), ${countFiltered} is/are filtered (not in any tab)`)
    stats.value.set("content.count", count)
    stats.value.set("content.overwritten", overwritten)
    stats.value.set("content.filtered", countFiltered)

  }

  function indexTabs(tsId: string, tabs: Tab[]) {
    const minimalIndex: SearchDoc[] = []
    const urlSet: Set<string> = new Set()
    tabs.forEach((tab: Tab) => {
      if (tab.url) {
        if (!urlSet.has(tab.url)) {
          const doc = new SearchDoc("", "", tab.title || '', tab.url, "", "", "", [tsId], '', "")
          minimalIndex.push(doc)
          urlSet.add(tab.url)
        }
      }
    })
    if (fuse.value) {
      minimalIndex.forEach((doc: SearchDoc) => fuse.value.add(doc))
    }
  }

  return {
    init,
    populateFromContent,
    populateFromTabsets,
    populateFromBookmarks,
    getIndex,
    addToIndex,
    remove,
    term,
    search,
    indexTabs,
    update,
    reindexTab,
    stats
  }
})
