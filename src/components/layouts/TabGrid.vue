<template>

  <vue-draggable-next
    class="dragArea list-group w-full container"
    tag="div"
    :list="props.tabs"
    :group="{ name: 'tabs', pull: 'clone' }"
    @change="handleDragAndDrop">

    <div
      clickable
      v-for="(tab,index) in props.tabs"
      class="item"
      :style="itemStyle(tab)"
      @click.stop="showDetails(tab)"
      @mouseover="showButtons(  tab.id,true)"
      @mouseleave="showButtons( tab.id, false)"
      @dragstart="startDrag($event, tab)"
      :key="props.group + '_' + tab.id">

      <TabGridWidget :key="props.group + '__' + tab.id" :tab="tabAsTab(tab)"/>

    </div>
  </vue-draggable-next>

</template>

<script setup lang="ts">
import {Tab} from "src/models/Tab";
import TabsetService from "src/services/TabsetService";
import {PropType, ref} from "vue";
import {VueDraggableNext} from 'vue-draggable-next'
import {useQuasar} from "quasar";
import _ from "lodash"
import {DrawerTabs, useUiStore} from "src/stores/uiStore";
import {useCommandExecutor} from "src/services/CommandExecutor";
import {useUtils} from "src/services/Utils"
import {usePermissionsStore} from "src/stores/permissionsStore";
import {FeatureIdent} from "src/models/AppFeature";
import TabGridWidget from "components/widgets/TabGridWidget.vue";

const {inBexMode} = useUtils()

const $q = useQuasar()
const tabsStore = useTabsStore()

const {saveCurrentTabset} = useTabsetService()

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

const thumbnails = ref<Map<string, string>>(new Map())
const tabAsTab = (tab: Tab): Tab => tab as unknown as Tab

const showButtonsProp = ref<Map<string, boolean>>(new Map())

const showButtons = (tabId: string, show: boolean) => showButtonsProp.value.set(tabId, show)

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

const startDrag = (evt: any, tab: Tab) => {
  console.debug("start drag", evt, tab)
  if (evt.dataTransfer) {
    evt.dataTransfer.dropEffect = 'all'
    evt.dataTransfer.effectAllowed = 'all'
    evt.dataTransfer.setData('text/plain', tab.id)
    useUiStore().draggingTab(tab.id, evt)
  }
  console.log("evt.dataTransfer.getData('text/plain')", evt.dataTransfer.getData('text/plain'))
}

const showDetails = (tab: Tab) => {
  useUiStore().setSelectedTab(tab)
  useUiStore().rightDrawerSetActiveTab(DrawerTabs.TAB_DETAILS)
}

const itemStyle = (tab: Tab) => {
  if (tab.url === props.highlightUrl) {
    return "border: 1px dotted orange; padding:15px; border-radius:5px"
  }
  return ""
}

</script>

<style scoped>
.container {
  -moz-column-count: 1;
  column-count: 1;
  -moz-column-gap: 20px;
  column-gap: 20px;
  -moz-column-fill: balance;
  column-fill: balance;
  margin: 20px auto 0;
  padding: 2rem;
}

.container .item {
  display: inline-block;
  margin: 0 0 20px;
  page-break-inside: avoid;
  -moz-column-break-inside: avoid;
  break-inside: avoid;
  width: 100%;
}

.container .item img {
  width: 100%;
  height: auto;
}

@media (min-width: 600px) {
  .container {
    -moz-column-count: 2;
    column-count: 2;
  }
}

@media (min-width: 900px) {
  .container {
    -moz-column-count: 3;
    column-count: 3;
  }
}

@media (min-width: 1200px) {
  .container {
    -moz-column-count: 4;
    column-count: 4;
  }
}
</style>
