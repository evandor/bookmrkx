import {installQuasarPlugin} from '@quasar/quasar-app-extension-testing-unit-vitest';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {createPinia, setActivePinia} from "pinia";
import IndexedDbPersistenceService from "src/services/IndexedDbPersistenceService";
import {useDB} from "src/services/usePersistenceService";
import PersistenceService from "src/services/PersistenceService";
import {useTabsetService} from "src/services/TabsetService2";
import {DeleteChromeGroupCommand} from "src/domain/groups/DeleteChromeGroupCommand";
import {useGroupsStore} from "stores/groupsStore";
import ChromeApi from "src/services/ChromeApi";

installQuasarPlugin();

vi.mock('vue-router')

describe('DeleteChromeGroupCommand', () => {

    let db = null as unknown as PersistenceService

    beforeEach(async () => {
        setActivePinia(createPinia())
        await IndexedDbPersistenceService.init("db")
        db = useDB(undefined).db
        await useTabsetService().init(db)
    })

    afterEach(async() => {
        db.clear("tabsets")
        db.clear("groups")
    })

    it('command has proper toString representation', async () => {
        const cmd = await new DeleteChromeGroupCommand("groupName")
        expect(cmd.toString()).toBe("DeleteChromeGroupCommand: {groupTitle=groupName}")
    })

    it('removes group by title', async () => {
        await useGroupsStore().initialize(db)
        await useGroupsStore().persistGroup(ChromeApi.createChromeTabGroupObject(1, "groupName", 'grey' as chrome.tabGroups.ColorEnum))

        const groups = await  db.getGroups()
        expect(groups.length).toBe(1)

        await new DeleteChromeGroupCommand("groupName").execute()

        const groupsAfterDeletion = await  db.getGroups()
        expect(groupsAfterDeletion.length).toBe(0)
    })




});
