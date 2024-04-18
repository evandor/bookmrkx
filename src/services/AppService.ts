import {usePermissionsStore} from "stores/permissionsStore";
import ChromeListeners from "src/services/ChromeListeners";
import ChromeBookmarkListeners from "src/services/ChromeBookmarkListeners";
import BookmarksService from "src/services/BookmarksService";
import IndexedDbPersistenceService from "src/services/IndexedDbPersistenceService";
import {useNotificationsStore} from "stores/notificationsStore";
import {useDB} from "src/services/usePersistenceService";
import {useSuggestionsStore} from "stores/suggestionsStore";
import ChromeApi from "src/services/ChromeApi";
import {useSettingsStore} from "stores/settingsStore";
import {useBookmarksStore} from "src/bookmarks/stores/bookmarksStore";
import {Router} from "vue-router";
import {useMessagesStore} from "src/stores/messagesStore";
import {useAppStore} from "stores/appStore";
import PersistenceService from "src/services/PersistenceService";
import {useUiStore} from "stores/uiStore";

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
    const messagesStore = useMessagesStore()
    const uiStore = useUiStore()
    this.router = router

    uiStore.appLoading = "loading bookmrkx..."

    appStore.init()

    // init of stores and some listeners
    await usePermissionsStore().initialize(useDB(quasar).localDb)
    await ChromeListeners.initListeners()

    ChromeBookmarkListeners.initListeners()
    await bookmarksStore.init()
    await BookmarksService.init()

    settingsStore.initialize(quasar.localStorage);

    // init db
    await IndexedDbPersistenceService.init("db")

    // init services

    await useNotificationsStore().initialize(useDB(undefined).db)
    useSuggestionsStore().init(useDB(undefined).db)
    await messagesStore.initialize(useDB(undefined).db)

    await this.initCoreSerivces(quasar, useDB(undefined).db, this.router)

    useNotificationsStore().bookmarksExpanded = quasar.localStorage.getItem("bookmarks.expanded") || []

  }


  restart(ar: string) {
    console.log("%crestarting tabsets", "font-weight:bold", window.location.href, ar)
    const baseLocation = window.location.href.split("?")[0]
    console.log("%cbaseLocation", "font-weight:bold", baseLocation)
    console.log("%cwindow.location.href", "font-weight:bold", window.location.href)
    if (window.location.href.indexOf("?") < 0) {
      const tsIframe = window.parent.frames[0]
      if (tsIframe) {
        console.debug("%cnew window.location.href", "font-weight:bold", baseLocation + "?" + ar)
        tsIframe.location.href = baseLocation + "?" + ar
        //tsIframe.location.href = "https://www.skysail.io"
        tsIframe.location.reload()
      }
    }
  }

  private async initCoreSerivces(quasar: any, store: PersistenceService, router: Router) {
    ChromeApi.init(router)
    useUiStore().appLoading = undefined
  }

}

export default new AppService();

