<template>

  <vue-draggable-next
    :key="props.group"
    class="row items-start"
    :list="props.tabs"
    :group="{ name: 'tabs', pull: 'clone' }"
    @change="handleDragAndDrop">
    <div
      v-if="props.tabs.length > 0"
      class="col-xs-12 col-sm-4 col-md-3 col-lg-2 q-pa-xs"
      v-for="tab in props.tabs"
      @dragstart="startDrag($event, tab)"
      :key="props.group + '_' + tab.id">

      <TabCardWidget :key="props.group + '__' + tab.id"
                     :tab="tabAsTab(tab)"
                     :highlightUrl="highlightUrl"/>

    </div>

  </vue-draggable-next>

</template>

<script setup lang="ts">
import {Tab} from "src/models/Tab";
import TabsetService from "src/services/TabsetService";
import {PropType, ref} from "vue";
import {VueDraggableNext} from 'vue-draggable-next'
import TabCardWidget from "src/components/widgets/TabCardWidget.vue"
import {useQuasar} from "quasar";
import _ from "lodash"
import {useCommandExecutor} from "src/services/CommandExecutor";
import {useUiStore} from "stores/uiStore";

const tabsStore = useTabsStore()

const props = defineProps({
  tabs: {
    type: Array as PropType<Array<Tab>>,
    required: true
  },
  group: {
    type: String,
    required: true
  },
  highlightUrl: {
    type: String,
    required: false
  }
})

const tabAsTab = (tab: Tab): Tab => tab as unknown as Tab

function adjustIndex(element: any, tabs: Tab[]) {
  //console.log("filtered", tabs)
  if (element.newIndex === 0) { // first element
    //console.log(" 0 - searching for ", tabs[0].id)
    return _.findIndex(tabsStore.getCurrentTabs, t => t.id === tabs[0].id)
  } else {
    //console.log(" 1 - searching for ", tabs[element.newIndex - 1].id)
    return 1 + _.findIndex(tabsStore.getCurrentTabs, t => t.id === tabs[element.newIndex - 1].id)
  }
}

const handleDragAndDrop = (event: any) => {
  console.log("event", event)
  const {moved, added} = event
  if (moved) {
    console.log('d&d tabs moved', moved.element.id, moved.newIndex, props.group)
    let useIndex = moved.newIndex
    switch (props.group) {
      case 'otherTabs':
        // @ts-ignore
        const unpinnedNoGroup: Tab[] = _.filter(tabsStore.getCurrentTabs, (t: Tab) => !t.pinned && t.groupId === -1)
        if (unpinnedNoGroup.length > 0) {
          useIndex = adjustIndex(moved, unpinnedNoGroup);
        }
        break;
      case 'pinnedTabs':
        const filteredTabs: Tab[] = _.filter(tabsStore.getCurrentTabs, (t: Tab) => t.pinned)
        if (filteredTabs.length > 0) {
          useIndex = adjustIndex(moved, filteredTabs);
        }
        break
      default:
        if (props.group.startsWith('groupedTabs_')) {
          const groupId = props.group.split('_')[1]
          // @ts-ignore
          const filteredTabs: Tab[] = _.filter(tabsStore.getCurrentTabs, (t: Tab) => t.groupId === parseInt(groupId))
          if (filteredTabs.length > 0) {
            useIndex = adjustIndex(moved, filteredTabs);
          }
        }
        break
    }
    TabsetService.moveTo(moved.element.id, useIndex)
  }
  if (added) {
  }
}

const openOrShowOpenTabs = () => {
}

const startDrag = (evt: any, tab: Tab) => {
  console.log("start drag", evt, tab)
  if (evt.dataTransfer) {
    evt.dataTransfer.dropEffect = 'move'
    evt.dataTransfer.effectAllowed = 'move'
    evt.dataTransfer.setData('text/plain', tab.id)
    useUiStore().draggingTab(tab.id)
  }
  console.log("evt.dataTransfer.getData('text/plain')", evt.dataTransfer.getData('text/plain'))
}

</script>

<style lang="sass" scoped>
.my-card
  width: 100%
</style>
