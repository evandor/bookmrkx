import {defineStore} from 'pinia';
import {computed, ref, watch} from "vue";
import {useRoute, useRouter} from "vue-router";
import {Tab} from "src/models/Tab";
import _ from "lodash"
import {LocalStorage, useQuasar} from "quasar";
import {useUtils} from "src/services/Utils";
import {FeatureIdent} from "src/models/AppFeature";
import {usePermissionsStore} from "stores/permissionsStore";
import {Toast, ToastType} from "src/models/Toast";
import {
  SHARING_AUTHOR_IDENT,
  SHARING_AVATAR_IDENT,
} from "boot/constants";

export enum DrawerTabs {
  BOOKMARKS = "bookmarks",
  OPEN_TABS = "openTabs",
  UNASSIGNED_TABS = "unassignedTabs",
  GROUP_BY_HOST_TABS = "groupedByHostTabs",
  SAVED_TABS = "savedTabs",
  SAVED_TABS_AS_PDF = "savedTabsPdf",
  SAVED_TABS_AS_PNG = "savedTabsPng",
  RSS = "rss",
  SCHEDULED = "scheduled",
  HISTORY = "history",
  FEATURES = "features",
  TAB_DETAILS = "tabDetails",
  TABSET_DETAILS = "tabsetDetails",
  NEW_TAB_URLS = "newTabUrls",
  TAGS_VIEWER = "tagsViewer",
  TAG_VIEWER = "tagViewer",
  HELP = "help"
}

export enum UserLevel {
  UNKNOWN = "UNKNOWN",
  DEFAULT = "DEFAULT"
}

export class SidePanelView {

  static readonly MAIN = new SidePanelView('main', '/sidepanel');

  static readonly TABS_LIST = new SidePanelView('tabsList', '/sidepanel/tabslist',
    () => usePermissionsStore().hasFeature(FeatureIdent.OPEN_TABS));

  static readonly TAG = new SidePanelView('tag', '/sidepanel/tags');

  static readonly BY_DOMAIN_LIST = new SidePanelView('byDomainList', '/sidepanel/byDomainList',
    () => usePermissionsStore().hasFeature(FeatureIdent.GROUP_BY_DOMAIN));

  static readonly SHARED_TABSETS_LIST = new SidePanelView('sharedTsList', '/sidepanel/sharedTsList',
    () => usePermissionsStore().hasFeature(FeatureIdent.TABSETS_SHARING));

  static readonly RSS_LIST = new SidePanelView('rssList', '/sidepanel/rsslist',
    () => usePermissionsStore().hasFeature(FeatureIdent.RSS));

  static readonly NEWEST_TABS_LIST = new SidePanelView('newestList', '/sidepanel/newestList');

  static readonly TOP_10_TABS_LIST = new SidePanelView('top10List', '/sidepanel/top10List',
    () => usePermissionsStore().hasFeature(FeatureIdent.TOP10));

  static readonly BOOKMARKS = new SidePanelView('bookmarks', '/sidepanel/bookmarks',
    () => true) //&& useRoute()?.path !== "/sidepanel/welcome");

  static readonly PUBLIC_TABSETS = new SidePanelView('categorized_tabsets', '/sidepanel/byCategory',
    () => true);

  static readonly TAGS_VIEWER = new SidePanelView('categorized_tabsets', '/sidepanel/byCategory',
    () => usePermissionsStore().hasFeature(FeatureIdent.TAGS));

  static readonly MESSAGES = new SidePanelView('messages', '/sidepanel/messages')

  static readonly TABS_AS_TREE = new SidePanelView('tabsAsTree', '/sidepanel/tabsAsTree')

  static readonly ENTITY_MANAGER = new SidePanelView('entityManager', '/sidepanel/entities',
    () => usePermissionsStore().hasFeature(FeatureIdent.ENTITY_MANAGER))

  static readonly API_MANAGER = new SidePanelView('apiManager', '/sidepanel/apis',
    () => usePermissionsStore().hasFeature(FeatureIdent.API_MANAGER))


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
    public activeTab: DrawerTabs = DrawerTabs.OPEN_TABS) {
  }
}

export class SidePanel {

  relevantViews: SidePanelView[] = []

  constructor(
    public activeView: SidePanelView = SidePanelView.MAIN) {
   // this.relevantViews.push(SidePanelView.TOP_10_TABS_LIST)
    this.relevantViews.push(SidePanelView.TAG)
    this.relevantViews.push(SidePanelView.TABS_LIST)
   // this.relevantViews.push(SidePanelView.TAGS_LIST)
    this.relevantViews.push(SidePanelView.BOOKMARKS)
    //this.relevantViews.push(SidePanelView.BY_DOMAIN_LIST)
    //this.relevantViews.push(SidePanelView.NEWEST_TABS_LIST)
    this.relevantViews.push(SidePanelView.PUBLIC_TABSETS)
    this.relevantViews.push(SidePanelView.RSS_LIST)
    this.relevantViews.push(SidePanelView.TAGS_VIEWER)
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

  const selectedTab = ref<Tab | undefined>(undefined)
  const tabsFilter = ref<string | undefined>(undefined)
  const selectedTag = ref<string | undefined>(undefined)
  const tabsetsExpanded = ref<boolean>(false)
  const syncing = ref<boolean>(false)
  const appLoading = ref<string | undefined>(undefined)
  const bookmarksLoading = ref<boolean>(false)
  const progress = ref<object | undefined>(undefined)

  // online offline
  const networkOnline = ref(navigator.onLine)

  // RightDrawer
  let rightDrawer = ref<RightDrawer>(new RightDrawer())
  //let rightDrawerOpen = ref($q ? $q.screen.gt.md : true)
  let rightDrawerOpen = ref(false)
  let leftDrawerOpen = ref(true)

  // SidePanel
  let sidePanel = ref<SidePanel>(new SidePanel())
  const animateNewTabsetButton = ref(false)
  const animateSettingsButton = ref(false)
  const animateBookmarksButton = ref(false)

  const showLoginTable = ref(false)

  const highlightTerm = ref<string | undefined>(undefined)

  const newTabsetEmptyByDefault = ref<boolean>(LocalStorage.getItem('ui.newTabsetEmptyByDefault') as unknown as boolean || false)
  const tabBeingDragged = ref<string | undefined>(undefined)
  const dragEvent = ref<DragEvent | undefined>(undefined)
  const footerInfo = ref<string | undefined>(undefined)

  const contentCount = ref<number>(0)

  const listDetailLevel = ref<ListDetailLevel>(LocalStorage.getItem('ui.detailLevel') || ListDetailLevel.MAXIMAL)
  const showFullUrls = ref<boolean>(LocalStorage.getItem('ui.fullUrls') || false)
  const showDetailsPerTabset = ref<boolean>(LocalStorage.getItem('ui.detailsPerTabset') || false)

  // info Messages
  const hiddenMessages = ref<string[]>(LocalStorage.getItem('ui.hiddenInfoMessages') as unknown as string[] || [])
  const messageAlreadyShown = ref<string | undefined>(undefined)

  const toasts = ref<Toast[]>([])
  const toastTimeouts = ref<NodeJS.Timeout[]>([])

  // highlight url(s) feature
  const highlightUrls = ref<string[]>([])

  // new tab feature
  const newTabUrlList = ref<object[]>(LocalStorage.getItem('ui.newTabUrlList') as unknown as object[] || [])

  // listener currently triggered on '/' keypress for search keyboard shortcut
  const ignoreKeypress = ref(false)

  // entity management
  const entityType = ref<string | undefined>(undefined)
  const selectedTabsetId = ref<string | undefined>(undefined)

  // system management
  const dbReady = ref<boolean>(false)
  const dbSyncing = ref<boolean>(false)

  const showCurrentTabBox = ref<boolean>(true)

  const toolbarFilter = ref(false)
  const toolbarFilterTerm = ref('')
  const detailsPerTabset = ref(false)

  // tabset description
  const tabsetDescriptionPanelHights = ref<object>(LocalStorage.getItem('ui.descriptionPanelHeights') as unknown as object || {})

  const sharingAuthor = ref<string>(LocalStorage.getItem(SHARING_AUTHOR_IDENT) as unknown as string || '')
  const sharingAvatar = ref<string>(LocalStorage.getItem(SHARING_AVATAR_IDENT) as unknown as string || '')

  // info e.g. when stopping to sync
  const showSwitchedToLocalInfo = ref<boolean>(false)

  watch(rightDrawer.value, (val: Object) => {
    LocalStorage.set("ui.rightDrawer", val)
  }, {deep: true})

  watch(newTabsetEmptyByDefault,
    (val: Object) => {
      LocalStorage.set("ui.newTabsetEmptyByDefault", val)
    })

  watch(newTabUrlList,
    (val: object[]) => {
      console.log("newTabUrlList", val)
      LocalStorage.set("ui.newTabUrlList", val)
    })

  watch(newTabUrlList.value,
    (val: object[]) => {
      console.log("val", val)
      LocalStorage.set("ui.newTabUrlList", val)
    })

  watch(tabsetDescriptionPanelHights.value,
    (val: object) => {
      LocalStorage.set("ui.descriptionPanelHeights", val)
    })

  watch(sharingAuthor,
    (val: string | undefined) => {
      console.log("val", val)
      LocalStorage.set(SHARING_AUTHOR_IDENT, val)
    })

  watch(sharingAvatar,
    (val: string | undefined) => {
      console.log("val", val)
      LocalStorage.set(SHARING_AVATAR_IDENT, val)
    })

  const route = useRoute()
  watch(route, (to) => {
    // console.log("resetting", messageAlreadyShown.value)
    setAnotherMessageAlreadyShown(undefined)
  }, {flush: 'pre', immediate: true, deep: true})

  watch(
    hiddenMessages,
    (thresholdsVal: Object) => {
      LocalStorage.set("ui.hiddenInfoMessages", thresholdsVal)
    }, {deep: true}
  )

  function draggingTab(tabId: string, evt: DragEvent, doSendMessage = false) {
    tabBeingDragged.value = tabId
    dragEvent.value = evt
    if (doSendMessage) {
      sendMsg("tab-being-dragged", {
        tabId: tabId
      })
    }
  }

  function droppingTab() {
    console.log("dropping tab", tabBeingDragged.value)
    const tabBeingDropped = tabBeingDragged.value
    tabBeingDragged.value = undefined
    dragEvent.value = undefined
    return tabBeingDropped
  }

  function setSelectedTag(tag: string) {
    selectedTag.value = tag
  }

  function addToNewTabUrlList(l: object) {
    newTabUrlList.value.push(l)
  }

  function removeNewTabUrl(url: string) {
    newTabUrlList.value = _.filter(newTabUrlList.value, (e: any) => e.url !== url)
  }

  function setTabsetDescriptionHeight(tabsetId: string, height: number) {
    console.log("setting height", tabsetId, height)

    if (!tabsetDescriptionPanelHights.value[tabsetId as keyof object]) {
      // @ts-ignore
      tabsetDescriptionPanelHights.value[tabsetId as keyof object] = {}
    }
    // @ts-ignore
    tabsetDescriptionPanelHights.value[tabsetId as keyof object]['height'] = height
  }

  function getTabsetDescriptionHeight(tabsetId: string): number | undefined {
    // @ts-ignore
    return tabsetDescriptionPanelHights.value[tabsetId as keyof object] ?
      tabsetDescriptionPanelHights.value[tabsetId as keyof object]['height']
      : undefined
  }

  function setShowTabsetDescription(tabsetId: string, show: boolean): boolean {
    // @ts-ignore
    return tabsetDescriptionPanelHights.value[tabsetId as keyof object]['show'] = show
  }

  function showTabsetDescription(tabsetId: string): boolean {
    // @ts-ignore
    const res = tabsetDescriptionPanelHights.value[tabsetId as keyof object]['show'] as boolean | undefined
    //console.log("got res", res)
    if (res === undefined) {
      return true
    }
    return res
  }


  function hideInfoMessage(ident: string) {
    hiddenMessages.value.push(ident)
  }

  function restoreHints() {
    console.log("hiddenMessages.value", hiddenMessages.value)
    hiddenMessages.value = []
    setAnotherMessageAlreadyShown(undefined)
  }

  function setAnotherMessageAlreadyShown(msg: string | undefined) {
    //console.log("setting setAnotherMessageAlreadyShown", msg)
    messageAlreadyShown.value = msg
  }

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


  function setHighlightTerm(term: string | undefined) {
    highlightTerm.value = term
  }

  function setListDetailLevel(val: ListDetailLevel) {
    listDetailLevel.value = val
  }

  function setShowFullUrls(val: boolean) {
    showFullUrls.value = val
  }

  const listDetailLevelGreaterEqual = computed(() => {
    return (level: ListDetailLevel, tabsetDetail: ListDetailLevel | undefined) => {
      let useLevel = tabsetDetail ? tabsetDetail : listDetailLevel.value
      if (!useUiStore().showDetailsPerTabset) {
        useLevel = listDetailLevel.value
      }
      //console.log("useLevel", useLevel)
      switch (useLevel) {
        case ListDetailLevel.MAXIMAL:
          return true
        case ListDetailLevel.SOME:
          return level === ListDetailLevel.SOME || level === ListDetailLevel.MINIMAL
        case ListDetailLevel.MINIMAL:
          return level === ListDetailLevel.MINIMAL
      }
    }
  })

  const showMessage = computed(() => {
    return (ident: string, probability: number = 1, forceDisplay: boolean = false) => {
      //console.log("checking message", ident, probability, hiddenMessages.value)
      if (hiddenMessages.value.indexOf(ident) >= 0) {
        return false
      }
      if (forceDisplay) {
        return true
      }
      const couldBeShown = Math.random() < probability
      //console.log("could be shown", couldBeShown, messageAlreadyShown.value)
      if (couldBeShown && (messageAlreadyShown.value === undefined || messageAlreadyShown.value === ident)) {
        setAnotherMessageAlreadyShown(ident)
        return true
      } else if (messageAlreadyShown.value) {
        return false
      }
      return couldBeShown
    }
  })

  const sidePanelIsActive = computed(() => {
    return (view: SidePanelView) => sidePanel.value.activeView?.ident === view.ident
  })

  const getContentCount = computed((): number => contentCount.value)

  function setSelectedTab(tab: Tab) {
    console.log("setting selected tab", tab)
    selectedTab.value = tab
  }

  const getSelectedTab = computed(() => {
    return selectedTab.value
  })

  // highlight url(s) feature
  function clearHighlights() {
    highlightUrls.value = []
  }

  function addHighlight(url: string) {
    highlightUrls.value.push(url)
  }

  const getHighlightUrls = computed(() => highlightUrls.value)

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

  function toggleToolbarFilter() {
    toolbarFilter.value = !toolbarFilter.value
    if (!toolbarFilter.value) {
      toolbarFilterTerm.value = ''
    }
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
      return (16 - limit) + "px"
    }
    console.log("warning, using unknown ident", ident)
    return "19px"
  }

  function setProgress(v: number, label: string) {
    progress.value = {
      val: Math.max(0, Math.min(v, 1.0)),
      label
    }
  }

  function startButtonAnimation(name: string) {
    switch (name) {
      case 'newTabset':
        animateNewTabsetButton.value = true
        setTimeout(() => animateNewTabsetButton.value = false, 2000)
        break;
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
    draggingTab,
    droppingTab,
    newTabsetEmptyByDefault,
    hideInfoMessage,
    restoreHints,
    showMessage,
    footerInfo,
    getContentCount,
    setSelectedTab,
    getSelectedTab,
    newTabUrlList,
    addToNewTabUrlList,
    removeNewTabUrl,
    clearHighlights,
    addHighlight,
    getHighlightUrls,
    ignoreKeypressListener,
    setIgnoreKeypress,
    entityType,
    highlightTerm,
    setHighlightTerm,
    selectedTag,
    setSelectedTag,
    selectedTabsetId,
    tabsFilter,
    setListDetailLevel,
    setShowFullUrls,
    listDetailLevel,
    showFullUrls,
    listDetailLevelGreaterEqual,
    dbReady,
    dbSyncing,
    sidePanel,
    sidePanelSetActiveView,
    sidePanelIsActive,
    sidePanelActiveViewIs,
    toggleLeftDrawer,
    tabsetsExpanded,
    hideCurrentTabBox,
    showCurrentTabBox,
    toolbarFilter,
    toggleToolbarFilter,
    toolbarFilterTerm,
    toasts,
    createSuccessToast,
    createWarningToast,
    createErrorToast,
    delayedToastRemoval,
    callUndoActionFromCurrentToast,
    getButtonSize,
    showDetailsPerTabset,
    setTabsetDescriptionHeight,
    getTabsetDescriptionHeight,
    setShowTabsetDescription,
    showTabsetDescription,
    sharingAuthor,
    sharingAvatar,
    networkOnline,
    tabBeingDragged,
    appLoading,
    bookmarksLoading,
    progress,
    setProgress,
    animateNewTabsetButton,
    animateSettingsButton,
    animateBookmarksButton,
    startButtonAnimation,
    showLoginTable,
    showSwitchedToLocalInfo,
    syncing
  }
})
