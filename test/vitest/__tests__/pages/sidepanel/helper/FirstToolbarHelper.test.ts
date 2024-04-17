import {installQuasarPlugin} from '@quasar/quasar-app-extension-testing-unit-vitest';
import {mount} from '@vue/test-utils';
import {beforeAll, beforeEach, describe, expect, it, vi} from 'vitest';
import {createPinia, setActivePinia} from "pinia";
import {useTabsStore} from "stores/tabsStore";
import ChromeApi from "src/services/ChromeApi";
import IndexedDbPersistenceService from "src/services/IndexedDbPersistenceService";
import FirstToolbarHelper from "pages/sidepanel/helper/FirstToolbarHelper.vue";
import {CreateTabsetCommand} from "src/domain/tabsets/CreateTabset";

installQuasarPlugin();

describe('FirstToolbarHelper', () => {

  vi.mock("vue-i18n", () => ({
    useI18n: () => ({t: (key: string) => key === 'welcome_to_tabsets' ? "Welcome to Tabsets" : key}),
  }));

  const skysailChromeTab = ChromeApi.createChromeTabObject("title", "https://www.skysail.io", "favicon")

  beforeEach(async () => {
    setActivePinia(createPinia())

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
        })
      }
    };

    vi.stubGlobal('chrome', chromeMock);
  })

  it('should be mounted', async () => {
    await IndexedDbPersistenceService.init("db")
    useTabsStore().setCurrentChromeTab(skysailChromeTab)
    const wrapper = mount(FirstToolbarHelper);
    console.log("hier", wrapper.html())
    expect(wrapper.text()).toContain("My Tabsets");
    expect(wrapper.text()).not.toContain("search");
  });


});
