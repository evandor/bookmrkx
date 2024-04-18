<template>


  <q-toolbar >
    <div class="row fit">
      <q-toolbar-title>
        <div class="row justify-start items-baseline">
          <div class="col-10">Tabsets Extension Settings</div>
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
      <q-tab name="thirdparty" label="Third Party Services"/>
      <q-tab name="search" label="Search Engine" v-if="useSettingsStore().isEnabled('dev')"/>
      <q-tab name="internals" label="Internals" v-if="useSettingsStore().isEnabled('dev')"/>
      <q-tab name="featureToggles" label="Feature Toggles"/>
    </q-tabs>
  </div>

  <div v-if="tab === 'appearance'">

    <div class="q-pa-md q-gutter-sm">
      <q-banner rounded style="border:1px solid orange">On this settings page, you can adjust the general appearance of
        the tabsets extension.
      </q-banner>

      <div class="row items-baseline q-ma-md q-gutter-md">

        <InfoLine label="Title">
          <q-input type="text" color="primary" filled v-model="installationTitle" label="">
            <template v-slot:prepend>
              <q-icon name="o_edit_note"/>
            </template>
          </q-input>
        </InfoLine>

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

      <div class="row items-baseline q-ma-md q-gutter-md"
           v-if="usePermissionsStore().hasFeature(FeatureIdent.AUTO_TAB_SWITCHER)">
        <div class="col-3">
          Tab Switching Time in seconds
        </div>
        <div class="col-9">
          <q-select
            label="Tab Auto-Switcher Settings"
            filled
            v-model="autoSwitcherOption"
            :options="autoSwitcherOptions"
            map-options
            emit-value
            style="width: 250px"
          />
        </div>
      </div>

      <div class="row items-baseline q-ma-md q-gutter-md">
        <div class="col-3">
          Restore Info Messages
        </div>
        <div class="col-3">
          If you accidentally closed an info message box with a hint, you can restore them all by clicking here:
        </div>
        <div class="col-1"></div>
        <div class="col">
          <q-btn label="Restore Hints" @click.stop="restoreHints"/>
        </div>
      </div>

      <div class="row items-baseline q-ma-md q-gutter-md"
           v-if="usePermissionsStore().hasFeature(FeatureIdent.OPENTABS_THRESHOLD)">
        <div class="col-3">
          Warning Thresholds
        </div>
        <div class="col-3">
          warnings start when minimum open tabs count is reached<br>
          Reaching the maximum will turn the bar red.
        </div>
        <div class="col q-ma-xl">
          <q-range
            v-model="settingsStore.thresholds"
            :step=10
            marker-labels
            :min=0
            :max=100
          />
        </div>
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

  <div v-if="tab === 'account'">
    <AccountSettings/>
  </div>

  <div v-if="tab === 'subscription'">
    <SubscriptionBexSettings v-if="inBexMode()"/>
    <SubscriptionSettings v-else/>
  </div>

  <div v-if="tab === 'internals'">

    <div class="q-pa-md q-gutter-sm">

      <div class="text-h6">Permissions</div>

      <q-banner rounded>The active permissions for the Tabset Extension</q-banner>

      <div class="row items-baseline q-ma-md">
        <div class="col-3">
          Active Permissions
        </div>
        <div class="col-9">
          {{ permissionsList.join(", ") }}
        </div>
      </div>

      <div class="row items-baseline q-ma-md">
        <div class="col-3">
          Allowed Origins
        </div>
        <div class="col-9">
          {{ usePermissionsStore().permissions?.origins }}
        </div>
      </div>

      <div class="text-h6">Groups</div>

      <q-banner rounded>All Chrome Groups, active and non-active</q-banner>

      <div class="row items-baseline q-ma-md">
        <div class="col-3">
          All Groups
        </div>
        <div class="col-9">
          {{ useGroupsStore().tabGroups }}
        </div>
      </div>

      <q-banner rounded>All active Chrome Groups</q-banner>

      <div class="row items-baseline q-ma-md">
        <div class="col-3">
          Active Groups
        </div>
        <div class="col-9">
          {{ useGroupsStore().currentTabGroups }}
        </div>
      </div>


    </div>

  </div>

  <div v-if="tab === 'ignored'">

    <div class="q-pa-md q-gutter-sm">

      <q-banner rounded>Urls can be ignored so that the tabsets extension will not
        notifiy you about changes.
      </q-banner>

      <!--      <div class="row q-pa-md" v-for="tabset in ignoredUrls()">-->
      <!--        <div class="col-3"><b>{{ tabset.url }}</b></div>-->
      <!--        <div class="col-3"></div>-->
      <!--        <div class="col-1"></div>-->
      <!--        <div class="col-5">-->
      <!--          &lt;!&ndash;          <q-btn label="Un-Archive" @click="unarchive(tabset)"/>&ndash;&gt;-->
      <!--        </div>-->
      <!--      </div>-->
    </div>

  </div>

  <div v-if="tab === 'archived'">
    <div class="q-pa-md q-gutter-sm">

      <q-banner rounded style="border:1px solid orange">Tabsets can be archived to remove them from direct view. Here's
        the list of archived tabsets so that
        they can be restored if needed.
      </q-banner>

      <div class="row q-pa-md" v-for="tabset in archivedTabsets()">
        <div class="col-3"><b>{{ tabset.name }}</b></div>
        <div class="col-3"></div>
        <div class="col-1"></div>
        <div class="col-5">
          <q-btn label="Un-Archive" @click="unarchive(tabset as Tabset)"/>
        </div>
      </div>
    </div>
  </div>

  <div v-if="tab === 'search'">

    <div class="q-pa-md q-gutter-sm">

      <q-banner rounded style="border:1px solid orange">This Browser Extension tracks your tabsets and provides a
        search
        bar to search for keywords.
      </q-banner>

      <div class="row q-pa-md">
        <div class="col-3"><b>Search Index</b></div>
        <div class="col-3">Current Size: {{ indexSize }} Entries</div>
        <div class="col-1"></div>
        <div class="col-5">
          <span class="text-blue cursor-pointer" @click="downloadIndex">[Download]</span>&nbsp;
          <span class="text-blue cursor-pointer" @click="clearIndex">[clear Index]</span>&nbsp;
        </div>
      </div>
    </div>

  </div>

  <div v-if="tab === 'thirdparty'">

    <div class="q-pa-md q-gutter-sm">

      <q-banner rounded style="border:1px solid orange">
        TODO
      </q-banner>

      <div class="row q-pa-md">
        <div class="col-3"><b>DuckDuckGo FavIcon Service</b></div>
        <div class="col-5">Usually, the favicon (the little icon displayed next to a tab url) is provided by the page
          you are visiting.
          Sometimes, Tabsets does not have the information (yet) and might defer to a third party service, here
          duckduckgo. Switch this off
          if you do not want to use this service.
        </div>
        <div class="col-1"></div>
        <div class="col-3">
          <q-toggle v-model="ddgEnabled" @click="updateSettings('noDDG', ddgEnabled)"/>
        </div>
      </div>

    </div>

  </div>

  <div v-if="tab === 'importExport'">

    <div class="q-pa-md q-gutter-sm">

      <q-banner rounded style="border:1px solid orange">You can export your data in various formats and re-import them
        from json. Please
        note that it is not guaranteed that older exports can be imported with newer versions of the tabsets
        extension.
      </q-banner>

      <div class="row q-pa-md">
        <div class="col-3"><b>Export</b></div>
        <div class="col-3">json or as bookmarks</div>
        <div class="col-1"></div>
        <div class="col-5">
          <q-btn
            @click="showExportDialog"
            flat round dense icon="file_download" color="primary">
            <q-tooltip>Export your tabsets</q-tooltip>
          </q-btn>
        </div>
      </div>

      <div class="row q-pa-md">
        <div class="col-3"><b>Import</b></div>
        <div class="col-3">
          from json<br>
          You might need to restart tabsets.
        </div>
        <div class="col-1"></div>
        <div class="col-5">
          <q-btn
            @click="showImportDialog"
            flat round dense icon="file_upload" color="primary">
            <q-tooltip>Import your tabsets backup</q-tooltip>
          </q-btn>
        </div>
      </div>

    </div>

  </div>

  <div v-if="tab === 'featureToggles'">
    <FeatureToggleSettings/>
  </div>

</template>

<script setup lang="ts">
import {onMounted, ref, watch, watchEffect} from "vue";
import {LocalStorage, useQuasar} from "quasar";
import {useSearchStore} from "src/stores/searchStore";
import {useNotificationHandler} from "src/services/ErrorHandler";
import {useCommandExecutor} from "src/services/CommandExecutor";
import NavigationService from "src/services/NavigationService";
import {DrawerTabs, ListDetailLevel, useUiStore} from "src/stores/uiStore";
import {useBookmarksStore} from "src/bookmarks/stores/bookmarksStore";
import {usePermissionsStore} from "src/stores/permissionsStore";
import {GrantPermissionCommand} from "src/domain/commands/GrantPermissionCommand";
import {ExecutionResult} from "src/domain/ExecutionResult";
import {RevokePermissionCommand} from "src/domain/commands/RevokePermissionCommand";
import {FeatureIdent} from "src/models/AppFeature";
import {useSettingsStore} from "src/stores/settingsStore"
import OpenRightDrawerWidget from "components/widgets/OpenRightDrawerWidget.vue";
import {useUtils} from "src/services/Utils";
import Analytics from "src/utils/google-analytics";
import {useSuggestionsStore} from "stores/suggestionsStore";
import {StaticSuggestionIdent, Suggestion} from "src/models/Suggestion";
import {useRoute} from "vue-router";
import {
  STRIP_CHARS_IN_USER_INPUT,
  TITLE_IDENT
} from "boot/constants";
import {Account} from "src/models/Account";
import InfoLine from "pages/helper/InfoLine.vue";
import FeatureToggleSettings from "pages/helper/FeatureToggleSettings.vue";
import {useI18n} from "vue-i18n";
const { t } = useI18n()

const {sendMsg, inBexMode} = useUtils()

const searchStore = useSearchStore()
const settingsStore = useSettingsStore()

const localStorage = useQuasar().localStorage
const $q = useQuasar()
const route = useRoute()

useUiStore().rightDrawerSetActiveTab(DrawerTabs.FEATURES)

const view = ref('grid')
const indexSize = ref(0)

const { locale } = useI18n({locale: navigator.language, useScope: "global"})

const localeOptions = ref([
  {value: 'en', label: 'English'},
  {value: 'de', label: 'German'},
  {value: 'bg', label: 'Bulgarian'}
])

const ddgEnabled = ref<boolean>(!settingsStore.isEnabled('noDDG'))
const ignoreExtensionsEnabled = ref<boolean>(!settingsStore.isEnabled('extensionsAsTabs'))
const permissionsList = ref<string[]>([])

const darkMode = ref<string>(localStorage.getItem('darkMode') || "auto")
const detailLevel = ref<ListDetailLevel>(localStorage.getItem('ui.detailLevel') || ListDetailLevel.MAXIMAL)

//const installationId = ref<string>(localStorage.getItem(APP_INSTALLATION_ID) as string || '---')

const bookmarksPermissionGranted = ref<boolean | undefined>(usePermissionsStore().hasPermission('bookmarks'))
const pageCapturePermissionGranted = ref<boolean | undefined>(usePermissionsStore().hasPermission('history'))
const fullUrls = ref(localStorage.getItem('ui.fullUrls') || false)
const detailLevelPerTabset = ref(localStorage.getItem('ui.detailsPerTabset') || false)

const account = ref<Account | undefined>(undefined)

const installationTitle = ref<string>(localStorage.getItem(TITLE_IDENT) as string || 'My Tabsets')

const tab = ref<string>(route.query['tab'] ? route.query['tab'] as string : 'appearance')

const autoSwitcherOption = ref<number>(localStorage.getItem('ui.tabSwitcher') as number || 5000)

const autoSwitcherOptions = [
  {label: '1 sec.', value: 1000},
  {label: '2 sec.', value: 2000},
  {label: '3 sec.', value: 3000},
  {label: '5 sec.', value: 5000},
  {label: '10 sec.', value: 10000},
  {label: '30 sec.', value: 30000},
  {label: '1 min.', value: 60000},
  {label: '2 min.', value: 120000},
  {label: '5 min.', value: 300000}
]

const {handleError} = useNotificationHandler()

onMounted(() => {
  Analytics.firePageViewEvent('SettingsPage', document.location.href);
})

let suggestionsCounter = 0

watchEffect(() => {
  //console.log("watching settingsStore.activeToggles...", settingsStore.activeToggles)
  ddgEnabled.value = settingsStore.isEnabled('noDDG')
  ignoreExtensionsEnabled.value = settingsStore.isEnabled('extensionsAsTabs')
})

watchEffect(() => permissionsList.value = usePermissionsStore().permissions?.permissions || [])

watchEffect(() => bookmarksPermissionGranted.value = usePermissionsStore().hasPermission('bookmarks'))
watchEffect(() => pageCapturePermissionGranted.value = usePermissionsStore().hasPermission('pageCapture'))

watch(() => bookmarksPermissionGranted.value, (newValue, oldValue) => {
  if (newValue === oldValue) {
    return
  }
  if (bookmarksPermissionGranted.value && !usePermissionsStore().hasPermission('bookmarks')) {
    useCommandExecutor()
      .executeFromUi(new GrantPermissionCommand("bookmarks"))
      .then((res: ExecutionResult<boolean>) => bookmarksPermissionGranted.value = res.result)
  } else if (!bookmarksPermissionGranted.value) {
    useCommandExecutor()
      .executeFromUi(new RevokePermissionCommand("bookmarks"))
      .then(() => {
        useBookmarksStore().loadBookmarks()
      })
  }
})


watch(() => pageCapturePermissionGranted.value, (newValue, oldValue) => {
  if (newValue === oldValue) {
    return
  }
  if (pageCapturePermissionGranted.value && !usePermissionsStore().hasPermission('pageCapture')) {
    useCommandExecutor()
      .executeFromUi(new GrantPermissionCommand("pageCapture"))
      .then((res: ExecutionResult<boolean>) => pageCapturePermissionGranted.value = res.result)
  } else if (!pageCapturePermissionGranted.value) {
    useCommandExecutor()
      .executeFromUi(new RevokePermissionCommand("pageCapture"))
  }
})

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
  localStorage.set('ui.detailLevel', detailLevel.value)
  sendMsg('detail-level-changed', {level: detailLevel.value})
})

watchEffect(() => {
  localStorage.set('ui.fullUrls', fullUrls.value)
  sendMsg('fullUrls-changed', {value: fullUrls.value})
})

watchEffect(() => {
  localStorage.set('ui.detailsPerTabset', detailLevelPerTabset.value)
  sendMsg('detail-level-perTabset-changed', {level: detailLevelPerTabset.value})
})

watchEffect(() => {
  localStorage.set("layout", view.value)
})

watchEffect(() => {
  // @ts-ignore
  indexSize.value = searchStore?.getIndex()?.size()
})

watchEffect(() => {
  LocalStorage.set("ui.tabSwitcher", autoSwitcherOption.value)
})

const downloadIndex = () => {
  const data = JSON.stringify(searchStore?.getIndex())
}

const clearIndex = () => searchStore.init()

const archivedTabsets = () => {
}

const simulateNewVersion = (version: string) => NavigationService.updateAvailable({version: version})

const restoreHints = () => useUiStore().restoreHints()

const simulateStaticSuggestion = () => {
  const suggestions: [Suggestion] = [
    // @ts-ignore
    Suggestion.getStaticSuggestion(StaticSuggestionIdent.TRY_SPACES_FEATURE),
    Suggestion.getStaticSuggestion(StaticSuggestionIdent.TRY_BOOKMARKS_FEATURE)
  ]
  useSuggestionsStore().addSuggestion(suggestions[suggestionsCounter++ % 2])
}

const setTab = (a: any) => tab.value = a['tab' as keyof object]

</script>

