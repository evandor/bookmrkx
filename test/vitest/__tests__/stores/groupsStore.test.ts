import {installQuasarPlugin} from '@quasar/quasar-app-extension-testing-unit-vitest';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {createPinia, setActivePinia} from "pinia";
import IndexedDbPersistenceService from "src/services/IndexedDbPersistenceService";
import {useDB} from "src/services/usePersistenceService";
import PersistenceService from "src/services/PersistenceService";
import {useTabsetService} from "src/services/TabsetService2";
import {useGroupsStore} from "stores/groupsStore";
import ChromeApi from "src/services/ChromeApi";

installQuasarPlugin();

vi.mock('vue-router')

describe('GroupsStore', () => {

    let db = null as unknown as PersistenceService

    let onCreatedListener = null as unknown as ((group: chrome.tabGroups.TabGroup) => Promise<void>)
    let onRemovedListener = null as unknown as ((windowId: number) => Promise<void>)
    let onUpdatedListener = null as unknown as ((group: chrome.tabGroups.TabGroup) => Promise<void>)

    beforeEach(async () => {
        setActivePinia(createPinia())
        await IndexedDbPersistenceService.init("db")
        db = useDB(undefined).db
        await useTabsetService().init(db)

        const currentGroup =
            ChromeApi.createChromeTabGroupObject(1,"currentGroup1", 'grey' as chrome.tabGroups.ColorEnum)

        // https://groups.google.com/a/chromium.org/g/chromium-extensions/c/hssoAlvluW8
        const chromeMock = {
            tabGroups: {
                query: vi.fn((_queryInfo, callback) => {
                    console.log("mocking chrome.tabGroups.query", _queryInfo)
                    // callback([currentGroup]);
                    return [currentGroup]
                }),
                onCreated: {
                    addListener: vi.fn((listener) => {
                        console.log("mocking chrome.tabGroups.onCreated.addListener", listener)
                        onCreatedListener = listener
                    })
                },
                onMoved: {
                    addListener: vi.fn((listener) => {
                        console.log("mocking chrome.tabGroups.onMoved.addListener", listener)
                        //onCreatedListener = listener
                    })
                },
                onRemoved: {
                    addListener: vi.fn((listener) => {
                        console.log("mocking chrome.tabGroups.onRemoved.addListener", listener)
                        //onCreatedListener = listener
                    })
                },
                onUpdated: {
                    addListener: vi.fn((listener) => {
                        console.log("mocking chrome.tabGroups.onUpdated.addListener", listener)
                        onUpdatedListener = listener
                    })
                }
            },
            runtime: {
                sendMessage: vi.fn(() => {})
            }
        };

        vi.stubGlobal('chrome', chromeMock);

        await useGroupsStore().initialize(db)
        useGroupsStore().initListeners()

    })

    afterEach(async() => {
        db.clear("tabsets")
        db.clear("groups")
    })

    it('initializes', async () => {
        const groups = await  db.getGroups()
        expect(groups.length).toBe(1)
        expect(groups[0].title).toBe("currentGroup1")
        expect(useGroupsStore().tabGroups.size).toBe(1)
        expect(useGroupsStore().tabGroups.size).toBe(1)
        expect(useGroupsStore().currentTabGroups.length).toBe(1)
        expect(useGroupsStore().currentTabGroups[0].title).toBe("currentGroup1")
    })

    it('listens to onCreated Event', async () => {
        const createdGroup =
            ChromeApi.createChromeTabGroupObject(2,"createdGroup", 'blue' as chrome.tabGroups.ColorEnum)

        await onCreatedListener(createdGroup)
        const groups = await  db.getGroups()
        expect(groups.length).toBe(1)
    })

    it('listens to onUpdated Event', async () => {
        const updatedGroup =
            ChromeApi.createChromeTabGroupObject(1,"currentGroup1Updated", 'blue' as chrome.tabGroups.ColorEnum)

        await onUpdatedListener(updatedGroup)

        const groups = await  db.getGroups()
        expect(groups.length).toBe(1)
        expect(groups[0].title).toBe("currentGroup1Updated")
        expect(useGroupsStore().tabGroups.size).toBe(1)
        // TODO tabGroups not changed?
        expect(useGroupsStore().tabGroups.get('currentGroup1')?.id).toBe(1)
    })

    it('listens to onUpdated Event', async () => {

    })

    it('currentGroupForId', async () => {
        const res = useGroupsStore().currentGroupForId(1)
        expect(res?.id).toBe(1)
        expect(res?.title).toBe("currentGroup1")
    })

    it('currentGroupForName', async () => {
        const res = useGroupsStore().currentGroupForName("currentGroup1")
        expect(res?.id).toBe(1)
        expect(res?.title).toBe("currentGroup1")
    })

    it('groupForName', async () => {
        const res = useGroupsStore().groupForName("currentGroup1")
        expect(res?.id).toBe(1)
        expect(res?.title).toBe("currentGroup1")
    })

    it('persists group with changing title', async () => {
        //await useGroupsStore().initialize(db)
        await useGroupsStore().persistGroup(ChromeApi.createChromeTabGroupObject(1, "ab", 'grey' as chrome.tabGroups.ColorEnum))
        await useGroupsStore().persistGroup(ChromeApi.createChromeTabGroupObject(1, "abc", 'grey' as chrome.tabGroups.ColorEnum))

        const groups = await  db.getGroups()
        expect(groups.length).toBe(1)
        expect(groups[0].title).toBe("abc")
    })






});
