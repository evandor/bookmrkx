import { installQuasarPlugin } from '@quasar/quasar-app-extension-testing-unit-vitest';
import { mount } from '@vue/test-utils';
import {beforeEach, describe, expect, it } from 'vitest';
import AddBookmarkFolderDialog from "components/dialogues/AddBookmarkFolderDialog.vue";
import {createPinia, setActivePinia} from "pinia";
import IndexedDbPersistenceService from "src/services/IndexedDbPersistenceService";

installQuasarPlugin();

describe('AddBookmarkFolderDialog', () => {

  beforeEach(async () => {
    setActivePinia(createPinia())
  })

  it('should be mounted with parentFolderId', async () => {
    await IndexedDbPersistenceService.init("db")
    const wrapper = mount(AddBookmarkFolderDialog, {
      props: {
        parentFolderId: '17'
      },
    });
    /*expect(wrapper.vm.clickCount).toBe(0);
    wrapper.find('.q-item').trigger('click');
    expect(wrapper.vm.clickCount).toBe(1);*/
  });


});
