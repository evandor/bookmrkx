import {installQuasarPlugin} from '@quasar/quasar-app-extension-testing-unit-vitest';
import {DOMWrapper, mount} from '@vue/test-utils';
import {beforeAll, beforeEach, describe, expect, it, vi} from 'vitest';
import {createPinia, setActivePinia} from "pinia";
import {useTabsStore} from "stores/tabsStore";
import ChromeApi from "src/services/ChromeApi";
import IndexedDbPersistenceService from "src/services/IndexedDbPersistenceService";
import MainPanelEntityPage from "pages/mainpanel/MainPanelEntityPage.vue";
import {useRoute, useRouter} from "vue-router";

installQuasarPlugin();

vi.mock('vue-router')

describe('MainPanelEntityPage', () => {

  vi.mock("vue-i18n", () => ({
    useI18n: () => ({t: (key: string) => key === 'welcome_to_tabsets' ? "Welcome to Tabsets" : key}),
  }));

  let nameInput: DOMWrapper<Element> = null as unknown as DOMWrapper<Element>

  const skysailChromeTab = ChromeApi.createChromeTabObject("title", "https://www.skysail.io", "favicon")

  // @ts-ignore
  useRouter.mockReturnValue({push: vi.fn()})

  // @ts-ignore
  useRoute.mockReturnValue({
    params: {
      entityId: "17"
    },
  })

  beforeEach(async () => {
    setActivePinia(createPinia())
    // @ts-ignore
    //useRouter().push.mockReset()

    // const chromeMock = {
    //   commands: {
    //     onCommand: {
    //       addListener: vi.fn(() => {
    //         return [];
    //       }),
    //     }
    //   },
    //   tabs: {
    //     query: vi.fn(() => {
    //     })
    //   },
    //   runtime: {
    //     sendMessage: vi.fn(() => {
    //     })
    //   }
    // };
    //
    // vi.stubGlobal('chrome', chromeMock);
  })

  it('should be mounted', async () => {
    await IndexedDbPersistenceService.init("db")
    useTabsStore().setCurrentChromeTab(skysailChromeTab)
    const wrapper = mount(MainPanelEntityPage);
    console.log("hier", wrapper.html())
    expect(wrapper.text()).toContain("Entity");
    expect(wrapper.text()).not.toContain("search");

    nameInput = wrapper.find('#name')
    console.log("nameInput", nameInput)
    // const submit = wrapper.find('[name="submit"]')
    // console.log("nameinput", nameInput)
    // nameInput.findAllComponents('#name')[0].setValue("Hi")
    // submit.trigger('click')
  });


});
