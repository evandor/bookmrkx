<template>
  <q-layout view="hHh LpR lFr">
    <q-header elevated>
      <q-toolbar>

        <template v-if="leftDrawerOpen">
          <q-img
            class="q-ml-xs q-mr-none cursor-pointer" style="margin-top:-7px"
            @click="toggleLeftDrawer"
            src="favicon.ico" height="32px" width="32px">
            <q-tooltip class="tooltip">Toggle the tabset list view by clicking here</q-tooltip>
          </q-img>
          <q-toolbar-title v-if="!usePermissionsStore().hasFeature(FeatureIdent.SPACES)"
            @click.stop="goHome()" class="cursor-pointer"
            style="min-width:200px" shrink>
            {{ title() }}
            <q-tooltip class="tooltip">Reload Tabsets Extension</q-tooltip>
          </q-toolbar-title>
          <q-toolbar-title v-else>
            <SpacesSelectorWidget />
          </q-toolbar-title>
        </template>
        <template v-else>
          <q-icon
            class="q-ml-xs q-mr-none cursor-pointer"
            name="menu" size="18px" @click="toggleLeftDrawer">
            <q-tooltip class="tooltip">Toggle the tabset list view by clicking here</q-tooltip>
          </q-icon>
          <SpacesSelectorWidget class="q-mx-md"/>
        </template>


        <q-space/>

        <SearchWidget style="position: absolute; left:300px;top:5px;max-width:500px"
                      v-if="useSettingsStore().isEnabled('dev')"/>

        <Transition name="colorized-appear">
          <div v-if="permissionsStore.hasFeature(FeatureIdent.OPENTABS_THRESHOLD) && tabsStore.tabsets.size > 0">
            <OpenTabsThresholdWidget/>
          </div>
        </Transition>

        <q-btn v-if="settingsStore.isEnabled('stats')"
               class="q-mr-md" icon="o_query_stats" size="12px" style="min-width:24px" flat
               @click="router.push('/stats')">
          <q-tooltip>Check out stats (experimental)</q-tooltip>
        </q-btn>

        <div v-if="unreadNotifications().length > 0">
          <q-btn flat icon="o_notifications" class="q-mr-md cursor-pointer">
            <q-badge floating color="red" rounded/>
          </q-btn>
          <q-menu :offset="[0, 7]">
            <q-list style="min-width: 200px">
              <q-item>New Notifications:</q-item>
              <q-item v-for="n in unreadNotifications()"
                      clickable v-close-popup @click="showNotificationDialog(n.id)">
                <q-item-section>{{ n.title }}</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </div>

        <!--        <q-tab v-if="rssTabsCount > 0"-->
        <!--               name="rss" icon="o_rss_feed" @click="tabsClicked(DrawerTabs.RSS)">-->
        <!--          <q-tooltip class="tooltip" anchor="center right" self="center left" :delay="200">RSS Feeds</q-tooltip>-->
        <!--        </q-tab>-->

        <span v-if="useSuggestionsStore().getSuggestions([SuggestionState.NEW, SuggestionState.DECISION_DELAYED]).length > 0">
          <q-btn
            flat
            :color="dependingOnStates()"
            name="rss" icon="o_assistant">
            <q-tooltip class="tooltip" anchor="center right" self="center left" :delay="200">You have suggestions
            </q-tooltip>
            <q-badge :label="useSuggestionsStore().getSuggestions([SuggestionState.NEW, SuggestionState.DECISION_DELAYED]).length"/>
          </q-btn>
          <q-menu :offset="[0, 7]">
            <q-list style="min-width: 200px">
              <q-item clickable v-close-popup v-ripple @click="suggestionDialog(s)"
                      v-for="s in useSuggestionsStore().getSuggestions([SuggestionState.NEW, SuggestionState.DECISION_DELAYED])">
                <q-item-section avatar>
                  <q-icon color="primary" :name="s.img ? s.img : 'rss_feed'"/>
                </q-item-section>
                <q-item-section>
                  <div>{{ s.title }}</div>
                  <div class="text-caption">{{ s.msg }}</div>
                </q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </span>


        <ToolbarButton
          :feature="FeatureIdent.GROUP_BY_DOMAIN"
          :drawer="DrawerTabs.GROUP_BY_HOST_TABS"
          icon="o_dns"
          tooltip="Your tabs grouped by domain"/>

        <ToolbarButton
          :feature=FeatureIdent.RSS
          :drawer="DrawerTabs.RSS"
          icon="o_rss_feed"
          tooltip="Access to your rss feed"/>

        <ToolbarButton
          :feature="FeatureIdent.BOOKMARKS"
          :drawer="DrawerTabs.BOOKMARKS"
          icon="o_bookmark"
          tooltip="Access to your bookmarks"/>

        <ToolbarButton
          :drawer="DrawerTabs.UNASSIGNED_TABS"
          icon="o_playlist_add"
          tooltip="Show add tabs view"
          :restricted="false"/>

        <div>
          <q-btn
            @click="toggleSettings"
            flat
            size="12px"
            class="q-mr-md" icon="o_settings" >
          </q-btn>
          <q-menu :offset="[0, 7]">
            <q-list style="min-width: 200px">
              <q-item clickable @click="router.push('/login')">Login</q-item>

              <q-item clickable @click="router.push('/settings')">Settings</q-item>
              <q-item clickable @click="tabsClicked(DrawerTabs.FEATURES)" v-close-popup>
                Activate more Features
              </q-item>
              <q-item clickable @click="showImportDialog" v-close-popup>
                Import Tabsets
              </q-item>
              <q-item clickable @click="showExportDialog" v-close-popup>
                Export Tabsets
              </q-item>
            </q-list>
          </q-menu>
        </div>

        <div class="cursor-pointer" @click="router.push('/')" v-if="notificationsStore.updateToVersion !== ''">
          <q-btn
            class="text-primary bg-warning"
            @click="installNewVersion(notificationsStore.updateToVersion)"
            :label="'New Version ' + notificationsStore.updateToVersion + ' available. Click here to update'"/>
        </div>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" side="left" bordered >
      <Navigation></Navigation>
    </q-drawer>

    <q-drawer show-if-above
              v-model="useUiStore().rightDrawerOpen" side="right" bordered
              content-class="column justify-between no-wrap bg-grey-1">
      <DrawerRight/>


    </q-drawer>

    <q-page-container>
      <router-view/>
      <div id="fixed-footer" class="q-pl-md q-pa-xs">{{ useUiStore().footerInfo }}</div>
    </q-page-container>

  </q-layout>

</template>

<script setup lang="ts">
import {ref, watchEffect} from 'vue';
import {useMeta, useQuasar} from "quasar";
import {useRouter} from "vue-router";
import {useNotificationsStore} from "src/stores/notificationsStore";
import Navigation from "src/components/Navigation.vue"
import _ from "lodash";
import SearchWidget from 'src/components/widgets/SearchWidget.vue'
import {DrawerTabs, useUiStore} from "src/stores/uiStore";
import NotificationDialog from "components/dialogues/NotificationDialog.vue"
import {usePermissionsStore} from "src/stores/permissionsStore";
import {Notification, NotificationStatus} from "src/models/Notification";
import {useUtils} from "src/services/Utils";
import DrawerRight from "components/DrawerRight.vue";
import {Suggestion, SuggestionState} from "src/models/Suggestion";
import SuggestionDialog from "components/dialogues/SuggestionDialog.vue";
import {useSuggestionsStore} from "src/stores/suggestionsStore";
import {FeatureIdent} from "src/models/AppFeature";
import {useSettingsStore} from "src/stores/settingsStore"
import ToolbarButton from "components/widgets/ToolbarButton.vue";

const $q = useQuasar()
const router = useRouter()

const leftDrawerOpen = ref($q.screen.gt.md)

const notificationsStore = useNotificationsStore()
const permissionsStore = usePermissionsStore()
const settingsStore = useSettingsStore()

const spacesOptions = ref<object[]>([])
const suggestions = ref<Suggestion[]>(useSuggestionsStore().getSuggestions([SuggestionState.NEW, SuggestionState.DECISION_DELAYED]))

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

useMeta(() => {
  return {
    // @ts-ignore
    title: 'Tabsets Extension' //+ appVersion
  }
})

const title = () => {
  return inBexMode() ? 'Tabsets' : process.env.MODE === 'spa' ? 'Tabsets Web' : 'Tabsets (' + process.env.MODE + ')'
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

const tabsClicked = (tab: DrawerTabs, data: object = {}) => useUiStore().rightDrawerSetActiveTab(tab)

const suggestionDialog = (s: Suggestion) => $q.dialog({
  component: SuggestionDialog, componentProps: {
    suggestion: s
  }
})

const dependingOnStates = () =>
  _.find(useSuggestionsStore().getSuggestions([SuggestionState.NEW, SuggestionState.DECISION_DELAYED]), s => s.state === SuggestionState.NEW) ? 'warning' : 'white'

const toggleSettings = () => settingsClicked.value = !settingsClicked.value



</script>
