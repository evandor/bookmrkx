<template>

  <span class="cursor-pointer text-right" :style="props.showLabel ? 'min-width:160px' : 'max-width:30px'">
    <q-badge v-if="showThresholdBar() && props.showLabel"
             :multi-line="false"
             class="q-mr-sm"
             color="primary" text-color="white" :label="thresholdLabel()">
    </q-badge>

    <q-circular-progress
      v-if="showThresholdBar()"
      :show-value="props.showLabel"
      reverse
      :value="openTabsCountRatio2"
      :size="props.inSidePanel ? '16px':'20px'"
      :thickness="0.5"
      :style="thresholdStyle()"
      track-color="grey-3"
      class="q-ml-xs">
    </q-circular-progress>
    <q-tooltip class="tooltip">Open Tabs: {{useTabsStore().tabs.length}} - click to manage</q-tooltip>
  </span>
  <q-menu :offset="[0, 15]">
    <q-list style="min-width: 200px">
      <q-item v-if="!props.inSidePanel"
              clickable v-close-popup @click="showOpenTabs">
        <q-item-section>Show open tabs</q-item-section>
      </q-item>
      <q-separator/>
      <q-item disable>
        Close some tabs:
      </q-item>
      <q-item
        :disable="tabsStore.tabsets?.size === 0 || trackedTabsCount === 0"
        clickable v-close-popup @click="TabsetService.closeTrackedTabs()">
        <q-item-section>&bull; Close all tracked tabs ({{ trackedTabsCount }})</q-item-section>
      </q-item>
      <!--      <q-item clickable v-close-popup @click="TabsetService.closeDuplictedOpenTabs()">-->
      <!--        <q-item-section>&bull; Close duplicated open tabs</q-item-section>-->
      <!--      </q-item>-->
      <q-item v-if="usePermissionsStore().hasFeature(FeatureIdent.BACKUP)"
              clickable v-close-popup
              >
        <q-item-section>&bull; Backup and close current tabs...</q-item-section>
      </q-item>
      <q-item
        :disable="tabsStore.tabs.length <= 1"
        clickable v-close-popup @click="TabsetService.closeAllTabs()">
        <q-item-section>&bull; Close all other tabs ({{tabsStore.tabs.length - 1}})</q-item-section>
      </q-item>
      <q-separator/>
      <q-item disable v-if="showSpecialTabsets()">
        Use special tabsets:
      </q-item>
      <q-item v-if="usePermissionsStore().hasFeature(FeatureIdent.SESSIONS) && existingSession"
              clickable v-close-popup
              >
        <q-item-section>&bull; Replace existing Session...</q-item-section>
      </q-item>
      <q-item v-else-if="usePermissionsStore().hasFeature(FeatureIdent.SESSIONS) && !existingSession"
              clickable v-close-popup
              >
        <q-item-section>&bull; Start a new Session...</q-item-section>
      </q-item>
      <q-separator v-if="usePermissionsStore().hasFeature(FeatureIdent.SESSIONS) && !props.inSidePanel"/>
      <q-item v-if="usePermissionsStore().hasFeature(FeatureIdent.SESSIONS) && !props.inSidePanel"
              clickable v-close-popup @click="router.push('/settings')">
        <q-item-section>Change Settings</q-item-section>
      </q-item>
    </q-list>
  </q-menu>

</template>

<script lang="ts" setup>

import {useSettingsStore} from "src/stores/settingsStore";
import {ref, watch, watchEffect} from "vue";
import {useRouter} from "vue-router";
import {DrawerTabs, useUiStore} from "src/stores/uiStore";
import {useQuasar} from "quasar";
import _ from "lodash"
import {Tabset, TabsetType} from "src/models/Tabset";
import {usePermissionsStore} from "src/stores/permissionsStore";
import {FeatureIdent} from "src/models/AppFeature";
import {useUtils} from "src/services/Utils";

const settingsStore = useSettingsStore()
const router = useRouter()
const $q = useQuasar()

const openTabsCountRatio = ref(0)
const openTabsCountRatio2 = ref(0)
const trackedTabsCount = ref(0)
const existingSession = ref(false)

const {inBexMode} = useUtils()

const props = defineProps({
  showLabel: {type: Boolean, default: true},
  inSidePanel: {type: Boolean, default: false}
})

const thresholdStyle = () =>
  "color: hsl(" + (120 - Math.round(120 * openTabsCountRatio.value)) + " 80% 50%)"

const showOpenTabs = () =>
  useUiStore().rightDrawerSetActiveTab(DrawerTabs.UNASSIGNED_TABS)


const showSpecialTabsets = () => usePermissionsStore().hasFeature(FeatureIdent.SESSIONS)
</script>
