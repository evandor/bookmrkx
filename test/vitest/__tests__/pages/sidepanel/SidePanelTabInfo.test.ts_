import {installQuasarPlugin} from '@quasar/quasar-app-extension-testing-unit-vitest';
import {mount} from '@vue/test-utils';
import {beforeAll, beforeEach, describe, expect, vi, it} from 'vitest';
import {createPinia, setActivePinia} from "pinia";
import {useTabsStore} from "stores/tabsStore";
import ChromeApi from "src/services/ChromeApi";
import IndexedDbPersistenceService from "src/services/IndexedDbPersistenceService";
import SidePanelTabInfo from "pages/sidepanel/SidePanelTabInfo.vue";
import {useRoute, useRouter} from "vue-router";

installQuasarPlugin();

vi.mock('vue-router')

describe('SidePanelTabInfo', () => {

  const skysailChromeTab = ChromeApi.createChromeTabObject("title", "https://www.skysail.io", "favicon")

  // @ts-ignore
  useRouter.mockReturnValue({
    push: vi.fn(),
  })

  // @ts-ignore
  useRoute.mockReturnValue({
    query: {
      name,
    },
  })

  beforeEach(async () => {
    setActivePinia(createPinia())
    // @ts-ignore
    useRouter().push.mockReset()
  })

  it('should be mounted', async () => {
    await IndexedDbPersistenceService.init("db")
    //useTabsStore().setCurrentChromeTab(skysailChromeTab)
    const wrapper = mount(SidePanelTabInfo);
    console.log("wrapper", wrapper.html())
    // expect(wrapper.text()).toContain("www.skysail.io");
    // expect(wrapper.text()).toContain("title");
    // expect(wrapper.text()).toContain("www.skysail.io");
  });



});
