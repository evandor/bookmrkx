import {installQuasarPlugin} from '@quasar/quasar-app-extension-testing-unit-vitest';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {createPinia, setActivePinia} from "pinia";
import IndexedDbPersistenceService from "src/services/IndexedDbPersistenceService";
import {useDB} from "src/services/usePersistenceService";
import PersistenceService from "src/services/PersistenceService";
import {useTabsetService} from "src/services/TabsetService2";
import {useSuggestionsStore} from "stores/suggestionsStore";
import ChromeApi from "src/services/ChromeApi";
import {StaticSuggestionIdent, Suggestion, SuggestionState, SuggestionType} from "src/models/Suggestion";

installQuasarPlugin();

vi.mock('vue-router')

describe('SuggestionsStore', () => {

    let db = null as unknown as PersistenceService

    let onCreatedListener = null as unknown as ((window: chrome.windows.Window) => Promise<void>)
    let onRemovedListener = null as unknown as ((windowId: number) => Promise<void>)
    let onFocusChangedListener = null as unknown as ((windowId: number) => Promise<void>)

    beforeEach(async () => {
        setActivePinia(createPinia())
        await IndexedDbPersistenceService.init("db")
        db = useDB(undefined).db
        await useTabsetService().init(db)

        const window100 = ChromeApi.createChromeWindowObject(100, 17, 28)
        const currentWindows = [
            window100
        ]
        // https://groups.google.com/a/chromium.org/g/chromium-extensions/c/hssoAlvluW8
        const chromeMock = {
            windows: {
                getAll: vi.fn((callback) => {
                    console.log("mocking chrome.windows.getAll")
                    callback(currentWindows);
                }),
                getCurrent: vi.fn((options, callback) => {
                    console.log("mocking chrome.windows.getCurrent")
                    callback(window100)
                }),
                getLastFocused: vi.fn((options, callback) => {
                    console.log("mocking chrome.windows.getLastFocused")
                    callback(window100)
                }),
                get: vi.fn((windowId, queryOptions, callback) => {
                    console.log("mocking chrome.windows.get", windowId, queryOptions)
                    window100.left = 33
                    return window100
                }),
                onCreated: {
                    addListener: vi.fn((listener) => {
                        console.log("mocking chrome.windows.onCreated.addListener", listener)
                        onCreatedListener = listener
                    })
                },
                onRemoved: {
                    addListener: vi.fn((listener) => {
                        console.log("mocking chrome.windows.onRemoved.addListener", listener)
                        onRemovedListener = listener
                    })
                },
                onFocusChanged: {
                    addListener: vi.fn((listener) => {
                        console.log("mocking chrome.windows.onFocusChanged.addListener", listener)
                        onFocusChangedListener = listener
                    })
                },
                onBoundsChanged: {
                    addListener: vi.fn((listener) => {
                        console.log("mocking chrome.windows.onBoundsChanged.addListener", listener)
                        //callback(undefined)
                    })
                }
            },
            runtime: {
                sendMessage: vi.fn(() => {
                })
            }
        };

        vi.stubGlobal('chrome', chromeMock);

        await useSuggestionsStore().init(db)
        //useWindowsStore().initListeners()

    })

    afterEach(async () => {
        db.clear("suggestions")
    })

    it('initializes correctly', async () => {
        const newSuggestions = useSuggestionsStore().getSuggestions([SuggestionState.NEW])
        // useSu
        // const windows = await  db.getWindows()
        // expect(windows.length).toBe(1)
        // expect(windows[0].id).toBe(100)
        //
        // const window = await db.getWindow(100)
        // expect(window?.id).toBe(100)
        //
        expect(newSuggestions.length).toBe(0)
    })

    it('adds static suggestion', async () => {
        var staticSuggestion = Suggestion.getStaticSuggestion(StaticSuggestionIdent.TRY_SPACES_FEATURE);
        await useSuggestionsStore().addSuggestion(staticSuggestion)
        expect(useSuggestionsStore().getSuggestions([SuggestionState.NEW]).length).toBe(1)
    })

    it('adds suggestion for URL', async () => {
        var s = new Suggestion("","title", "msg", "https://www.skysail.io", SuggestionType.CONTENT_CHANGE)
        await useSuggestionsStore().addSuggestion(s)
        expect(useSuggestionsStore().getSuggestions([SuggestionState.NEW]).length).toBe(1)
    })

    //
    // it('onRemoved does not remove window with title', async () => {
    //     const window = await db.getWindow(100)
    //     if (window) {
    //         await useWindowsStore().upsertWindow(window.browserWindow, "theTitle")
    //         await onRemovedListener(100)
    //         const window100FromDb = await db.getWindow(100)
    //         expect(window100FromDb?.id).toBe(100)
    //     } else {
    //         expect(true).toBeFalsy()
    //     }
    // })
    //
    // it('onFocusChanged updates browserWindow', async () => {
    //     await onFocusChangedListener(100)
    //     const window100FromDb = await db.getWindow(100)
    //     // 33 is a 'magic number' assigned
    //     expect(window100FromDb?.browserWindow.left).toBe(33)
    // })
    //
    // it('onCreate', async () => {
    //
    //     const window: chrome.windows.Window = ChromeApi.createChromeWindowObject(1000, 0,0)
    //     //onCreatedListener(window)
    //     // await useWindowsStore().persistGroup(ChromeApi.createChromeTabGroupObject(1, "groupName", 'grey' as chrome.tabGroups.ColorEnum))
    //
    //     //const groups = await  db.getGroups()
    //     // expect(groups.length).toBe(1)
    // })

    // it('persists group with changing title', async () => {
    //     await useGroupsStore().initialize(db)
    //     await useGroupsStore().persistGroup(ChromeApi.createChromeTabGroupObject(1, "ab", 'grey' as chrome.tabGroups.ColorEnum))
    //     await useGroupsStore().persistGroup(ChromeApi.createChromeTabGroupObject(1, "abc", 'grey' as chrome.tabGroups.ColorEnum))
    //
    //     const groups = await  db.getGroups()
    //     expect(groups.length).toBe(1)
    //     expect(groups[0].title).toBe("abc")
    // })


});
