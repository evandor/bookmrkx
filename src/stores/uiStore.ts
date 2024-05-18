import {defineStore} from 'pinia';
import {computed, ref, watch} from "vue";
import {useRouter} from "vue-router";
import _ from "lodash"
import {LocalStorage, useQuasar} from "quasar";
import {useUtils} from "src/services/Utils";
import {FeatureIdent} from "src/models/FeatureIdent";
import {usePermissionsStore} from "stores/permissionsStore";
import {Toast, ToastType} from "src/models/Toast";

export enum DrawerTabs {
  FEATURES = "features",
}

export enum UserLevel {
  UNKNOWN = "UNKNOWN",
  DEFAULT = "DEFAULT"
}

export class SidePanelView {

  static readonly MAIN = new SidePanelView('main', '/sidepanel/bookmarks');

  static readonly TAG = new SidePanelView('tag', '/sidepanel/tags');

  static readonly SHARED_TABSETS_LIST = new SidePanelView('sharedTsList', '/sidepanel/sharedTsList',
    () => usePermissionsStore().hasFeature(FeatureIdent.TABSETS_SHARING));

  static readonly NEWEST_TABS_LIST = new SidePanelView('newestList', '/sidepanel/newestList');

  static readonly BOOKMARKS = new SidePanelView('bookmarks', '/sidepanel/bookmarks',
    () => true) //&& useRoute()?.path !== "/sidepanel/welcome");

  static readonly PUBLIC_TABSETS = new SidePanelView('categorized_tabsets', '/sidepanel/byCategory',
    () => true);

  static readonly MESSAGES = new SidePanelView('messages', '/sidepanel/messages')

  static readonly TABS_AS_TREE = new SidePanelView('tabsAsTree', '/sidepanel/tabsAsTree')



  private constructor(
    public readonly ident: string,
    public readonly path: any,
    public readonly showButtonFunction: Function = () => true) {
  }

  toString() {
    return this.ident;
  }

  showButton() {
    return this.showButtonFunction()
  }

}

export enum ListDetailLevel {
  MINIMAL = "MINIMAL",
  SOME = "SOME",
  MAXIMAL = "MAXIMAL"
}

export class RightDrawer {
  constructor(
    public activeTab: DrawerTabs = DrawerTabs.FEATURES) {
  }
}

export class SidePanel {

  relevantViews: SidePanelView[] = []

  constructor(
    public activeView: SidePanelView = SidePanelView.MAIN) {
    this.relevantViews.push(SidePanelView.BOOKMARKS)
  }

  public enabledViewsCount() {
    let count = 0
    for (const v of this.relevantViews) {
      if (v.showButtonFunction.apply(this)) {
        count += 1
      }
    }
    return count
  }
}

export const useUiStore = defineStore('ui', () => {

  const router = useRouter()

  const {sendMsg} = useUtils()

  const appLoading = ref<string | undefined>(undefined)
  const bookmarksLoading = ref<boolean>(false)

  // online offline
  const networkOnline = ref(navigator.onLine)

  // RightDrawer
  let rightDrawer = ref<RightDrawer>(new RightDrawer())
  let rightDrawerOpen = ref(false)
  let leftDrawerOpen = ref(true)

  // SidePanel
  let sidePanel = ref<SidePanel>(new SidePanel())
  const animateSettingsButton = ref(false)
  const animateBookmarksButton = ref(false)

  const footerInfo = ref<string | undefined>(undefined)

  const toasts = ref<Toast[]>([])
  const toastTimeouts = ref<NodeJS.Timeout[]>([])

  // listener currently triggered on '/' keypress for search keyboard shortcut
  const ignoreKeypress = ref(false)

  // system management
  const dbReady = ref<boolean>(false)
  const dbSyncing = ref<boolean>(false)

  const showCurrentTabBox = ref<boolean>(true)

  // info e.g. when stopping to sync
  const showSwitchedToLocalInfo = ref<boolean>(false)

  watch(rightDrawer.value, (val: Object) => {
    LocalStorage.set("ui.rightDrawer", val)
  }, {deep: true})

  function rightDrawerSetActiveTab(tab: DrawerTabs) {
    rightDrawer.value.activeTab = tab
    rightDrawerOpen.value = true
  }

  function sidePanelSetActiveView(view: SidePanelView) {
    sidePanel.value.activeView = view
    router.push(view.path)
  }

  const sidePanelActiveViewIs = computed(() => {
    return (viewToCompare: SidePanelView) => {
      return sidePanel.value.activeView?.ident === viewToCompare.ident
    }
  })

  const sidePanelIsActive = computed(() => {
    return (view: SidePanelView) => sidePanel.value.activeView?.ident === view.ident
  })

  const showMessage = computed(() => {
    return (ident: string, probability: number = 1, forceDisplay: boolean = false) => {
      // //console.log("checking message", ident, probability, hiddenMessages.value)
      // if (hiddenMessages.value.indexOf(ident) >= 0) {
      //   return false
      // }
      // if (forceDisplay) {
      //   return true
      // }
      // const couldBeShown = Math.random() < probability
      // //console.log("could be shown", couldBeShown, messageAlreadyShown.value)
      // if (couldBeShown && (messageAlreadyShown.value === undefined || messageAlreadyShown.value === ident)) {
      //   setAnotherMessageAlreadyShown(ident)
      //   return true
      // } else if (messageAlreadyShown.value) {
      //   return false
      // }
      // return couldBeShown
      return false
    }
  })

  function ignoreKeypressListener() {
    return ignoreKeypress.value;
  }

  function setIgnoreKeypress(b: boolean) {
    ignoreKeypress.value = b
  }

  function toggleLeftDrawer() {
    leftDrawerOpen.value = !leftDrawerOpen.value
  }

  function hideCurrentTabBox(b: boolean) {
    showCurrentTabBox.value = !b
  }

  function createSuccessToast(msg: string, action: any = undefined) {
    toastTimeouts.value.forEach((timeout: NodeJS.Timeout) => clearTimeout(timeout))
    toasts.value.push(new Toast(msg, ToastType.INFO, action))
  }

  function createWarningToast(msg: string, action: any = undefined) {
    toastTimeouts.value.forEach((timeout: NodeJS.Timeout) => clearTimeout(timeout))
    toasts.value.push(new Toast(msg, ToastType.WARNING, action))
  }

  function createErrorToast(msg: string) {
    toastTimeouts.value.forEach((timeout: NodeJS.Timeout) => clearTimeout(timeout))
    toasts.value.push(new Toast(msg, ToastType.ERROR))
  }

  function removeToast(toast: Toast) {
    const index = _.findIndex(toasts.value, t => t.id === toast.id)
    if (index >= 0) {
      toasts.value.splice(index, 1)
    }
  }

  function delayedToastRemoval(delay: number = 3000) {
    if (toasts.value.length > 0) {
      const toast = toasts.value[0]
      let timeout = setTimeout(() => {
        removeToast(toast)
      }, delay)
      toastTimeouts.value.push(timeout)
    }
  }

  function callUndoActionFromCurrentToast() {
    if (toasts.value.length > 0) {
      const toast = toasts.value[0]
      console.log("applying undo method...")
      toast.action.handler.apply(null)
      removeToast(toast)
    }
  }

  function getButtonSize(ident: string) {
    if (ident === 'sidePanelFooter') {
      const viewsCount = sidePanel.value.enabledViewsCount()
      const limit = Math.min(viewsCount, 7)
      return (14 - limit) + "px"
    }
    console.log("warning, using unknown ident", ident)
    return "19px"
  }

  function startButtonAnimation(name: string) {
    switch (name) {
      case 'bookmarks':
        animateBookmarksButton.value = true
        setTimeout(() => animateBookmarksButton.value = false, 2000)
        break;
      case 'settings':
        animateSettingsButton.value = true
        setTimeout(() => animateSettingsButton.value = false, 2000)
        break;
      default:
        console.log("unrecognized element name", name)
    }
  }

  return {
    rightDrawer,
    rightDrawerOpen,
    leftDrawerOpen,
    rightDrawerSetActiveTab,
    ignoreKeypressListener,
    setIgnoreKeypress,
    dbReady,
    dbSyncing,
    sidePanel,
    sidePanelSetActiveView,
    sidePanelIsActive,
    sidePanelActiveViewIs,
    toggleLeftDrawer,
    hideCurrentTabBox,
    showCurrentTabBox,
    toasts,
    createSuccessToast,
    createWarningToast,
    createErrorToast,
    delayedToastRemoval,
    callUndoActionFromCurrentToast,
    getButtonSize,
    networkOnline,
    appLoading,
    bookmarksLoading,
    animateSettingsButton,
    animateBookmarksButton,
    startButtonAnimation,
    showSwitchedToLocalInfo,
    showMessage
  }
})
