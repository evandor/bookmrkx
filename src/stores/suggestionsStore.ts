import {defineStore} from 'pinia';
import {computed, ref, unref} from "vue";
import {StaticSuggestionIdent, Suggestion, SuggestionState} from "src/models/Suggestion";
import _ from "lodash";
import PersistenceService from "src/services/PersistenceService";

let storage: PersistenceService = null as unknown as PersistenceService

export const useSuggestionsStore = defineStore('suggestions', () => {

    const suggestions = ref<Suggestion[]>([])

    function init(providedDb: PersistenceService) {
        console.debug(" ...initializing SuggestionsService")
        storage = providedDb
        loadSuggestionsFromDb()
    }

    function loadSuggestionsFromDb() {
        if (storage) {
            storage.getSuggestions()
                .then((res: Suggestion[]) => {
                    suggestions.value = res
                })
        }
    }

    async function addSuggestion(s: Suggestion | undefined) {
        console.debug("about to add suggestion", s)
        if (!s) {
            return Promise.reject("suggestion undefined")
        }
        try {
            await storage.addSuggestion(s)
            //console.log("%cpushing", "color:red", s)
            suggestions.value.push(s)
            return Promise.resolve(true)
        } catch (err) {
            console.log("rejected adding due to: ", err)
            return Promise.reject(err)
        }
    }

    function inactivateSuggestion(s: Suggestion | undefined) {
        if (s) {
            s.state = SuggestionState.INACTIVE
            console.log("about to inactivate suggestion", s)
            storage.addSuggestion(s)
                .then(() => suggestions.value.push(s))
                .catch((err) => {
                    console.log("rejected adding due to:", err)
                })
        }
    }

    function removeSuggestion(ident: string): Promise<any> {
        if (!storage) {
            return Promise.reject("could not remove suggestions as storage is not defined")
        }
        return storage.removeSuggestion(ident)
            .then(() => {
                suggestions.value = _.filter(suggestions.value, s => s.id !== ident)
                console.log("suggestions set to ", suggestions.value)
            })
    }

    function updateSuggestionState(id: string, state: SuggestionState) {
        return storage.setSuggestionState(id, state)
            .then((res: any) => loadSuggestionsFromDb())
    }

    function applySuggestion(id: string): Promise<Suggestion> {
        console.log("%capplied suggestion", "background-color:grey", id)
        return storage.setSuggestionState(id, SuggestionState.APPLIED)
            .then((res: any) => {
                loadSuggestionsFromDb();
                return res
            })

    }

    const getSuggestions = computed(() => {
        return (states: SuggestionState[]) => _.filter(suggestions.value,
            (s: Suggestion) => {
                for (const state of states) {
                    if (state === s.state) {
                        return true
                    }
                }
                return false
            })
    })

    const getSuggestion = computed(() => {
        return (suggestionId: string) => _.find(suggestions.value, s => s.id === suggestionId)
    })

    const getSuggestionForUrl = computed(() => {
        return (url: string) => _.find(suggestions.value, s => s.id === btoa(url))
    })


    return {
        init,
        loadSuggestionsFromDb,
        addSuggestion,
        getSuggestions,
        getSuggestion,
        updateSuggestionState,
        removeSuggestion,
        applySuggestion,
        inactivateSuggestion,
        getSuggestionForUrl
    }

})
