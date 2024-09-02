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

installQuasarPlugin();

async function setupStores(db: PersistenceService) {
}


describe('SidePanelFooter', () => {


  let db = null as unknown as PersistenceService
  let wrapper: VueWrapper<any, any> = null as unknown as VueWrapper
  let manageWindowsButton: DOMWrapper<Element> = null as unknown as DOMWrapper<Element>

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
    expect(wrapper.text()).toContain("settings");
    expect(wrapper.text()).not.toContain("Open Window");
  });



})
