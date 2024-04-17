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
            {{ title() }}
          </q-toolbar-title>
        </template>
        <!-- left drawer closed -->
        <template v-else>
          <q-icon
              class="q-ml-xs q-mr-none cursor-pointer"
              name="menu" size="18px" @click="toggleLeftDrawer">
            <q-tooltip class="tooltip">Toggle the tabset list view by clicking here</q-tooltip>
          </q-icon>
          <template v-if="usePermissionsStore().hasFeature(FeatureIdent.SPACES)">
            <SpacesSelectorWidget class="q-mx-md"/>
          </template>
        </template>

        <q-space/>

      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" side="left" behavior="desktop" bordered>
      <Navigation></Navigation>
    </q-drawer>

    <q-page-container>
      <router-view/>
    </q-page-container>

  </q-layout>

</template>

<script setup lang="ts">
import {ref, watchEffect} from 'vue';
import {useMeta, useQuasar} from "quasar";
import {useTabsStore} from "src/stores/tabsStore";
import {useRoute, useRouter} from "vue-router";
import {useNotificationsStore} from "src/stores/notificationsStore";
import Navigation from "src/components/Navigation.vue"
import NavigationService from "src/services/NavigationService"
import {useSearchStore} from "src/stores/searchStore";
import _ from "lodash";
import {useSpacesStore} from "src/stores/spacesStore"
import OpenTabsThresholdWidget from 'src/components/widgets/OpenTabsThresholdWidget.vue'
import SpacesSelectorWidget from 'src/components/widgets/SpacesSelectorWidget.vue'
import SearchWidget from 'src/components/widgets/SearchWidget.vue'
import {DrawerTabs, useUiStore} from "src/stores/uiStore";
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
import TabsetsSelectorWidget from "components/widgets/TabsetsSelectorWidget.vue";
import ToolbarButton from "components/widgets/ToolbarButton.vue";

const $q = useQuasar()
const router = useRouter()

const leftDrawerOpen = ref($q.screen.gt.md)
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

</script>
