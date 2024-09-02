import {installQuasarPlugin} from '@quasar/quasar-app-extension-testing-unit-vitest';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {createPinia, setActivePinia} from "pinia";
import {useBookmarksStore} from "src/bookmarks/stores/bookmarksStore";
import ChromeApi from "src/services/ChromeApi";
import {TreeNode} from "src/models/Tree";

installQuasarPlugin();

vi.mock('vue-router')

async function setupMocks(bms: chrome.bookmarks.BookmarkTreeNode[]) {
  const chromeMock = {
    bookmarks: {
      search: vi.fn((options, callback) => {
        return Promise.resolve(bms)
      }),
      getTree: vi.fn((options, callback) => {
        return Promise.resolve(bms)
      })
    },
    runtime: {
      sendMessage: vi.fn(() => {
      })
    }
  };

  vi.stubGlobal('chrome', chromeMock);

  vi.mock('src/stores/permissionsStore', () => ({
    usePermissionsStore: () => ({
      hasPermission: vi.fn((ident: string) => true),
      hasFeature: vi.fn((ident: string) => true),
    }),
  }))
}

async function setup(tree: chrome.bookmarks.BookmarkTreeNode[]) {
  await setupMocks(tree)
  await setupStores()
}

async function setupStores() {
  await useBookmarksStore().init()
  await useBookmarksStore().loadBookmarks()
}

describe('BookmarksStore', () => {

  beforeEach(async () => {
    setActivePinia(createPinia())
  })

  // counts

  it('count folders and leaves correctly for simple tree', async () =>
  {
    const rootFolder = ChromeApi.createFolderNode("root", [
      ChromeApi.createFolderNode("folderA")
    ])

    await setup([rootFolder])

    expect(useBookmarksStore().bookmarksCount).toBe(0)
    expect(useBookmarksStore().foldersCount).toBe(1)
  })

  it('count folders and leaves correctly for folder with two bookmarks', async () =>
  {
    const rootFolder = ChromeApi.createFolderNode("root", [
      ChromeApi.createFolderNode("folderA", [
        ChromeApi.createBmNode("bm1", "url1"),
        ChromeApi.createBmNode("bm2", "url2")
      ])
    ])

    await setup([rootFolder])

    expect(useBookmarksStore().bookmarksCount).toBe(2)
    expect(useBookmarksStore().foldersCount).toBe(1)
  })

  it('count folders and leaves correctly for two parallel empty folders', async () =>
  {
    const rootFolder = ChromeApi.createFolderNode("root", [
      ChromeApi.createFolderNode("folderA"),
      ChromeApi.createFolderNode("folderB")
    ])

    await setup([rootFolder])

    expect(useBookmarksStore().bookmarksCount).toBe(0)
    expect(useBookmarksStore().foldersCount).toBe(2)
  })

  it('count folders and leaves correctly for two folders with one bookmark each', async () =>
  {
    const rootFolder = ChromeApi.createFolderNode("root", [
      ChromeApi.createFolderNode("folderA", [
        ChromeApi.createBmNode("bm1", "url1"),
      ]),
      ChromeApi.createFolderNode("folderB", [
        ChromeApi.createBmNode("bm2", "url2")
      ])
    ])

    await setup([rootFolder])

    expect(useBookmarksStore().bookmarksCount).toBe(2)
    expect(useBookmarksStore().foldersCount).toBe(2)
  })

  it('initializing bookmarksNodes2 correctly for simplest bookmarks tree', async () => {

    const rootFolder = ChromeApi.createFolderNode("root", [
      ChromeApi.createFolderNode("folderA")
    ])

    await setupMocks([rootFolder])
    await setupStores()

    const nonLeafNodes = useBookmarksStore().nonLeafNodes
    const bmNodes = useBookmarksStore().bookmarksNodes2 as TreeNode[]
    console.log("bmNodes", bmNodes.toString())
    expect(bmNodes.length).toBe(1)
    expect(bmNodes[0].header).toBe('node')
    expect(bmNodes[0].id.length).toBe(36)
    expect(bmNodes[0].url).toBe(undefined)
    expect(bmNodes[0].children.length).toBe(0)
    expect(bmNodes[0].subFoldersCount).toBe(0)
    expect(bmNodes[0].subNodesCount).toBe(0)

  })

  it('initializing nonLeafNodes correctly for simplest bookmarks tree', async () => {

    const rootFolder = ChromeApi.createFolderNode("root", [
      ChromeApi.createFolderNode("folderA")
    ])

    await setupMocks([rootFolder])
    await setupStores()

    const nonLeafNodes = useBookmarksStore().nonLeafNodes
    console.log("nonLeafNodes", nonLeafNodes.toString())
    expect(nonLeafNodes.length).toBe(1)
    expect(nonLeafNodes[0].header).toBe('node')
    expect(nonLeafNodes[0].id.length).toBe(36)
    expect(nonLeafNodes[0].url).toBe(undefined)
    expect(nonLeafNodes[0].children.length).toBe(0)
    expect(nonLeafNodes[0].subFoldersCount).toBe(0)
    expect(nonLeafNodes[0].subNodesCount).toBe(0)
  })

  it('initializing bookmarksNodes2 correctly for bookmarks with first level bookmark', async () => {

    const rootFolder = ChromeApi.createFolderNode("root", [
      ChromeApi.createFolderNode("folderA", [
        ChromeApi.createBmNode("bm1", "url1")
      ])
    ])
    await setupMocks([rootFolder])
    await setupStores()

    const bmNodes = useBookmarksStore().bookmarksNodes2
    // console.log("bmNodes", bmNodes.toString())
    expect(bmNodes.length).toBe(1)
    expect(bmNodes[0].header).toBe('node')
    expect(bmNodes[0].url).toBe(undefined)
    expect(bmNodes[0].children.length).toBe(1)
    expect(bmNodes[0].subFoldersCount).toBe(0)
    expect(bmNodes[0].subNodesCount).toBe(1)
    expect(useBookmarksStore().bookmarksCount).toBe(1)
    expect(useBookmarksStore().foldersCount).toBe(1)
  })

  it('initializing nonLeafNodes correctly for bookmarks with first level bookmark', async () => {

    const rootFolder = ChromeApi.createFolderNode("root", [
      ChromeApi.createFolderNode("folderA", [
        ChromeApi.createBmNode("bm1", "url1")
      ])
    ])
    await setupMocks([rootFolder])
    await setupStores()

    const nonLeafNodes = useBookmarksStore().nonLeafNodes
    // console.log("bmNodes", bmNodes.toString())
    expect(nonLeafNodes.length).toBe(1)
    expect(nonLeafNodes[0].header).toBe('node')
    expect(nonLeafNodes[0].url).toBe(undefined)
    expect(nonLeafNodes[0].children.length).toBe(0)
    expect(nonLeafNodes[0].subFoldersCount).toBe(0)
    expect(nonLeafNodes[0].subNodesCount).toBe(1)
  })

  it('initializing bookmarksNodes2 correctly for bookmarks with two first level bookmarks', async () => {

    const rootFolder = ChromeApi.createFolderNode("root", [
      ChromeApi.createFolderNode("folderA", [
        ChromeApi.createBmNode("bm1", "url1"),
        ChromeApi.createBmNode("bm2", "url2")
      ])
    ])
    await setupMocks([rootFolder])
    await setupStores()

    const bmNodes = useBookmarksStore().bookmarksNodes2

    console.log("bmNodes", bmNodes)
    expect(bmNodes.length).toBe(1)
    expect(bmNodes[0].children.length).toBe(2)
    expect(bmNodes[0].subFoldersCount).toBe(0)
    expect(bmNodes[0].subNodesCount).toBe(2)
    expect(useBookmarksStore().bookmarksCount).toBe(2)
    expect(useBookmarksStore().foldersCount).toBe(1)

    expect(bmNodes[0].children[0].title).toBe("bm1")
    expect(bmNodes[0].children[0].url).toBe("url1")
    expect(bmNodes[0].children[0].subNodesCount).toBe(0)
    expect(bmNodes[0].children[0].subFoldersCount).toBe(0)
    expect(bmNodes[0].children[0].children.length).toBe(0)
    expect(bmNodes[0].children[1].title).toBe("bm2")
    expect(bmNodes[0].children[1].url).toBe("url2")
    expect(bmNodes[0].children[1].subNodesCount).toBe(0)
    expect(bmNodes[0].children[1].subFoldersCount).toBe(0)
    expect(bmNodes[0].children[1].children.length).toBe(0)
  })

  it('initializing nonLeafNodes correctly for bookmarks with two first level bookmarks', async () => {

    const rootFolder = ChromeApi.createFolderNode("root", [
      ChromeApi.createFolderNode("folderA", [
        ChromeApi.createBmNode("bm1", "url1"),
        ChromeApi.createBmNode("bm2", "url2")
      ])
    ])
    await setupMocks([rootFolder])
    await setupStores()

    const nonLeafNodes = useBookmarksStore().nonLeafNodes

    expect(nonLeafNodes.length).toBe(1)
    expect(nonLeafNodes[0].children.length).toBe(0)
    expect(nonLeafNodes[0].subFoldersCount).toBe(0)
    expect(nonLeafNodes[0].subNodesCount).toBe(2)

  })

  it('initializing nonLeafNodes correctly for more complex scenario', async () => {

    const rootFolder = ChromeApi.createFolderNode("root", [
      ChromeApi.createFolderNode("Lesezeichenleiste"),
      ChromeApi.createFolderNode("Andere Lesezeichen", [
        ChromeApi.createBmNode("bm1", "url1"),
        ChromeApi.createFolderNode("subfolder", [
          ChromeApi.createBmNode("skysail", "https://www.skysail.io")
        ])
      ])
    ])
    await setupMocks([rootFolder])
    await setupStores()

    const nonLeafNodes = useBookmarksStore().nonLeafNodes

    // Lesezeichenleiste + Andere Lesezeichen
    expect(nonLeafNodes.length).toBe(2)

    // Lesezeichenleiste
    expect(nonLeafNodes[0].children.length).toBe(0)
    expect(nonLeafNodes[0].subFoldersCount).toBe(0)
    expect(nonLeafNodes[0].subNodesCount).toBe(0)

    // Andere Lesezeichen
    expect(nonLeafNodes[1].children.length).toBe(1) // not bm1, but subfolder
    expect(nonLeafNodes[1].subFoldersCount).toBe(1)
    expect(nonLeafNodes[1].subNodesCount).toBe(2)

    // Andere Lesezeichen > bm1
    expect(nonLeafNodes[1].children[0].title).toBe("subfolder")

  })

  it('initializing nonLeafNodes correctly for more complex scenario II', async () => {

    const rootFolder = ChromeApi.createFolderNode("root", [
      ChromeApi.createFolderNode("Lesezeichenleiste", [
        ChromeApi.createFolderNode("empty testfolder")
      ]),
      ChromeApi.createFolderNode("Andere Lesezeichen", [
        ChromeApi.createBmNode("bm1", "url1"),
        ChromeApi.createFolderNode("subfolder", [
          ChromeApi.createBmNode("bm2", "url2")
        ])
      ])
    ])
    await setupMocks([rootFolder])
    await setupStores()

    const nonLeafNodes = useBookmarksStore().nonLeafNodes

    expect(useBookmarksStore().bookmarksCount).toBe(2)
    expect(useBookmarksStore().foldersCount).toBe(4)

    // Lesezeichenleiste + Andere Lesezeichen
    expect(nonLeafNodes.length).toBe(2)

    // Lesezeichenleiste
    expect(nonLeafNodes[0].children.length).toBe(1)
    expect(nonLeafNodes[0].subFoldersCount).toBe(1)
    expect(nonLeafNodes[0].subNodesCount).toBe(0)

    // Andere Lesezeichen
    expect(nonLeafNodes[1].children.length).toBe(1) // not bm1, but subfolder
    expect(nonLeafNodes[1].subFoldersCount).toBe(1)
    expect(nonLeafNodes[1].subNodesCount).toBe(2)

    // Andere Lesezeichen > bm1
    expect(nonLeafNodes[1].children[0].title).toBe("subfolder")

  })
});
