<template>

  <q-card class="tabBorder" flat :style="cardStyle(chromeTab)">

    <q-card-section class="q-pt-xs cursor-pointer q-ma-none"
                    :data-testid="useUtils().createDataTestIdentifier('openTabCard', props.chromeTab.url || '')"
                    style="width:100%;">

      <div class="row items-baseline fit" style="border:1px solid red">
        <div class="col-1 q-mr-md q-ml-none">
          <q-icon v-if="showAddToTabsetIcon(chromeTab)" color="primary"
                  name="o_arrow_left" @click="addToCurrentTabset" size="2em">
            <q-tooltip class="tooltip">
              Click here to add the tab to your current tabset {{ tabsStore.currentTabsetName }}
            </q-tooltip>
          </q-icon>
          <q-checkbox
              v-if="showSelectIcon(chromeTab)"
              v-model="chromeTab.selected"
              size="30px"
              checked-icon="task_alt"
              @update:model-value="val => selectionChanged(val)"
              unchecked-icon="check_box_outline_blank"
          />
        </div>

        <div class="col-2">
          <TabFaviconWidget :tab="toTab(chromeTab)" width="20px" height="20px"/>
        </div>

        <div class="col-7 text-body2 ellipsis cursor-pointer"
             :class="isCurrentTab(toTab(chromeTab)) ? 'text-bold' : ''"
             @mouseenter="emitInfo(chromeTab?.url)"
             @mouseout="emitInfo(undefined)"
             @click="NavigationService.openOrCreateTab([chromeTab?.url || ''])">
          {{ chromeTab?.title }}
          <q-tooltip class="tooltip" v-if="useSettingsStore().isEnabled('dev')">
            {{ chromeTab.id }} / {{ chromeTab.url }}
          </q-tooltip>
          <q-tooltip class="tooltip" v-else>
            {{ chromeTab.url }}
          </q-tooltip>
        </div>
        <div class="col-1" v-if="!props.useSelection">
          <q-icon name="close" @click="closeTab(chromeTab)" v-if="!isSelf(chromeTab.url || '')">
            <q-tooltip class="tooltip">Close this tab in the browser</q-tooltip>
          </q-icon>
        </div>
      </div>

    </q-card-section>


  </q-card>
</template>

<script setup lang="ts">

import {Tab} from "src/models/Tab"
import NavigationService from "src/services/NavigationService"
import TabFaviconWidget from "src/components/widgets/TabFaviconWidget.vue"
import {useUiStore} from "src/stores/uiStore";
import {useCommandExecutor} from "src/services/CommandExecutor";
import _ from "lodash"
import {useUtils} from "src/services/Utils"
import {useSettingsStore} from "src/stores/settingsStore"
import {PropType} from "vue";
import ChromeApi from "src/services/ChromeApi";
import {uid} from "quasar";

const props = defineProps({
  chromeTab: {type: Object as PropType<chrome.tabs.Tab>, required: true},
  windowId: {type: Number, required: true},
  useSelection: {type: Boolean, default: false}
})

const emits = defineEmits(['selectionChanged', 'addedToTabset', 'hasSelectable'])

const {isCurrentTab} = useUtils()

const tabsStore = useTabsStore()

const closeTab = (tab: chrome.tabs.Tab) => {
  NavigationService.closeChromeTab(tab)
  tabsStore.pendingTabset.tabs = _.filter(tabsStore.pendingTabset.tabs, t => t.url !== tab.url)
}

const cardStyle = (tab: chrome.tabs.Tab) => {
  const height = "28px";
  let background = ''
  // if (tab.isDuplicate) {
  //   background = "background: radial-gradient(circle, #FFFFFF 0%, #FFECB3 100%)"
  // }
  if (useTabsetService().urlExistsInCurrentTabset(tab.url || '')) {
    background = "background: #efefef"
  } else {
    emits('hasSelectable', true)
  }
  return `height: ${height};max-height:${height}; min-height: ${height};position:relative; top:5px;${background}`
}

const self = chrome.runtime?.getURL("")

const isSelf = (url: string) => url.startsWith(self)

const emitInfo = (msg: string | undefined) => useUiStore().footerInfo = msg

const addToCurrentTabset = () => {
}

const selectionChanged = (val: any) => {
  //console.log("emitting", val)
  emits('selectionChanged', {tabId: props.chromeTab.id, selected: val})
}

const showAddToTabsetIcon = (tab: chrome.tabs.Tab) => {
  return tabsStore.currentTabsetId && !props.useSelection && !useTabsetService().urlExistsInCurrentTabset(tab.url || '')
}

const showSelectIcon = (tab: chrome.tabs.Tab) => props.useSelection && !useTabsetService().urlExistsInCurrentTabset(tab.url || '')

const toTab = (chromeTab: chrome.tabs.Tab) => new Tab(uid(), chromeTab)

</script>

<style lang="sass" scoped>

.tabBorder
  border-radius: 5px 5px 0 0
  border: 1px solid $lightgrey
  border-bottom: 0

</style>
