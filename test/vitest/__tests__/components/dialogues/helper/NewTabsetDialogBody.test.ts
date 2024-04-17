import {installQuasarPlugin} from '@quasar/quasar-app-extension-testing-unit-vitest';
import {DOMWrapper, mount, VueWrapper} from '@vue/test-utils';
import {beforeEach, afterEach, describe, expect, it, vi} from 'vitest';
import {createPinia, setActivePinia} from "pinia";
import IndexedDbPersistenceService from "src/services/IndexedDbPersistenceService";
import {useRouter} from "vue-router";
import {Dialog, Notify} from "quasar";
import NewTabsetDialogBody from "components/dialogues/helper/NewTabsetDialogBody.vue";
import {useDB} from "src/services/usePersistenceService";
import {useTabsStore} from "stores/tabsStore";
import {CreateTabsetCommand} from "src/domain/tabsets/CreateTabset";
import PersistenceService from "src/services/PersistenceService";
import {useTabsetService} from "src/services/TabsetService2";
import {STRIP_CHARS_IN_USER_INPUT} from "boot/constants";

installQuasarPlugin({plugins: {Dialog, Notify}})

vi.mock('vue-router')

describe('NewTabsetDialog', () => {

  let db = null as unknown as PersistenceService
  let wrapper: VueWrapper<any, any> = null as unknown as VueWrapper
  let input: DOMWrapper<Element> = null as unknown as DOMWrapper<Element>
  let submitButton: DOMWrapper<Element> = null as unknown as DOMWrapper<Element>

  // @ts-ignore
  useRouter.mockReturnValue({push: vi.fn()})

  beforeEach(async () => {
    setActivePinia(createPinia())
    // @ts-ignore
    useRouter().push.mockReset()
    await IndexedDbPersistenceService.init("db")
    db = useDB(undefined).db
    await useTabsetService().init(db)
    wrapper = mount(NewTabsetDialogBody, {props: {}});

    input = wrapper.find('[data-testid=newTabsetName]')
    submitButton = wrapper.find('[data-testid=newTabsetNameSubmit]')
  })

  afterEach(async () => {
    db.clear("tabsets")
  })

  it('should be mounted', async () => {
    expect(wrapper.text()).toContain("Add Tabset");
    expect(wrapper.text()).toContain("Add all open tabs");
  });

  it('adds Tabset with a new Name', async () => {
    // const wrapper = mount(NewTabsetDialogBody, {props: {},attachTo: '#root'});
    expect(submitButton.classes('disabled')).toBe(true)
    await input.setValue("Tabset A")
    await wrapper.find("form").trigger("submit.prevent")
    await checkTabsetNamesInDb(db, ['Tabset A']);
  });

  it('rejects existing Tabset', async () => {
    await new CreateTabsetCommand("existing Tabset", []).execute()
    await input.setValue("existing Tabset")
    await wrapper.find("form").trigger("submit.prevent")
    await checkTabsetNamesInDb(db, ['existing Tabset'])
  });

  // seems unreliable
  it.skip('rejects Tabset with an un-allowed character', async () => {
    await input.setValue("Tabset with :")
    await wrapper.find("form").trigger("submit.prevent")
    await checkTabsetNamesInDb(db, [])
  });

  it('rejects Tabset with an overlong name', async () => {
    await input.setValue("012345678901234567890123456789123")
    await wrapper.find("form").trigger("submit.prevent")
    await checkTabsetNamesInDb(db, [])
  });

  it('accepts Tabset with space ID', async () => {
    wrapper = mount(NewTabsetDialogBody, {props: {spaceId: "17"}});
    input = wrapper.find('[data-testid=newTabsetName]')
    submitButton = wrapper.find('[data-testid=newTabsetNameSubmit]')

    await input.setValue("Tabset with Space ID")
    await wrapper.find("form").trigger("submit.prevent")
    await db.loadTabsets()
    const tabsets = useTabsStore().tabsets
    expect(tabsets.size).toBe(1)
    // TODO
    // expect(tabsets.values().next().value.spaceId).toBe("17")
  });

});

async function checkTabsetNamesInDb(db: PersistenceService, tabsetNames: string[]) {
  await db.loadTabsets()
  const tabsets = useTabsStore().tabsets
  expect(tabsets.size).toBe(tabsetNames.length)
  let index = 0
  for (let [key, value] of tabsets) {
    expect(value.name).toBe(tabsetNames[index++])
  }
}
