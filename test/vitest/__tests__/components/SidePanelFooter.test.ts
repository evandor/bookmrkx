vi.mock('src/boot/firebase2.ts')

import {installQuasarPlugin} from '@quasar/quasar-app-extension-testing-unit-vitest';
import {DOMWrapper, mount, shallowMount, VueWrapper} from '@vue/test-utils';
import {afterEach, beforeAll, beforeEach, describe, expect, it, vi} from 'vitest';
import {createPinia, setActivePinia} from "pinia";
import SidePanelFooter from "components/SidePanelFooter.vue";
import ChromeApi from "src/services/ChromeApi";
import PersistenceService from "src/services/PersistenceService";
import {useDB} from "src/services/usePersistenceService";
import {useQuasar} from "quasar";
import IndexedDbPersistenceService from "src/services/IndexedDbPersistenceService";
import {useTabsetService} from "src/services/TabsetService2";
import {useWindowsStore} from "stores/windowsStore";

installQuasarPlugin();

async function setupStores(db: PersistenceService) {
  await useWindowsStore().initialize(db)
  useWindowsStore().initListeners()
}


describe('SidePanelFooter', () => {

  const skysailChromeTab = ChromeApi.createChromeTabObject(
    "title", "https://www.skysail.io/some-subpage", "favicon")

  let db = null as unknown as PersistenceService
  let wrapper: VueWrapper<any, any> = null as unknown as VueWrapper
  let manageWindowsButton: DOMWrapper<Element> = null as unknown as DOMWrapper<Element>

  const tab1 = ChromeApi.createChromeTabObject("skysail", "https://www.skysail.io")
  const window100: chrome.windows.Window = ChromeApi.createChromeWindowObject(100, 17, 28, [tab1])

  let currentWindows: any[]

  beforeAll(() => {
    // https://vitest.dev/guide/browser.html
    // @ts-ignore - needed as 'chrome' is undefined in vitest
    global.chrome = undefined
    // global.browser = browser
    db = useDB(useQuasar()).localDb
  })

  beforeEach(async () => {
    setActivePinia(createPinia())
    await IndexedDbPersistenceService.init("db")
    db = useDB(undefined).db
    // await usePermissionsStore().initialize(new LocalStoragePersistenceService(useQuasar()))
    await useTabsetService().init(db)

    const chromeMock = {
      commands: {
        onCommand: {
          addListener: vi.fn(() => {
            return [];
          }),
        }
      },
      tabs: {
        query: vi.fn(() => {
        }),
        onCreated: {
          addListener: vi.fn((tab: chrome.tabs.Tab) => {
            console.log("mocking chrome.windows.onCreated.addListener", tab)
          })
        },
        onUpdated: {
          addListener: vi.fn((tabId: number, updateInfo: chrome.tabs.TabChangeInfo) => {
            console.log("mocking chrome.windows.onUpdated.addListener", tabId)
          })
        },
        onRemoved: {
          addListener: vi.fn((tabId: number, removeInfo: chrome.tabs.TabRemoveInfo) => {
            console.log("mocking chrome.windows.onRemoved.addListener", tabId)
          })
        }
      },
      runtime: {
        sendMessage: vi.fn(() => {
        }),
        onMessage: {
          addListener: vi.fn((message: any, sender: chrome.runtime.MessageSender, sendResponse: any) => {
            console.log("mocking chrome.windows.onCreated.addListener", message)
            //onCreatedListener = listener
            return true
          })
        }
      },
      windows: {
        getAll: vi.fn((options, callback) => {
          console.log("mocking chrome.windows.getAll", currentWindows.length)
          //callback(currentWindows);
          return Promise.resolve(currentWindows)
        }),
        getCurrent: vi.fn((options, callback) => {
          //console.log("mocking chrome.windows.getCurrent")
          callback(window100)
        }),
        onCreated: {
          addListener: vi.fn((listener) => {
            //console.log("mocking chrome.windows.onCreated.addListener", listener)
            //onCreatedListener = listener
          })
        },
        onRemoved: {
          addListener: vi.fn((listener) => {
            //console.log("mocking chrome.windows.onRemoved.addListener", listener)
            // onRemovedListener = listener
          })
        },
        onFocusChanged: {
          addListener: vi.fn((listener) => {
            console.log("mocking chrome.windows.onFocusChanged.addListener", listener)
            //onFocusChangedListener = listener
          })
        },
        onBoundsChanged: {
          addListener: vi.fn((listener) => {
            //console.log("mocking chrome.windows.onBoundsChanged.addListener", listener)
            //callback(undefined)
          })
        }
      }
    };

    vi.stubGlobal('chrome', chromeMock);

    wrapper = mount(SidePanelFooter);

    manageWindowsButton = wrapper.find('[data-testid=buttonManageWindows]')

  })

  afterEach(async () => {
    db.clear("tabsets")
    db.clear("windows")
  })

  it('should be mounted', async () => {
    expect(wrapper.text()).toContain("grid");
    expect(wrapper.text()).toContain("view");
    expect(wrapper.text()).toContain("show");
    expect(wrapper.text()).toContain("chart");
    expect(wrapper.text()).not.toContain("Open Window");
  });

  it('should show window markup table when window management button is clicked', async () => {
    currentWindows = [window100]
    await setupStores(db)

    await manageWindowsButton.trigger('click')

    expect(wrapper.text()).toContain("Open Window");
    const cellWithNameForWindowId100 = wrapper.find('[data-testid=windowDataColumn_name_100]')
    expect(cellWithNameForWindowId100.text()).toBe("100")
    const cellWithTabsCountForWindowId100 = wrapper.find('[data-testid=windowDataColumn_tabsCount_100]')
    expect(cellWithTabsCountForWindowId100.text()).toBe("1")

    const windows = await db.getWindows()
    console.log("windows", windows)
    expect(windows.length).toBe(1)
    expect(windows[0].id).toBe(100)
    expect(windows[0].index).toBe(0)
    expect(windows[0].open).toBe(true)
    expect(windows[0].hostList).toStrictEqual(['www.skysail.io'])
  });

})
