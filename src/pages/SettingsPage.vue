<template>


  <q-toolbar>
    <div class="row fit">
      <q-toolbar-title>
        <div class="row justify-start items-baseline">
          <div class="col-10">Bookmrkx Extension Settings</div>
          <div class="col-2 text-right">
            <OpenRightDrawerWidget/>
          </div>
        </div>
      </q-toolbar-title>
    </div>
  </q-toolbar>

  <div class="justify-start items-start greyBorderTop">
    <q-tabs align="left"
            inline-label
            v-model="tab"
            no-caps>
      <q-tab name="appearance" label="Appearance"/>
<!--      <q-tab name="thirdparty" label="Third Party Services"/>-->
      <q-tab name="featureToggles" label="Feature Toggles"/>
    </q-tabs>
  </div>

  <div v-if="tab === 'appearance'">

    <div class="q-pa-md q-gutter-sm">
      <q-banner rounded style="border:1px solid orange">On this settings page, you can adjust the general appearance of
        the bookmrkx extension.
      </q-banner>

      <div class="row items-baseline q-ma-md q-gutter-md">

        <InfoLine label="Dark Mode (experimental)">
          <q-radio v-model="darkMode" val="auto" label="Auto"/>
          <q-radio v-model="darkMode" val="true" label="Enabled"/>
          <q-radio v-model="darkMode" val="false" label="Disabled"/>
          &nbsp;&nbsp;&nbsp;(changing this needs restart)
        </InfoLine>

        <div class="col-3">
          {{ t('language') }} ({{ t('experimental') }})
        </div>
        <div class="col-7">
          <q-select
              v-model="locale"
              :options="localeOptions"
              dense
              borderless
              emit-value
              map-options
              options-dense
              style="min-width: 150px"
          />
        </div>
        <div class="col"></div>

      </div>

      <div class="row items-baseline q-ma-md q-gutter-md" v-if="useSettingsStore().isEnabled('dev')">
        <div class="col-3">
          New Version Simulation
        </div>
        <div class="col-3">
          Simulate that there is a new version available
        </div>
        <div class="col q-ma-xl">
          <span class="text-blue cursor-pointer" @click="simulateNewVersion('0.2.12')">Simulate</span>
        </div>
      </div>

      <div class="row items-baseline q-ma-md q-gutter-md" v-if="useSettingsStore().isEnabled('dev')">
        <div class="col-3">
          New Suggestion Simulation
        </div>
        <div class="col-3">
          Simulate that there is a new suggestion to use a (new) feature (refresh sidebar for effects)
        </div>
        <div class="col q-ma-xl">
          <span class="text-blue cursor-pointer" @click="simulateStaticSuggestion()">Simulate</span>
        </div>
      </div>

    </div>

  </div>

  <div v-if="tab === 'thirdparty'">

    <div class="q-pa-md q-gutter-sm">

      <q-banner rounded style="border:1px solid orange">
        TODO
      </q-banner>

<!--      <div class="row q-pa-md">-->
<!--        <div class="col-3"><b>DuckDuckGo FavIcon Service</b></div>-->
<!--        <div class="col-5">Usually, the favicon (the little icon displayed next to an url) is provided by the page-->
<!--          you are visiting.-->
<!--          Bookmrkxs might defer to a third party service, here-->
<!--          duckduckgo . Switch this off-->
<!--          if you do not want to use this service.-->
<!--        </div>-->
<!--        <div class="col-1"></div>-->
<!--        <div class="col-3">-->
<!--          <q-toggle v-model="ddgEnabled" @click="updateSettings('noDDG', ddgEnabled)"/>-->
<!--        </div>-->
<!--      </div>-->

    </div>

  </div>

  <div v-if="tab === 'featureToggles'">
    <FeatureToggleSettings/>
  </div>

</template>

<script setup lang="ts">
import {onMounted, ref, watch, watchEffect} from "vue";
import {LocalStorage, useQuasar} from "quasar";
import NavigationService from "src/services/NavigationService";
import {DrawerTabs, ListDetailLevel, useUiStore} from "src/stores/uiStore";
import {usePermissionsStore} from "src/stores/permissionsStore";
import {useSettingsStore} from "src/stores/settingsStore"
import OpenRightDrawerWidget from "components/widgets/OpenRightDrawerWidget.vue";
import Analytics from "src/core/utils/google-analytics";
import {useRoute} from "vue-router";
import {
  STRIP_CHARS_IN_USER_INPUT,
  TITLE_IDENT
} from "boot/constants";
import InfoLine from "pages/helper/InfoLine.vue";
import FeatureToggleSettings from "pages/helper/FeatureToggleSettings.vue";
import {useI18n} from "vue-i18n";
import {StaticSuggestionIdent, Suggestion} from "src/suggestions/models/Suggestion";
import {useSuggestionsStore} from "src/suggestions/stores/suggestionsStore";

const {t} = useI18n()

const settingsStore = useSettingsStore()

const localStorage = useQuasar().localStorage
const $q = useQuasar()
const route = useRoute()

useUiStore().rightDrawerSetActiveTab(DrawerTabs.FEATURES)

const view = ref('grid')

const {locale} = useI18n({locale: navigator.language, useScope: "global"})

const localeOptions = ref([
  {value: 'en', label: 'English'},
  {value: 'de', label: 'German'},
  {value: 'bg', label: 'Bulgarian'}
])

// const ddgEnabled = ref<boolean>(!settingsStore.isEnabled('noDDG'))
const ignoreExtensionsEnabled = ref<boolean>(!settingsStore.isEnabled('extensionsAsTabs'))
const permissionsList = ref<string[]>([])

const darkMode = ref<string>(localStorage.getItem('darkMode') || "auto")

const installationTitle = ref<string>(localStorage.getItem(TITLE_IDENT) as string || 'My Tabsets')

const tab = ref<string>(route.query['tab'] ? route.query['tab'] as string : 'appearance')

const autoSwitcherOption = ref<number>(localStorage.getItem('ui.tabSwitcher') as number || 5000)


onMounted(() => {
  Analytics.firePageViewEvent('SettingsPage', document.location.href);
})

let suggestionsCounter = 0

watchEffect(() => permissionsList.value = usePermissionsStore().permissions?.permissions || [])


watchEffect(() => {
  //console.log("***setting dark mode to ", typeof darkMode.value, darkMode.value)
  switch (darkMode.value) {
    case "true":
      $q.dark.set(true)
      break
    case "false":
      $q.dark.set(false)
      break;
    default:
      $q.dark.set("auto")
  }
  // $q.dark.set(darkMode.value === "true" ? true : (darkMode.value === 'false' ? false : 'auto'))
  localStorage.set('darkMode', darkMode.value)
})

watchEffect(() => {
  (installationTitle.value && installationTitle.value.trim().length > 0) ?
      LocalStorage.set(TITLE_IDENT, installationTitle.value.replace(STRIP_CHARS_IN_USER_INPUT, '')) :
      LocalStorage.remove(TITLE_IDENT)
})

watchEffect(() => {
  localStorage.set("layout", view.value)
})

watchEffect(() => {
  LocalStorage.set("ui.tabSwitcher", autoSwitcherOption.value)
})

const simulateNewVersion = (version: string) => NavigationService.updateAvailable({version: version})

const simulateStaticSuggestion = () => {
  const suggestions: [Suggestion] = [
    // @ts-ignore
    Suggestion.getStaticSuggestion(StaticSuggestionIdent.TRY_SPACES_FEATURE),
    Suggestion.getStaticSuggestion(StaticSuggestionIdent.TRY_BOOKMARKS_FEATURE)
  ]
  useSuggestionsStore().addSuggestion(suggestions[suggestionsCounter++ % 2])
}

</script>

