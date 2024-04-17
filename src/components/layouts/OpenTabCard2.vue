<template>

  <div class="row q-ma-none q-pa-none"
       @mouseenter="showIcons = true"
       @mouseleave="showIcons = false">

    <div class="col-2 q-mt-xs" style="text-align: center">
      <q-checkbox
        v-if="showSelectIcon(chromeTab)"
        v-model="chromeTab.selected"
        size="30px"
        checked-icon="task_alt"
        @update:model-value="val => selectionChanged(val)"
        unchecked-icon="check_box_outline_blank"
      />
      <TabFaviconWidget
        :preventDragAndDrop="true"
        :tab="toTab(chromeTab)" width="20px" height="20px"/>
    </div>

    <div class="col-8 q-mt-sm q-ml-xs text-body2 ellipsis cursor-pointer"
         :class="isCurrentTab(toTab(chromeTab)) ? 'text-bold' : ''"
         @click="NavigationService.openChromeTab(chromeTab)">
      {{ chromeTab?.title }}
      <q-tooltip class="tooltip" v-if="useSettingsStore().isEnabled('dev')">
        {{ chromeTab.id }} / {{ chromeTab.url }}
      </q-tooltip>
      <q-tooltip class="tooltip" v-else>
        {{ chromeTab.url }}
      </q-tooltip>
    </div>
    <div class="col q-mt-xs text-right">
      <template v-if="!props.useSelection && showIcons">
        <q-icon name="o_add_circle"
                :color="alreadyInCurrentTabset ? 'grey' : 'warning'"
                class="q-mr-sm"
                :class="alreadyInCurrentTabset ? '' : 'cursor-pointer'" size="xs"
                @click="addToCurrentTabset">
          <q-tooltip class="tooltip" v-if="alreadyInCurrentTabset">This tab has already been added to {{tabsStore.currentTabsetName}}</q-tooltip>
          <q-tooltip class="tooltip" v-else>Click here to add the tab to your current tabset {{tabsStore.currentTabsetName}}</q-tooltip>
        </q-icon>
        <q-icon name="close" class="cursor-pointer" @click="closeTab(chromeTab)" size="xs">
          <q-tooltip class="tooltip">Close this tab in the browser</q-tooltip>
        </q-icon>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">

import {Tab} from "src/models/Tab"
import NavigationService from "src/services/NavigationService"
import TabFaviconWidget from "src/components/widgets/TabFaviconWidget.vue"
import {useCommandExecutor} from "src/services/CommandExecutor";
import {useUtils} from "src/services/Utils"
import {useSettingsStore} from "src/stores/settingsStore"
import {PropType, ref, watch, watchEffect} from "vue";
import {uid} from "quasar";

const props = defineProps({
  chromeTab: {type: Object as PropType<chrome.tabs.Tab>, required: true},
  windowId: {type: Number, required: true},
  useSelection: {type: Boolean, default: false}
})

const emits = defineEmits(['selectionChanged', 'addedToTabset', 'hasSelectable'])

const {isCurrentTab} = useUtils()

const showIcons = ref(false)
const alreadyInCurrentTabset = ref(false)

const closeTab = (tab: chrome.tabs.Tab) => {
  NavigationService.closeChromeTab(tab)
}

const self = chrome.runtime?.getURL("")

const addToCurrentTabset = () => {
}

const selectionChanged = (val: any) => {
  emits('selectionChanged', {tabId: props.chromeTab.id, selected: val})
}

const showSelectIcon = true

const toTab = (chromeTab: chrome.tabs.Tab) => new Tab(uid(), chromeTab)

</script>

<style lang="sass" scoped>

.tabBorder
  border-radius: 5px 5px 0 0
  border: 1px solid $lightgrey
  border-bottom: 0

</style>
