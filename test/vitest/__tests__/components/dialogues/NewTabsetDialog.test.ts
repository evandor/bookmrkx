import {installQuasarPlugin} from '@quasar/quasar-app-extension-testing-unit-vitest';
import {DOMWrapper, mount, VueWrapper} from '@vue/test-utils';
import {beforeEach, describe, expect, it} from 'vitest';
import AddBookmarkFolderDialog from "components/dialogues/AddBookmarkFolderDialog.vue";
import {createPinia, setActivePinia} from "pinia";
import IndexedDbPersistenceService from "src/services/IndexedDbPersistenceService";
import NewTabsetDialog from "components/dialogues/NewTabsetDialog.vue";
import {Dialog} from "quasar";

installQuasarPlugin({plugins: {Dialog}})

describe('NewTabsetDialog', () => {


    beforeEach(async () => {
        setActivePinia(createPinia())
    })

    it('should be mounted', async () => {
        let wrapper: VueWrapper<InstanceType<typeof NewTabsetDialog>>;

        await IndexedDbPersistenceService.init("db")
        wrapper = mount(NewTabsetDialog, {
            props: {},
        });

        const bodyWrapper = new DOMWrapper(document.body);
        wrapper.vm.isDialogOpen = true;
//wrapper.vm.$q.dialog.call()
        // `.find()` won't error out even if the element is not found
       // expect(bodyWrapper.find('.q-dialog').exists()).toBeTruthy();
        //wrapper.vm.$q.dialog.call()

        console.log("xxx", wrapper.html())
        /*expect(wrapper.vm.clickCount).toBe(0);
        wrapper.find('.q-item').trigger('click');
        expect(wrapper.vm.clickCount).toBe(1);*/
    });


});
