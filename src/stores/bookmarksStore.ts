import {defineStore} from 'pinia';
import _ from "lodash";
import {TreeNode} from "src/models/Tree";
import {Bookmark} from "src/models/Bookmark";
import {useUtils} from "src/services/Utils";
import {useUiStore} from "stores/uiStore";

function nodesFrom(
  parent: chrome.bookmarks.BookmarkTreeNode,
  allFoldersCount = 0,
  allBookmarksCount = 0,
  level: number = 1): [TreeNode | undefined, number, number] {

  const parentNode = new TreeNode(parent.id, parent.title, parent.title, parent.url, parent.url ? 'o_article' : 'o_folder', [], 0, 0)

  level++
  let subNodes: TreeNode[] = []
  let foldersCount = 0
  let leavesCount = 0
  if (parent.children) {
    for (const c of parent.children) {
      const [allNodes, fCount, bCount] = nodesFrom(c, allFoldersCount, allBookmarksCount)
      foldersCount += fCount
      leavesCount += bCount
      if (allNodes && allNodes.url) {
        leavesCount++
      } else {
        foldersCount++
      }
      if (allNodes) {
        subNodes.push(allNodes)
      }
    }
  }
  parentNode.children = subNodes
  parentNode.subFoldersCount = foldersCount
  parentNode.subNodesCount = leavesCount
  return [parentNode, allFoldersCount + foldersCount, allBookmarksCount + leavesCount]
}

function nodesWithoutLeaves(
  parent: TreeNode,
): TreeNode | undefined {

  if (parent.header !== 'node') {
    return undefined
  }
  if (parent.children) {
    const folderChildren: TreeNode[] = []
    for (const c of parent.children) {
      const childNodeWithoutLeaves = nodesWithoutLeaves(c)
      if (childNodeWithoutLeaves) {
        folderChildren.push(c)
      }
    }
    parent.children = folderChildren
  }

  return parent
}

export const useBookmarksStore = defineStore('bookmarks', {
  state: () => ({
    bookmarksTree: [] as unknown as object[],
    bookmarksNodes: [] as unknown as object[],
    nonLeafNodes: [] as unknown as TreeNode[],
    bookmarksNodes2: [] as unknown as TreeNode[],
    bookmarksLeaves: [] as unknown as object[],
    currentBookmark: null as unknown as Bookmark,

    // the bookmarks (nodes and leaves) for the selected parent id
    bookmarksForFolder: null as unknown as Bookmark[],

    bookmarksCount: 0,
    foldersCount: 0
  }),

  getters: {
    findBookmarksForUrl: (state) => {
      return async (url: string): Promise<chrome.bookmarks.BookmarkTreeNode[]> => {
        const res = await chrome.bookmarks.search({url: url})
        return res
      }
    }
  },

  actions: {
    init() {
      console.debug(" ...initializing bookmarkStore")
      if (process.env.MODE !== 'bex') {
        return Promise.resolve()
      }
      this.initListeners()
    },
    async loadBookmarks(): Promise<void> {
      useUiStore().bookmarksLoading = true
      this.bookmarksTree = []
      this.bookmarksNodes = []
      this.bookmarksNodes2 = []
      this.nonLeafNodes = []
      this.bookmarksLeaves = []
      //const accessGranted = usePermissionsStore().hasPermission("bookmarks") && usePermissionsStore().hasFeature(FeatureIdent.BOOKMARKS)
      console.debug(" ...loading bookmarks")//, (new Error()).stack)
      // @ts-ignore
      const bookmarks: chrome.bookmarks.BookmarkTreeNode[] = await chrome.bookmarks.search({})//, async (bookmarks) => {
      this.bookmarksLeaves = bookmarks

      // @ts-ignore
      const tree: chrome.bookmarks.BookmarkTreeNode[] = await chrome.bookmarks.getTree()

      //console.log("*** ======= tree", tree)
      const nodes = nodesFrom(tree[0])
      //console.log("bookmarksNodes2", nodes.toString())
      if (nodes[0]) {
        this.bookmarksNodes2 = nodes[0].children
        let copy = (JSON.parse(JSON.stringify(nodes[0])));
        this.nonLeafNodes = nodesWithoutLeaves(copy)?.children || []
      }
      this.foldersCount = nodes[1]
      this.bookmarksCount = nodes[2]

      useUiStore().bookmarksLoading = false
      return Promise.resolve()


    },
    remove(bm: Bookmark) {
      this.bookmarksForFolder = _.filter(this.bookmarksForFolder, (e: Bookmark) => e.id !== bm.id)
    },
    initListeners() {
      // moved to chromeBookmarkListeners
    },
    updateUrl(from: string, to: string) {
      chrome.bookmarks.search({url: from}, (results: chrome.bookmarks.BookmarkTreeNode[]) => {
        results.forEach((r: chrome.bookmarks.BookmarkTreeNode) => {
          chrome.bookmarks.update(r.id, {url: to}, updateResult => {
            console.log("updated bookmark", updateResult)
          })
        })
      })
    }

  }
});
