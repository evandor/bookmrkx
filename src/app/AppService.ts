import {usePermissionsStore} from "stores/permissionsStore";
import ChromeListeners from "src/services/ChromeListeners";
import ChromeBookmarkListeners from "src/services/ChromeBookmarkListeners";
import BookmarksService from "src/bookmarks/services/BookmarksService";
import IndexedDbPersistenceService from "src/services/IndexedDbPersistenceService";
import {useDB} from "src/services/usePersistenceService";
import ChromeApi from "src/services/ChromeApi";
import {useSettingsStore} from "stores/settingsStore";
import {useBookmarksStore} from "src/bookmarks/stores/bookmarksStore";
import {Router} from "vue-router";
import {useAppStore} from "stores/appStore";
import PersistenceService from "src/services/PersistenceService";
import {useUiStore} from "src/ui/stores/uiStore";
import {useWindowsStore} from "src/windows/stores/windowsStore";
import {FeatureIdent} from "src/app/models/FeatureIdent";
import {useSuggestionsStore} from "src/suggestions/stores/suggestionsStore";
import {Suggestion, SuggestionType} from "src/suggestions/models/Suggestion";
import WindowsListenerConfig from "src/windows/listeners/WindowsListenerConfig";
import {useTabsStore} from "src/bookmarks/stores/tabsStore";
import {useFeaturesStore} from "src/features/stores/featuresStore";

class AppService {

  router: Router = null as unknown as Router
  initialized = false

  async init(quasar: any, router: Router, forceRestart = false) {

    console.log(`%cinitializing AppService: first start=${!this.initialized}, forceRestart=${forceRestart}, quasar set=${quasar !== undefined}, router set=${router !== undefined}`, forceRestart ? "font-weight:bold" : "")

    if (this.initialized && !forceRestart) {
      console.debug("stopping AppService initialization; already initialized and not forcing restart")
      return Promise.resolve()
    }

    if (this.initialized) {
      await ChromeListeners.resetListeners()
    }

    this.initialized = true

    const appStore = useAppStore()
    const settingsStore = useSettingsStore()
    const bookmarksStore = useBookmarksStore()
    const uiStore = useUiStore()
    this.router = router

    uiStore.appLoading = "loading bookmrkx..."

    appStore.init()

    // init of stores and some listeners
    await usePermissionsStore().initialize(useDB(quasar).localDb)

    await useFeaturesStore().initialize(useDB(quasar).featuresLocalStorage)

    await ChromeListeners.initListeners()

    ChromeBookmarkListeners.initListeners()
    await bookmarksStore.init()
    await BookmarksService.init()

    //settingsStore.initialize(quasar.localStorage);

    // init db
    await IndexedDbPersistenceService.init("db")

    // init services
    await useSuggestionsStore().init()

    await this.initCoreSerivces(quasar, useDB(undefined).db, this.router)

  }

  private async initCoreSerivces(quasar: any, store: PersistenceService, router: Router) {
    ChromeApi.init(router)

    /**
     * features store: passing storage for better testing.
     * make sure features are not used before this line in code.
     */
    await useFeaturesStore().initialize(useDB(quasar).featuresLocalStorage)

    /**
     * windows store
     */
    // if (useFeaturesStore().hasFeature(FeatureIdent.WINDOWS_MANAGEMENT)) {
      await useWindowsStore().initialize()
      useWindowsStore().initListeners()
    // }

    // Setup Windows Module
    const newFeatureSuggestion = new Suggestion("TRY_WINDOWS_MANAGEMENT_FEATURE",
      "Want to try a new feature?",
      "You opened a new window, maybe you want to try the 'Windows Management Feature' of Bookmrkx?",
      "/features/windows_management",
      SuggestionType.FEATURE)
      .setImage('o_info')
    WindowsListenerConfig.addOnWindowsCreatedListener(async () => {
      await useSuggestionsStore().addSuggestion(newFeatureSuggestion)
    })

    await useTabsStore().initialize()

    useUiStore().appLoading = undefined
  }

}

export default new AppService();

