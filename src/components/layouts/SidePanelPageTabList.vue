<template>

  <q-list separator class="q-ma-none">

    <!-- supporting drag & drop when not on mobile -->
    <template v-if="!props.preventDragAndDrop"
              v-for="column in getColumns()"> <!-- there's only one (default) column now -->

      <vue-draggable-next
        class="q-ma-none"
        :list="tabsForColumn() as Array<IndexedTab>"
        :group="{ name: 'tabs', pull: 'clone' }"
        @change="(event:any) => handleDragAndDrop(event,  column)">

        <SidePanelTabListHelper v-for="tab in tabsForColumn() as Array<IndexedTab>"
                                :tab="tab.tab as Tab"
                                :indent="props.indent"
                                :index="tab.index"
                                :type="props.type"
                                :sorting="props.sorting"
                                :preventDragAndDrop="false"
                                :tabset="props.tabset"
                                :show-tabsets="props.showTabsets"
                                :hide-menu="props.hideMenu"/>
      </vue-draggable-next>
    </template>

    <!-- no drag & drop on mobile -->
    <template v-else>
      <SidePanelTabListHelper
        v-for="tab in tabs"
        :tab="tab as Tab"
        :type="props.type"
        :sorting="props.sorting"
        :preventDragAndDrop="true"
        :tabset="props.tabset"
        :show-tabsets="props.showTabsets"
        :hide-menu="props.hideMenu"/>
    </template>
  </q-list>

  <audio id="myAudio">
    <source src="mp3/click.mp3" type="audio/mp3">
  </audio>

</template>

<script setup lang="ts">
import {Tab, TabSorting} from "src/models/Tab";
import TabsetService from "src/services/TabsetService";
import {ref, onMounted, PropType, watchEffect} from "vue";
import {VueDraggableNext} from 'vue-draggable-next'
import {Tabset, TabsetStatus, TabsetType} from "src/models/Tabset";
import SidePanelTabListHelper from "components/layouts/sidepanel/SidePanelTabListHelper.vue";
import {useTabsetService} from "src/services/TabsetService2";
import {TabsetColumn} from "src/models/TabsetColumn";
import {SPECIAL_ID_FOR_NO_GROUP_ASSIGNED} from "boot/constants";
import _ from "lodash"
import {IndexedTab} from "src/models/IndexedTab";

const props = defineProps({
  hideMenu: {type: Boolean, default: false},
  sorting: {type: String as PropType<TabSorting>, default: TabSorting.CUSTOM},
  type: {type: String, default: 'sidepanel'},
  showTabsets: {type: Boolean, default: false},
  indent: {type: Boolean, default: false},
  preventDragAndDrop: {type: Boolean, default: false},
  tabset: {type: Object as PropType<Tabset>, required: false},
  tabsCount: {type: Number, default: -1}
})

const tabs = ref<Tab[]>([])

const handleDragAndDrop = (event: any, column: TabsetColumn) => {
  const {moved, added} = event
  console.log("event!", event)
  if (moved) {
    console.log(`moved event: '${moved.element.tab.id}' ${moved.oldIndex} -> ${moved.newIndex}`)
    const tabsInColumn = tabsForColumn()
    const movedElement: Tab = tabsInColumn[moved.oldIndex].tab
    const realNewIndex = tabsInColumn[moved.newIndex].index
    console.log(`             '${movedElement.id}' ${moved.oldIndex} -> ${realNewIndex}`)
    TabsetService.moveTo(movedElement.id, realNewIndex, column)
  }
  if (added) {
    console.log(`added event: '${added.element.tab.id}' ${added.oldIndex} -> ${added.newIndex}, ${column.title || column.id}`)
    const tabsInColumn = tabsForColumn()
    const movedElement: Tab = added.element.tab
    const realNewIndex = added.newIndex < tabsInColumn.length ?
      tabsInColumn[added.newIndex].index : 0
    console.log(`             '${added.element.tab.id}' ${added.oldIndex} -> ${realNewIndex}`)
    movedElement.columnId = column.id
    useTabsetService().saveCurrentTabset()
  }
}

watchEffect(() => {
  // TODO why was this done in the first place? Updates from where?
  //const tabset = useTabsStore().getTabset(props.tabset?.id || "")
  if (props.tabset) {
    tabs.value = useTabsetService().tabsToShow(props.tabset)
  } else {
    console.warn("could not determine tabset...")
    tabs.value = []
  }
})

/**
 * props.tabset.columns can be []
 */
const getColumns = () => {
  //if (!props.tabset || !props.tabset.columns || props.tabset.columns.length === 0) {
  return [new TabsetColumn(SPECIAL_ID_FOR_NO_GROUP_ASSIGNED, '')]
  //}
  // const columnsFromTabs = _.uniq(_.map(props.tabset.tabs, t => t.columnId ? t.columnId : "undefined"))
  // console.log("columnsFromTabs", columnsFromTabs)
  // if (columnsFromTabs.length === 1 && columnsFromTabs[0] === "undefined") {
  //   return [new TabsetColumn(SPECIAL_ID_FOR_NO_GROUP_ASSIGNED, props.tabset.columns[0].title ? props.tabset.columns[0].title : 'tabs w/o group')]
  // }
  // if (columnsFromTabs.length > props.tabset.columns.length) {
  //   return props.tabset.columns.concat([new TabsetColumn(SPECIAL_ID_FOR_NO_GROUP_ASSIGNED, 'tabs w/o group')])
  // }
  // return props.tabset.columns
}

const tabsForColumn = (): IndexedTab[] =>
    _.map(tabs.value as Tab[], (t: Tab, index: number) => new IndexedTab(index, t))


</script>

<style>

.q-expansion-item--popup > .q-expansion-item__container {
  border: 0px solid rgba(0, 0, 0, 0.12) !important;
}

.q-list--separator > .q-item-type + .q-item-type,
.q-list--separator > .q-virtual-scroll__content > .q-item-type + .q-item-type {
  border-top: 0px solid rgba(100, 0, 0, 0.12) !important;
}

</style>
