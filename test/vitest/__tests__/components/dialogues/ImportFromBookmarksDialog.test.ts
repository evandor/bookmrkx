import {installQuasarPlugin} from '@quasar/quasar-app-extension-testing-unit-vitest';
import {DOMWrapper, mount, VueWrapper} from '@vue/test-utils';
import {beforeEach, describe, expect, it} from 'vitest';
import AddBookmarkFolderDialog from "components/dialogues/AddBookmarkFolderDialog.vue";
import {createPinia, setActivePinia} from "pinia";
import IndexedDbPersistenceService from "src/services/IndexedDbPersistenceService";
import NewTabsetDialog from "components/dialogues/NewTabsetDialog.vue";
import {Dialog} from "quasar";
import ImportFromBookmarksDialog from "components/dialogues/ImportFromBookmarksDialog.vue";

installQuasarPlugin({plugins: {Dialog}})

describe('ImportFromBookmarks', () => {


    beforeEach(async () => {
        setActivePinia(createPinia())
    })

    it('should be mounted', async () => {
        let wrapper: VueWrapper<InstanceType<typeof ImportFromBookmarksDialog>>;

        await IndexedDbPersistenceService.init("db")
        wrapper = mount(ImportFromBookmarksDialog, {
            props: {},
        });

        const bodyWrapper = new DOMWrapper(document.body);
        // @ts-ignore
        wrapper.vm.isDialogOpen = true;
        console.log("xxx", wrapper.html())
    });


});
