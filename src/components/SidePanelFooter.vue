<template>

  <q-footer
    class="q-pa-xs q-mt-sm darkInDarkMode brightInBrightMode" style="border-top: 1px solid lightgrey"
    :style="offsetBottom()">

    <div class="row fit q-mb-sm" v-if="showLogin">
    </div>

    <div class="row fit q-mb-sm" v-if="showWindowTable">
      <!-- https://michaelnthiessen.com/force-re-render -->
      <SidePanelWindowMarkupTable :key="randomKey"/>
    </div>

    <div class="row fit q-mb-sm" v-if="showStatsTable">
      <SidePanelStatsMarkupTable :key="randomKey"/>
    </div>

    <div class="row fit">
      <div class="col-6">

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
      <div class="col text-right" v-if="useUiStore().appLoading">
        &nbsp;
      </div>
      <div v-else class="col text-right">
        <q-btn icon="o_help" v-if="usePermissionsStore().hasFeature(FeatureIdent.HELP)"
               :class="rightButtonClass()"
               flat
               :size="getButtonSize()"
               @click="openHelpView()">
        </q-btn>

        <q-btn icon="o_settings" v-if="showSettingsButton()"
               class="q-my-xs q-px-xs q-mr-none"
               :class="{ shake: animateSettingsButton }"
               flat
               :size="getButtonSize()"
               @click="openOptionsPage()">
          <q-tooltip class="tooltip" anchor="top left" self="bottom left">{{ settingsTooltip() }}</q-tooltip>
        </q-btn>

        <q-btn
          icon="o_grid_view"
          data-testid="buttonManageWindows"
          :class="rightButtonClass()"
          flat
          :size="getButtonSize()"
          @click="toggleShowWindowTable()">
          <q-tooltip class="tooltip" anchor="top left" self="bottom left">Manage Windows</q-tooltip>
        </q-btn>

        <q-btn
          icon="show_chart"
          :class="rightButtonClass()"
          flat
          :size="getButtonSize()"
          @click="toggleShowStatsTable()">
          <q-tooltip class="tooltip" anchor="top left" self="bottom left">Show Stats</q-tooltip>
        </q-btn>

        <span v-if="usePermissionsStore().hasFeature(FeatureIdent.STANDALONE_APP)">
          <q-icon
            name="o_open_in_new"
            :class="rightButtonClass()"
            class="cursor-pointer"
            flat
            size="20px">
            <q-tooltip :delay="2000" anchor="center left" self="center right"
                       class="tooltip-small">Alternative Access</q-tooltip>
          </q-icon>
          <q-menu :offset="[0, 7]" fit>
            <q-list dense style="min-width: 200px;min-height:50px">
              <q-item clickable v-close-popup>
                <q-item-section @click="openExtensionTab()">Tabsets as full-page app</q-item-section>
              </q-item>
              <q-item clickable v-close-popup>
                <q-item-section @click="openPwaUrl()">Tabsets Online Access</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </span>
        <q-btn v-else-if="usePermissionsStore().hasFeature(FeatureIdent.STANDALONE_APP)"
          icon="o_open_in_new"
          :class="rightButtonClass()"
          flat
          :size="getButtonSize()"
          @click="openExtensionTab()">
          <q-tooltip class="tooltip" anchor="top left" self="bottom left">Tabsets as full-page app</q-tooltip>
        </q-btn>

      </div>
    </div>

  </q-footer>
</template>
<script setup lang="ts">
import {SidePanelView, useUiStore} from "src/stores/uiStore";
import {Tab} from "src/models/Tab";
import {ref, watchEffect} from "vue";
import {useRoute, useRouter} from "vue-router";
import {usePermissionsStore} from "src/stores/permissionsStore";
import {FeatureIdent} from "src/models/AppFeature";
import NavigationService from "src/services/NavigationService";
import {openURL, uid, useQuasar} from "quasar";
import {useUtils} from "src/services/Utils";
import {useWindowsStore} from "src/stores/windowsStore";
import {useSuggestionsStore} from "stores/suggestionsStore";
import _ from "lodash";
import {SuggestionState} from "src/models/Suggestion";
import SuggestionDialog from "components/dialogues/SuggestionDialog.vue";
import {TabsetStatus} from "src/models/Tabset";
import {ToastType} from "src/models/Toast";
import SidePanelFooterLeftButtons from "components/helper/SidePanelFooterLeftButtons.vue";
import {Account} from "src/models/Account";
import {useNotificationHandler} from "src/services/ErrorHandler";
import SidePanelWindowMarkupTable from "components/helper/SidePanelWindowMarkupTable.vue";
import SidePanelStatsMarkupTable from "components/helper/SidePanelStatsMarkupTable.vue"
import {Window} from "src/models/Window"

const {handleSuccess, handleError} = useNotificationHandler()

const {inBexMode} = useUtils()

const $q = useQuasar()
const route = useRoute()

const router = useRouter()

const currentChromeTabs = ref<chrome.tabs.Tab[]>([])
const currentTabs = ref<Tab[]>([])
const currentChromeTab = ref<chrome.tabs.Tab>(null as unknown as chrome.tabs.Tab)
const showSuggestionButton = ref(false)
const showSuggestionIcon = ref(false)
const doShowSuggestionButton = ref(false)
const transitionGraceTime = ref(false)
const showWindowTable = ref(false)
const showStatsTable = ref(false)
const showLogin = ref(false)
const account = ref<Account | undefined>(undefined)
const randomKey = ref<string>(uid())
const progressValue = ref<number>(0.0)
const progressLabel = ref<string>('')
const animateSettingsButton = ref<boolean>(false)

watchEffect(() => {
  const windowId = useWindowsStore().currentChromeWindow?.id || 0
  if (useWindowsStore().windowForId(windowId)?.open) {
    //console.log("setting showWindowTable to ", useWindowsStore().windowForId(windowId)?.open)
    showWindowTable.value = useWindowsStore().windowForId(windowId)?.open || false
  }
})

watchEffect(() => {
  showLogin.value = useUiStore().showLoginTable
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
          (s.state === SuggestionState.NOTIFICATION && !usePermissionsStore().hasFeature(FeatureIdent.NOTIFICATIONS))
      }) >= 0)

  showSuggestionIcon.value =
    !doShowSuggestionButton.value &&
    useUiStore().sidePanelActiveViewIs(SidePanelView.MAIN) &&
    _.findIndex(suggestions, s => {
      return s.state === SuggestionState.DECISION_DELAYED
    }) >= 0
})

watchEffect(() => {
  const uiProgrss = useUiStore().progress
  if (uiProgrss) {
    progressValue.value = uiProgrss['val' as keyof object] || 0.0
    progressLabel.value = uiProgrss['label' as keyof object] || 'no msg'
    //console.log("we are here", progressValue.value)
  }
})

const openOptionsPage = () => {
  ($q.platform.is.cordova || $q.platform.is.capacitor) ?
    //Browser.open({ url: 'http://capacitorjs.com/' }).catch((err) => console.log("error", err)) :
    router.push("/settings") :
    NavigationService.openOrCreateTab([chrome.runtime.getURL('www/index.html#/mainpanel/settings')], undefined, [], true, true)
}

const openExtensionTab = () =>
  //NavigationService.openOrCreateTab([chrome.runtime.getURL('www/index.html#/fullpage')])
  openURL(chrome.runtime.getURL('www/index.html#/fullpage'))

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

const openHelpView = () => {
    router.push("/sidepanel/tabsets/HELP")
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

const toggleShowLogin = () => showLogin.value = !showLogin.value

const toggleShowWindowTable = () => {
  showWindowTable.value = !showWindowTable.value
  if (showWindowTable.value) {
    randomKey.value = uid()
    showStatsTable.value = false
  }
  const windowId = useWindowsStore().currentChromeWindow?.id || 0
  const currentWindow: Window | undefined = useWindowsStore().windowForId(windowId)
  if (currentWindow) {
    currentWindow.open = showWindowTable.value
    useWindowsStore().upsertTabsetWindow(currentWindow)
  }
}

const toggleShowStatsTable = () => {
  showStatsTable.value = !showStatsTable.value
  if (showWindowTable.value) {
    showWindowTable.value = false
  }
}

const offsetBottom = () => ($q.platform.is.capacitor || $q.platform.is.cordova) ? 'margin-bottom:20px;' : ''
const gotoStripe = () => openURL("https://billing.stripe.com/p/login/test_5kA9EHf2Da596HuaEE")
const openPwaUrl = () => NavigationService.openOrCreateTab([process.env.TABSETS_PWA_URL || 'https://www.skysail.io'])
const showLoginBtn = () => process.env.USE_FIREBASE == "true"
const showSettingsButton = () => true
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
