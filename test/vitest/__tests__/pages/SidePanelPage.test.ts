import {installQuasarPlugin} from '@quasar/quasar-app-extension-testing-unit-vitest';
import {mount, VueWrapper} from '@vue/test-utils';
import {beforeAll, beforeEach, describe, expect, it, vi} from 'vitest';
import {createPinia, setActivePinia} from "pinia";
import {useTabsStore} from "stores/tabsStore";
import ChromeApi from "src/services/ChromeApi";
import IndexedDbPersistenceService from "src/services/IndexedDbPersistenceService";
import SidePanelPage from "pages/SidePanelPage.vue";
import {useDB} from "src/services/usePersistenceService";
import PersistenceService from "src/services/PersistenceService";
import {useQuasar} from "quasar";
import {CreateTabsetCommand} from "src/domain/tabsets/CreateTabset";
import {useTabsetService} from "src/services/TabsetService2";

installQuasarPlugin();

describe('SidePanelPage', () => {


  vi.mock("vue-i18n", () => ({
    useI18n: () => ({t: (key: string) => key === 'welcome_to_tabsets' ? "Welcome to Tabsets" : key}),
  }));

  const skysailChromeTab = ChromeApi.createChromeTabObject(
    "title", "https://www.skysail.io/some-subpage", "favicon")

  let db = null as unknown as PersistenceService
  let wrapper: VueWrapper<any, any> = null as unknown as VueWrapper

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
        })
      },
      runtime: {
        sendMessage: vi.fn(() => {
        }),
        onMessage: {
          addListener: vi.fn(() => {
          })
        }
      }
    };

    vi.stubGlobal('chrome', chromeMock);

    wrapper = mount(SidePanelPage);

  })

  it('should be mounted', async () => {
    useTabsStore().setCurrentChromeTab(skysailChromeTab)
    console.log("hier", wrapper.html())
    expect(wrapper.text()).toContain("My Tabsets");
    expect(wrapper.text()).not.toContain("search");
  });

  it('should show existing tabset', async () => {
    await new CreateTabsetCommand("existing Tabset", []).execute()
    useTabsStore().setCurrentChromeTab(skysailChromeTab)
    const wrapper = mount(SidePanelPage);
    //console.log("hier", wrapper.html())
    //console.log("hier2", wrapper.text())
    expect(wrapper.html()).toContain("existing Tabset");
    //expect(wrapper.html()).not.toContain("search");
  });


});
