import {installQuasarPlugin} from '@quasar/quasar-app-extension-testing-unit-vitest';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {createPinia, setActivePinia} from "pinia";
import IndexedDbPersistenceService from "src/services/IndexedDbPersistenceService";
import {useDB} from "src/services/usePersistenceService";
import PersistenceService from "src/services/PersistenceService";
import {useTabsetService} from "src/services/TabsetService2";
import {useWindowsStore} from "stores/windowsStore";
import ChromeApi from "src/services/ChromeApi";

installQuasarPlugin();

vi.mock('vue-router')

let onCreatedListener = null as unknown as ((window: chrome.windows.Window) => Promise<void>)
let onRemovedListener = null as unknown as ((windowId: number) => Promise<void>)
let onFocusChangedListener = null as unknown as ((windowId: number) => Promise<void>)

let currentWindows: any[]

async function setupMocks(currentWindow: any) {
  //console.log("setupMocks with current windows", currentWindows)
  // https://groups.google.com/a/chromium.org/g/chromium-extensions/c/hssoAlvluW8
  const chromeMock = {
    windows: {
      getAll: vi.fn((options, callback) => {
        console.log("mocking chrome.windows.getAll", currentWindows.length)
        //callback(currentWindows);
        return Promise.resolve(currentWindows)
      }),
      getCurrent: vi.fn((options, callback) => {
        //console.log("mocking chrome.windows.getCurrent")
        callback(currentWindow)
      }),
      getLastFocused: vi.fn((options, callback) => {
        //console.log("mocking chrome.windows.getLastFocused")
        callback(currentWindow)
      }),
      get: vi.fn((windowId, queryOptions, callback) => {
        console.log("mocking chrome.windows.get", windowId, queryOptions)
        currentWindow.left = 33
        return currentWindow
      }),
      onCreated: {
        addListener: vi.fn((listener) => {
          onCreatedListener = listener
        })
      },
      onRemoved: {
        addListener: vi.fn((listener) => {
          onRemovedListener = listener
        })
      },
      onFocusChanged: {
        addListener: vi.fn((listener) => {
          console.log("mocking chrome.windows.onFocusChanged.addListener", listener)
          onFocusChangedListener = listener
        })
      },
      onBoundsChanged: {
        addListener: vi.fn((listener) => {
        })
      }
    },
    runtime: {
      sendMessage: vi.fn(() => {
      })
    }
  };

  vi.stubGlobal('chrome', chromeMock);
}

async function setupStores(db: PersistenceService) {
  await useWindowsStore().initialize(db)
  useWindowsStore().initListeners()
}

describe('WindowsStore', () => {

  let db = null as unknown as PersistenceService

  const tab1 = ChromeApi.createChromeTabObject("skysail", "https://www.skysail.io")
  const tab2 = ChromeApi.createChromeTabObject("tabsets", "https://www.tabsets.net")
  const tab3 = ChromeApi.createChromeTabObject("docs", "https://docs.tabsets.net")

  const window100: chrome.windows.Window = ChromeApi.createChromeWindowObject(100, 17, 28, [tab1, tab2])
  const window200: chrome.windows.Window = ChromeApi.createChromeWindowObject(200, 17, 28, [tab2])
  const window300: chrome.windows.Window = ChromeApi.createChromeWindowObject(300, 37, 48, [tab3])

  //const currentWindows = [window100, window200]

  beforeEach(async () => {
    setActivePinia(createPinia())
    await IndexedDbPersistenceService.init("db")
    db = useDB(undefined).db
    await useTabsetService().init(db)
  })

  afterEach(async () => {
    db.clear("tabsets")
    db.clear("windows")
  })

  it('initializing correctly with multiple windows and indices differing', async () => {

    currentWindows = [window100, window200]
    await setupMocks(window100)
    await setupStores(db)

    const windows = await db.getWindows()
    expect(windows.length).toBe(2)
    expect(windows[0].id).toBe(100)
    expect(windows[1].id).toBe(200)

    const window = await db.getWindow(100)
    expect(window?.id).toBe(100)
    expect(window?.index).toBe(0)
    expect(window?.hostList).toStrictEqual(['www.skysail.io', 'www.tabsets.net'])
    expect(useWindowsStore().currentChromeWindow.id).toBe(100)

    const w200 = await db.getWindow(200)
    expect(w200?.id).toBe(200)
    expect(w200?.index).toBe(1)
    expect(w200?.hostList).toStrictEqual(['www.tabsets.net'])

  })

  it('upsertWindow saves new title', async () => {
    currentWindows = [window100, window200]
    await setupMocks(window100)
    await setupStores(db)

    const window = await db.getWindow(100)
    if (window) {
      await useWindowsStore().upsertWindow(window.browserWindow!, "theTitle")
      const updatedWindow = await db.getWindow(100)
      expect(updatedWindow?.title).toBe("theTitle")
    } else {
      expect(true).toBeFalsy()
    }
  })

  it('onRemoved does not remove window with title', async () => {
    currentWindows = [window300, window200]
    await setupMocks(window300)
    await setupStores(db)

    const window = await db.getWindow(300)
    if (window) {
      await useWindowsStore().upsertWindow(window.browserWindow!, "theTitle")
      await onRemovedListener(300)
      const window300FromDb = await db.getWindow(300)
      expect(window300FromDb?.id).toBe(300)
    } else {
      expect(true).toBeFalsy()
    }
  })

  it('onCreate yields new window', async () => {
    const window: chrome.windows.Window = ChromeApi.createChromeWindowObject(1000, 0, 0)
    currentWindows = [window100, window200, window]
    await setupMocks(window100)
    await setupStores(db)
    await onCreatedListener(window)
    // await useWindowsStore().persistGroup(ChromeApi.createChromeTabGroupObject(1, "groupName", 'grey' as chrome.tabGroups.ColorEnum))
    //const groups = await  db.getGroups()
    // expect(groups.length).toBe(1)
    const window1000FromDb = await db.getWindow(1000)
    expect(window1000FromDb?.id).toBe(1000)
    expect(window1000FromDb?.browserWindow?.left).toBe(0)
    expect(window1000FromDb?.index).toBe(2)
  })

  it('onCreate keeps existing titles', async () => {
    currentWindows = [window100, window200]
    await setupMocks(window100)
    await setupStores(db)

    const window100FromDb = await db.getWindow(100)
    if (!window100FromDb) {
      expect(true).toBeFalsy()
    }
    // @ts-ignore
    await useWindowsStore().upsertWindow(window100FromDb?.browserWindow, "theTitle")

    const window: chrome.windows.Window = ChromeApi.createChromeWindowObject(1000, 0, 0)
    currentWindows = [window100, window200, window]
    await setupMocks(window100)
    await onCreatedListener(window)
    const updatedWindow100 = await db.getWindow(100)
    expect(updatedWindow100?.title).toBe("theTitle")
  })

  it('onCreate reuses existing window when matched', async () => {
    const windowWithSameTabsAsWindow100: chrome.windows.Window = ChromeApi.createChromeWindowObject(1000, 0, 0, [tab1, tab2])
    currentWindows = [window100, window200]
    await setupMocks(window100)
    await setupStores(db)

    const w100 = await db.getWindow(100)
    if (w100) {
      w100.title = "theTitle"
      await db.updateWindow(w100)
    }

    console.log("==============")
    currentWindows = [window100, window200, windowWithSameTabsAsWindow100]
    await onCreatedListener(windowWithSameTabsAsWindow100) // should 'reuse' existing window100
    console.log("==============")
    const updatedWindow1000 = await db.getWindow(1000)
    expect(updatedWindow1000?.title).toBe("theTitle")
    expect((await db.getWindows()).length).toBe(2)
  })

  // it('tabset with open-in-window setting is added', async () => {
  //
  //   currentWindows = [window100]
  //   await setupMocks(window100)
  //   await useCommandExecutor().execute(new CreateTabsetCommand("tsName", [], 'open-in-window'))
  //   await setupStores(db)
  //
  //   const windowsFromDb  = await db.getWindows()
  //   expect(windowsFromDb.length).toBe(2)
  // })

  // it('persists group with changing title', async () => {
  //     await useGroupsStore().initialize(db)
  //     await useGroupsStore().persistGroup(ChromeApi.createChromeTabGroupObject(1, "ab", 'grey' as chrome.tabGroups.ColorEnum))
  //     await useGroupsStore().persistGroup(ChromeApi.createChromeTabGroupObject(1, "abc", 'grey' as chrome.tabGroups.ColorEnum))
  //
  //     const groups = await  db.getGroups()
  //     expect(groups.length).toBe(1)
  //     expect(groups[0].title).toBe("abc")
  // })


});
