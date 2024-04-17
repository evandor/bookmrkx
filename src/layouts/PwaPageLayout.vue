<template>
  <q-layout view="hHh LpR lFr">
    <q-header elevated>
      <q-toolbar>

        <q-img
          class="q-ml-xs q-mr-none cursor-pointer" style="margin-top:-7px"
          src="favicon.ico" height="32px" width="32px"/>
        <q-toolbar-title>
          Tabsets
        </q-toolbar-title>


        <q-space/>


        <div>
          <q-icon v-if="!useUiStore().networkOnline || useUiStore().mqttOffline" name="cloud_off">
            <q-tooltip class="tooltip-small">{{useUiStore().sharingMqttUrl}}: {{ useUiStore().mqttOffline }}</q-tooltip>
          </q-icon>

        </div>

        <div class="cursor-pointer" @click="router.push('/')" v-if="notificationsStore.updateToVersion !== ''">
          <q-btn
            class="text-primary bg-warning"
            @click="installNewVersion(notificationsStore.updateToVersion)"
            :label="'New Version ' + notificationsStore.updateToVersion + ' available. Click here to update'"/>
        </div>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" side="left" behavior="desktop" bordered>
      <Navigation></Navigation>
    </q-drawer>

<!--    <q-drawer v-model="useUiStore().rightDrawerOpen" side="right" bordered-->
<!--              content-class="column justify-between no-wrap bg-grey-1">-->
<!--      <DrawerRight/>-->

<!--    </q-drawer>-->

    <q-page-container>
      <router-view/>
      <!--      <div id="fixed-footer" class="q-pl-md q-pa-xs">{{ useUiStore().footerInfo }}</div>-->
    </q-page-container>

  </q-layout>

</template>

<script setup lang="ts">
import {ref, watchEffect} from 'vue';
import {useMeta, useQuasar} from "quasar";
import {useTabsStore} from "src/stores/tabsStore";
import {useRouter} from "vue-router";
import {useNotificationsStore} from "src/stores/notificationsStore";
import Navigation from "src/components/Navigation.vue"
import {useSearchStore} from "src/stores/searchStore";
import _ from "lodash";
import {useSpacesStore} from "src/stores/spacesStore"
import OpenTabsThresholdWidget from 'src/components/widgets/OpenTabsThresholdWidget.vue'
import SpacesSelectorWidget from 'src/components/widgets/SpacesSelectorWidget.vue'
import SearchWidget from 'src/components/widgets/SearchWidget.vue'
import {DrawerTabs, UserLevel, useUiStore} from "src/stores/uiStore";
import NotificationDialog from "components/dialogues/NotificationDialog.vue"
import {usePermissionsStore} from "src/stores/permissionsStore";
import {Notification, NotificationStatus} from "src/models/Notification";
import {useUtils} from "src/services/Utils";
import DrawerRight from "components/DrawerRight.vue";
import ExportDialog from "components/dialogues/ExportDialog.vue";
import ImportDialog from "components/dialogues/ImportDialog.vue";
import {Suggestion, SuggestionState} from "src/models/Suggestion";
import SuggestionDialog from "components/dialogues/SuggestionDialog.vue";
import {useSuggestionsStore} from "src/stores/suggestionsStore";
import {FeatureIdent} from "src/models/AppFeature";
import {useSettingsStore} from "src/stores/settingsStore"
import ToolbarButton from "components/widgets/ToolbarButton.vue";

const $q = useQuasar()
const router = useRouter()
const tabsStore = useTabsStore()
const searchStore = useSearchStore()

const leftDrawerOpen = ref($q.screen.gt.lg)

const notificationsStore = useNotificationsStore()
const permissionsStore = usePermissionsStore()
const settingsStore = useSettingsStore()
const spacesStore = useSpacesStore()

const spacesOptions = ref<object[]>([])
const suggestions = ref<Suggestion[]>(useSuggestionsStore().getSuggestions([SuggestionState.NEW, SuggestionState.DECISION_DELAYED]))
const search = ref('')

const {inBexMode} = useUtils()

$q.loadingBar.setDefaults({
  color: 'positive',
  size: '10px',
  position: 'top'
})

const settingsClicked = ref(false)

watchEffect(() => {
  suggestions.value = useSuggestionsStore().getSuggestions([SuggestionState.NEW, SuggestionState.DECISION_DELAYED])
})

watchEffect(() => {
  spacesOptions.value = _.map([...spacesStore.spaces.keys()], key => {
    const label = spacesStore.spaces.get(key)?.label || 'undef'
    return {id: key, label: label}
  })
    .concat({id: '', label: '(unassigned)'})
    .concat({id: '', label: 'create new space'})
})

//@ts-ignore
const appVersion = import.meta.env.PACKAGE_VERSION

useMeta(() => {
  return {
    // @ts-ignore
    title: 'Tabsets Extension' //+ appVersion
  }
})


const title = () => {
  return inBexMode() ? 'Tabsets' : process.env.MODE === 'spa' ?
    'Tabsets Web' : 'Tabsets'
}

const goHome = () => router.push("/")

const toggleLeftDrawer = () => {
  leftDrawerOpen.value = !leftDrawerOpen.value
  useUiStore().toggleLeftDrawer()
}

const installNewVersion = (version: string) => {
  notificationsStore.updateAvailable(false)
  chrome.tabs.create({
    active: true,
    url: "https://tabsets.web.app/#/updatedTo/" + version
  })
  chrome.runtime.reload()
}

const unreadNotifications = () => _.filter(notificationsStore.notifications, (n: Notification) => n.status === NotificationStatus.UNREAD)

const showNotificationDialog = (nId: string) => $q.dialog({
  component: NotificationDialog, componentProps: {
    notificationId: nId
  }
})

const tabsClicked = (tab: DrawerTabs, data: object = {}) => useUiStore().rightDrawerSetActiveTab(tab, data)

const showExportDialog = () => $q.dialog({component: ExportDialog})
const showImportDialog = () => $q.dialog({component: ImportDialog})

const suggestionDialog = (s: Suggestion) => $q.dialog({
  component: SuggestionDialog, componentProps: {
    suggestion: s
  }
})

const dependingOnStates = () =>
  _.find(useSuggestionsStore().getSuggestions([SuggestionState.NEW, SuggestionState.DECISION_DELAYED]), s => s.state === SuggestionState.NEW) ? 'warning' : 'white'

const toggleSettings = () => settingsClicked.value = !settingsClicked.value


</script>
