<template>

  <InfoMessageWidget
    :probability="1"
    ident="tabsexporter_info"
    hint="Choose the layout you prefer and copy and paste all the urls of this tabset"/>

  <q-toolbar>
    <q-btn flat label="Export"/>
    <q-space/>

    <q-tabs v-model="tab" shrink stretch>
      <q-tab name="simple" label="Simple"/>
      <q-tab name="list" label="As List"/>
      <q-tab name="pretty" label="Pretty"/>
    </q-tabs>
  </q-toolbar>

  <q-tab-panels
    v-model="tab"
    transition-prev="jump-up"
    transition-next="jump-up">
    <q-tab-panel name="simple">
      <div class="row" v-for="(t,index) in props.tabs">
        {{ t.url }}
      </div>
    </q-tab-panel>

    <q-tab-panel name="list">
      <ul>
        <li v-for="(t,index) in props.tabs">
          {{ t.url }}
        </li>
      </ul>
    </q-tab-panel>

    <q-tab-panel name="pretty">
      <ul>
        <li class="row" v-for="(t,index) in props.tabs">
          {{ t.note}}<br>
          {{ t.url }}
        </li>
      </ul>
    </q-tab-panel>
  </q-tab-panels>


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
import TabListElementWidget from "src/components/widgets/TabListElementWidget.vue";
import {useUtils} from "src/services/Utils"
import InfoMessageWidget from "components/widgets/InfoMessageWidget.vue";

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

const tab = ref('simple')

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

const openOrShowOpenTabs = () => {
}

const startDrag = (evt: any, tab: Tab) => {
  console.log("start drag", evt, tab)
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

</script>

<style lang="sass" scoped>
.my-card
  width: 100%
</style>
