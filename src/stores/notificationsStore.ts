import {defineStore} from "pinia";
import {Tab} from "src/models/Tab";
import {Notification} from "src/models/Notification"
import _ from "lodash"
import {ref} from "vue";
import PersistenceService from "src/services/PersistenceService";
import {useUtils} from "src/services/Utils";
import {useSuggestionsStore} from "stores/suggestionsStore";
import {StaticSuggestionIdent, Suggestion} from "src/models/Suggestion";


export const useNotificationsStore = defineStore('notifications', () => {

  const info = ref('')
  const selectedTab = ref(null as unknown as Tab)
  const bookmarksExpanded = ref([] as unknown as string[])
  const fabHasElementAnimation = ref(false)
  const updateToVersion = ref('')
  const notifications = ref([] as unknown as Notification[])

  const {inBexMode} = useUtils()


  /**
   * the (internal) storage for this store to use
   */
  let storage: PersistenceService = null as unknown as PersistenceService

  /**
   * initialize store with
   *
   * @param ps a notifications storage
   */
  async function initialize(ps: PersistenceService) {
    console.debug(" ...initializing notifications")
    storage = ps
    const newNotifications = await storage.getNotifications(true)
    notifications.value = newNotifications
  }

  function setInfo(msg: string) {
    info.value = msg
  }

  function setSelectedTab(tab: Tab) {
    selectedTab.value = tab
  }

  function unsetSelectedTab() {
    selectedTab.value = null as unknown as Tab
  }

  function animateFab() {
    fabHasElementAnimation.value = true;
    //setTimeout(() => this.fabHasElementAnimation = false, 1000);
  }

  function updateAvailable(available: boolean, version: string = '') {
    updateToVersion.value = available ? version : '';
    console.log("updateToVersion set to ", updateToVersion.value)
    if (available && inBexMode()) {
      //useSuggestionsStore().addSuggestion(Suggestion.getStaticSuggestion(StaticSuggestionIdent.RELEASE_NOTES_AVAILABLE))
    }
  }

  function getNotification(notificationId: string): Notification | undefined {
    const r: any[] = _.filter(notifications.value, (n: Notification) => n.id === notificationId)
    if (r && r.length > 0) {
      return r[0]
    }
    return undefined
  }

  return {
    initialize,
    info,
    notifications,
    getNotification,
    updateAvailable,
    bookmarksExpanded,
    updateToVersion
  }
})


