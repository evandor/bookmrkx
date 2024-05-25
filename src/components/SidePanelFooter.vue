<template>

  <q-footer
    class="q-pa-xs q-mt-sm darkInDarkMode brightInBrightMode" style="border-top: 1px solid lightgrey"
    :style="offsetBottom()">

    <div class="row fit q-mb-sm">
      {{ useTabsStore().currentChromeTab }}
    </div>

    <div class="row fit q-mb-sm" v-if="showWindowTable">
      <!-- https://michaelnthiessen.com/force-re-render -->
      <WindowsMarkupTable :rows="useWindowsStore().getWindowsForMarkupTable()" :key="randomKey"/>
    </div>

    <div class="row fit">
      <div class="col-8">

        <Transition name="fade" appear>
          <q-banner
            v-if="checkToasts()"
            inline-actions dense rounded
            style="font-size: smaller;text-align: center"
            :class="toastBannerClass()">
            {{ useUiStore().toasts[0]?.msg }}
            <template v-slot:action v-if="useUiStore().toasts[0]?.action">
              <q-btn flat label="Undo"
                     @click="useUiStore().callUndoActionFromCurrentToast()"/>
            </template>
          </q-banner>
        </Transition>

        <template v-if="!checkToasts() && useUiStore().progress">
          <q-linear-progress size="25px" :value="progressValue">
            <div class="absolute-full flex flex-center">
              <q-badge :label="progressLabel"/>
            </div>
          </q-linear-progress>
        </template>

        <q-btn v-if="!checkToasts() && !transitionGraceTime && showSuggestionButton"
               outline
               icon="o_lightbulb"
               :label="suggestionsLabel()"
               :color="dependingOnStates()"
               :size="getButtonSize()"
               @click="suggestionDialog()"
               class="q-ma-none q-pa-xs q-ml-sm q-mt-xs q-pr-md cursor-pointer">
        </q-btn>

        <template v-if="!checkToasts() && !transitionGraceTime && !showSuggestionButton">

          <SidePanelFooterLeftButtons
            @was-clicked="doShowSuggestionButton = true"
            :size="getButtonSize()"
            :show-suggestion-icon="showSuggestionIcon"/>

        </template>

      </div>
      <div class="col text-right">

        <q-btn v-if="(useFeaturesStore().hasFeature(FeatureIdent.WINDOWS_MANAGEMENT))"
               icon="o_grid_view"
               data-testid="buttonManageWindows"
               :class="rightButtonClass()"
               flat
               :size="getButtonSize()"
               @click="toggleShowWindowTable()">
          <q-tooltip class="tooltip" anchor="top left" self="bottom left">Manage Windows</q-tooltip>
        </q-btn>

        <q-btn icon="o_settings"
               class="q-my-xs q-px-xs q-mr-none"
               :class="{ shake: animateSettingsButton }"
               flat
               :size="getButtonSize()"
               @click="openOptionsPage()">
          <q-tooltip class="tooltip" anchor="top left" self="bottom left">{{ settingsTooltip() }}</q-tooltip>
        </q-btn>

        <!--        <q-btn-->
        <!--          icon="show_chart"-->
        <!--          :class="rightButtonClass()"-->
        <!--          flat-->
        <!--          :size="getButtonSize()"-->
        <!--          @click="toggleShowStatsTable()">-->
        <!--          <q-tooltip class="tooltip" anchor="top left" self="bottom left">Show Stats</q-tooltip>-->
        <!--        </q-btn>-->

      </div>
    </div>

  </q-footer>
</template>
<script setup lang="ts">
import {SidePanelView, useUiStore} from "src/stores/uiStore";
import {onMounted, ref, watch, watchEffect} from "vue";
import {useRoute, useRouter} from "vue-router";
import NavigationService from "src/services/NavigationService";
import {openURL, uid, useQuasar} from "quasar";
import _ from "lodash";
import {ToastType} from "src/models/Toast";
import {useNotificationHandler} from "src/core/services/ErrorHandler";
import WindowsMarkupTable from "src/windows/components/WindowsMarkupTable.vue";
import {WindowAction, WindowHolder} from "src/windows/models/WindowHolder"
import {Window} from "src/windows/models/Window"
import {useWindowsStore} from "src/windows/stores/windowsStore";
import {FeatureIdent} from "src/models/FeatureIdent";
import {usePermissionsStore} from "stores/permissionsStore";
import {useSuggestionsStore} from "src/suggestions/stores/suggestionsStore";
import {SuggestionState} from "src/suggestions/models/Suggestion";
import SuggestionDialog from "src/suggestions/dialogues/SuggestionDialog.vue";
import SidePanelFooterLeftButtons from "components/helper/SidePanelFooterLeftButtons.vue";
import {useTabsStore} from "../bookmarks/stores/tabsStore";
import {useFeaturesStore} from "src/features/stores/featuresStore";

const {handleSuccess, handleError} = useNotificationHandler()


const $q = useQuasar()

const router = useRouter()

const showSuggestionButton = ref(false)
const showSuggestionIcon = ref(false)
const doShowSuggestionButton = ref(false)
const transitionGraceTime = ref(false)
const showWindowTable = ref(false)
const showLogin = ref(false)
const randomKey = ref<string>(uid())
const progressValue = ref<number>(0.0)
const progressLabel = ref<string>('')
const animateSettingsButton = ref<boolean>(false)
const windowRows = ref<WindowHolder[]>([])
const tabsetsMangedWindows = ref<object[]>([])
const windowsToOpenOptions = ref<object[]>([])

onMounted(() => {
  if (useFeaturesStore().hasFeature(FeatureIdent.WINDOWS_MANAGEMENT)) {
    windowRows.value = calcWindowRows()
  }
})

watchEffect(() => {
  showLogin.value = false//useUiStore().showLoginTable
})

watchEffect(() => {
  animateSettingsButton.value = useUiStore().animateSettingsButton
})

watchEffect(() => {
  const suggestions = useSuggestionsStore().getSuggestions(
    [SuggestionState.NEW, SuggestionState.DECISION_DELAYED, SuggestionState.NOTIFICATION])
  //console.log("watcheffect for", suggestions)
  showSuggestionButton.value =
    doShowSuggestionButton.value ||
    (useUiStore().sidePanelActiveViewIs(SidePanelView.MAIN) &&
      _.findIndex(suggestions, s => {
        return s.state === SuggestionState.NEW ||
          (s.state === SuggestionState.NOTIFICATION && !useFeaturesStore().hasFeature(FeatureIdent.NOTIFICATIONS))
      }) >= 0)

  showSuggestionIcon.value =
    !doShowSuggestionButton.value &&
    useUiStore().sidePanelActiveViewIs(SidePanelView.MAIN) &&
    _.findIndex(suggestions, s => {
      return s.state === SuggestionState.DECISION_DELAYED
    }) >= 0
})

const updateWindows = () => {
  useWindowsStore().setup('got window-updated message', true)
    .then(() => windowRows.value = calcWindowRows())
}

watch(() => useWindowsStore().currentChromeWindows, (newWindows, oldWindows) => {
  //console.log("windows changed", newWindows, oldWindows)
  windowRows.value = calcWindowRows()
})

//console.log("====>: chrome.runtime.onMessage.hasListeners(windowsUpdatedListener)", chrome.runtime.onMessage.hasListener(windowsUpdatedListener))
//chrome.runtime.onMessage.addListener(windowsUpdatedListener)
chrome.windows.onCreated.addListener((w: chrome.windows.Window) => updateWindows())
chrome.windows.onRemoved.addListener((wId: number) => updateWindows())

chrome.tabs.onRemoved.addListener((tabId: number, removeInfo: chrome.tabs.TabRemoveInfo) => {
  //console.log("***here we are", tabId, removeInfo)
  useWindowsStore().setup('got window-updated message')
    .then(() => windowRows.value = calcWindowRows())
    .catch((err) => handleError(err))
})


// chrome.tabs.onUpdated.addListener((tabId: number, changeInfo: chrome.tabs.TabChangeInfo, tab: chrome.tabs.Tab) => {
//   //console.log("***here we are3", tab)
//   useWindowsStore().setup('got window-updated message')
//       .then(() => windowRows.value = calcWindowRows())
//       .catch((err) => handleError(err))
// })

const openOptionsPage = () => {
  ($q.platform.is.cordova || $q.platform.is.capacitor) ?
    //Browser.open({ url: 'http://capacitorjs.com/' }).catch((err) => console.log("error", err)) :
    router.push("/settings") :
    NavigationService.openOrCreateTab([chrome.runtime.getURL('www/index.html#/mainpanel/settings')], undefined, [], true, true)
}

const settingsTooltip = () => {
  return "Open Settings of Bookmrkx " + import.meta.env.PACKAGE_VERSION
}

const rightButtonClass = () => "q-my-xs q-px-xs q-mr-none"

const dependingOnStates = () =>
  _.find(useSuggestionsStore().getSuggestions([SuggestionState.NEW, SuggestionState.DECISION_DELAYED]), s => s.state === SuggestionState.NEW) ? 'warning' : 'primary'

const suggestionDialog = () => {
  doShowSuggestionButton.value = false
  $q.dialog({
    component: SuggestionDialog, componentProps: {
      suggestion: useSuggestionsStore()
        .getSuggestions([SuggestionState.NEW, SuggestionState.DECISION_DELAYED, SuggestionState.NOTIFICATION]).at(0),
      fromPanel: true
    }
  })
}
const suggestionsLabel = () => {
  const suggestions = useSuggestionsStore().getSuggestions(
    [SuggestionState.NEW, SuggestionState.DECISION_DELAYED, SuggestionState.NOTIFICATION])
  return suggestions.length === 1 ?
    suggestions.length + " New Suggestion" :
    suggestions.length + " New Suggestions"

}

const checkToasts = () => {
  if (useUiStore().toasts.length > 0) {
    const useDelay = 3000
    useUiStore().delayedToastRemoval(useDelay)
    const oldShowButton = showSuggestionButton.value
    const oldDoShowButton = doShowSuggestionButton.value
    transitionGraceTime.value = true
    showSuggestionButton.value = false
    doShowSuggestionButton.value = false
    setTimeout(() => {
      if (useUiStore().toasts.length === 0) { // only if all toasts are gone
        transitionGraceTime.value = false
        showSuggestionButton.value = oldShowButton
        doShowSuggestionButton.value = oldDoShowButton
      }
    }, useDelay + 1100) // must be higher than css value in fade-leave-active

    return true
  }
  return false
}

const getButtonSize = () => useUiStore().getButtonSize('sidePanelFooter')

const toastBannerClass = () => {
  const defaults = " text-white q-py-none"
  switch (useUiStore().toasts[0]?.type) {
    case ToastType.INFO:
      return "bg-positive" + defaults
    case ToastType.WARNING:
      return "bg-warning" + defaults
    case ToastType.ERROR:
      return "bg-negative" + defaults
    default:
      return "bg-negative" + defaults
  }
}

const toggleShowWindowTable = () => {
  showWindowTable.value = !showWindowTable.value
  if (showWindowTable.value) {
    randomKey.value = uid()
    //showStatsTable.value = false
  }
  const windowId = useWindowsStore().currentChromeWindow?.id || 0
  const currentWindow: Window | undefined = useWindowsStore().windowForId(windowId)
  if (currentWindow) {
    currentWindow.open = showWindowTable.value
    useWindowsStore().upsertTabsetWindow(currentWindow)
  }
}

const calcWindowRows = (): WindowHolder[] => {
  const result = _.map(useWindowsStore().currentChromeWindows as chrome.windows.Window[], (cw: chrome.windows.Window) => {
    const windowFromStore: Window | undefined = useWindowsStore().windowForId(cw.id || -2)
    const windowName = useWindowsStore().windowNameFor(cw.id || 0) || cw.id!.toString()
    const additionalActions: WindowAction[] = []

    return WindowHolder.of(
      cw,
      windowFromStore?.index || 0,
      windowName,
      windowFromStore?.hostList || [],
      additionalActions)
  })

  return _.sortBy(result, "index")
}

const offsetBottom = () => ($q.platform.is.capacitor || $q.platform.is.cordova) ? 'margin-bottom:20px;' : ''
</script>

<style>
.fade-enter-active {
  transition: opacity 0.5s ease;
}

.fade-leave-active {
  transition: opacity 1.0s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
