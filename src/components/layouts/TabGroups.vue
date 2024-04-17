<template>

  <div class="q-ma-sm">

    <InfoMessageWidget
      :probability="1"
      css-class="q-pa-none q-gutter-sm q-mb-md"
      ident="tabgroups_info"
      hint="You can create and reorder groups which you can use to assign tabs to by dragging and dropping. Create
              a new group by clicking on the plus sign."/>

    <div class="row q-mb-lg q-mr-lg">
      <div class="col text-bold">&nbsp;</div>
      <div class="col-2 text-right text-primary cursor-pointer">
        <q-icon name="add" size="1.3em" color="primary" class="q-mr-sm"/>
        Add Group
        <q-popup-edit :model-value="newGroupName" v-slot="scope"
                      @update:model-value="val => setNewName(val)">
          <q-input v-model="scope.value" dense autofocus counter @keyup.enter="scope.set"/>
        </q-popup-edit>
      </div>
    </div>

    <div>
      <vue-draggable-next
        class="row q-gutter-md"
        :list="tabsetGroups">
        <div
          class="col text-bold bg-primary text-white upper-border q-pa-sm" style="cursor: move"
          v-for="element in tabsetGroups"
          :key="element.id">
          {{ element.title }}
          <q-popup-edit :model-value="element.title" v-slot="scope"
                        @update:model-value="val => rename(element.id, val)">
            <q-input
              v-model="scope.value" dense autofocus counter @keyup.enter="scope.set"
              :hint="element.id !== SPECIAL_ID_FOR_NO_GROUP_ASSIGNED ?
              'Provide the new name of the group or delete it':
              'Provide a new name. This group cannot be deleted'">
              <template v-slot:after>
                <q-btn
                  flat dense color="warning" icon="cancel"
                  @click.stop.prevent="scope.cancel"/>

                <q-btn v-if="element.id !== SPECIAL_ID_FOR_NO_GROUP_ASSIGNED"
                       flat dense color="negative" icon="delete"
                       @click.stop.prevent="deleteGroup(element as Group)"/>

                <q-btn
                  flat dense color="positive" icon="check_circle"
                  @click.stop.prevent="scope.set"
                  :disable="scope.validate(scope.value) === false || scope.initialValue === scope.value"/>
              </template>
            </q-input>
          </q-popup-edit>
        </div>
      </vue-draggable-next>
    </div>

    <div class="row q-gutter-md">
      <div class="col lower-border"
           v-for="element in tabsetGroups">
        <q-list separator>
          <vue-draggable-next

            :list="tabsFor(element as Group)"
            :group="{ name: 'tabs', pull: 'clone' }"

            @change="handleDragAndDrop($event, element as Group)">

            <q-item v-if="props.tabs.length === 0 &&
                      inBexMode() &&
                      useUiStore().rightDrawer.activeTab === DrawerTabs.UNASSIGNED_TABS &&
                      tabsStore.pendingTabset.tabs.length > 0">
              <div class="row fit q-ma-lg q-pa-lg text-subtitle2 text-grey-8">
                You can drag and drop items from the "Tabs to add" view to add them to this tabset by clicking on the
                icons
              </div>
            </q-item>

            <q-item class="q-ma-none q-pa-none"
                    clickable
                    v-ripple
                    v-for="(tab,index) in tabsFor(element as Group)"
                    @click.stop="showDetails(tab)"
                    @mouseover="showButtons(  tab.id,true)"
                    @mouseleave="showButtons( tab.id, false)"
                    @dragstart="startDrag($event, tab)"
                    :key="props.group + '_' + tab.id">

              <TabListElementWidget :showButtons="false"
                                    :showIsOpened="false"
                                    :key="props.group + '__' + tab.id"
                                    :tab="tabAsTab(tab)"
                                    :tabsetId="props.tabsetId"
                                    :highlightUrl="highlightUrl"/>

            </q-item>
          </vue-draggable-next>
        </q-list>
      </div>
    </div>
  </div>

</template>

<script setup lang="ts">
import {Tab} from "src/models/Tab";
import TabsetService from "src/services/TabsetService";
import {PropType, ref, watchEffect} from "vue";
import {VueDraggableNext} from 'vue-draggable-next'
import {uid, useQuasar} from "quasar";
import _ from "lodash"
import {DrawerTabs, useUiStore} from "src/stores/uiStore";
import {useCommandExecutor} from "src/services/CommandExecutor";
import TabListElementWidget from "src/components/widgets/TabListElementWidget.vue";
import {useUtils} from "src/services/Utils"
import InfoMessageWidget from "components/widgets/InfoMessageWidget.vue";
import {usePermissionsStore} from "src/stores/permissionsStore";
import {FeatureIdent} from "src/models/AppFeature";
import {CreateGroupCommand} from "src/domain/tabs/CreateGroup";
import {RenameGroupCommand} from "src/domain/tabs/RenameGroup";
import {TabsetColumn} from "src/models/TabsetColumn";
import {DeleteGroupCommand} from "src/domain/tabs/DeleteGroup";
import {SPECIAL_ID_FOR_NO_GROUP_ASSIGNED} from "boot/constants"
import ChromeApi from "src/services/ChromeApi";

const {inBexMode} = useUtils()

const $q = useQuasar()
const tabsStore = useTabsStore()

const {saveCurrentTabset} = useTabsetService()

const props = defineProps({
  tabs: {type: Array as PropType<Array<Tab>>, required: true},
  tabsetId: {type: String, required: true},
  group: {type: String, required: true},
  highlightUrl: {type: String, required: false}
})

const tabsetGroups = ref<TabsetColumn[]>( [])

watchEffect(() => {
  console.log("watching!", tabsStore.getCurrentTabset?.columns)
  const defaultGroupExists = _.filter(tabsStore.getCurrentTabset?.columns || [], (g: Group) => g.id === SPECIAL_ID_FOR_NO_GROUP_ASSIGNED).length > 0
  console.log("defaultGorupExists", defaultGroupExists)
  tabsetGroups.value = []
  if (!defaultGroupExists) {
    tabsetGroups.value = [new TabsetColumn(SPECIAL_ID_FOR_NO_GROUP_ASSIGNED, "no group")]
  }
  if (tabsStore.getCurrentTabset?.columns) {
    console.log("tabsetGroups", tabsetGroups.value)
    tabsetGroups.value.push(...tabsStore.getCurrentTabset.columns)
  }
  console.log("tabsetGroups2", tabsetGroups.value)
})


const tabAsTab = (tab: Tab): Tab => tab as unknown as Tab

const showButtonsProp = ref<Map<string, boolean>>(new Map())

const draggedTab = ref<Tab | undefined>(undefined)

const showButtons = (tabId: string, show: boolean) => showButtonsProp.value.set(tabId, show)

const newGroupName = ref('')

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

const log = (evt: any) => console.log(evt)

const handleDragAndDrop = (event: any, group: TabsetColumn) => {
  console.log("event", event, group)
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
    if (draggedTab.value !== undefined && group.id) {
      added.element.columnId = group.id
      if (group.id === SPECIAL_ID_FOR_NO_GROUP_ASSIGNED) {
        added.element.columnId = undefined
      }
      draggedTab.value = undefined
    } else {
    }
  }
}

const startDrag = (evt: any, tab: Tab) => {
  console.log("start drag", evt, tab)
  draggedTab.value = tab
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
const setNewName = (newValue: string) => {
  if (tabsStore?.getCurrentTabset) {
    useCommandExecutor().executeFromUi(new CreateGroupCommand(tabsStore.getCurrentTabset, newValue))
  }
}
const rename = (groupId: string, newValue: string) => {
  if (tabsStore?.getCurrentTabset) {
    useCommandExecutor().executeFromUi(new RenameGroupCommand(tabsStore.getCurrentTabset, groupId, newValue))
  }
}

const deleteGroup = (g: TabsetColumn) => {
  if (tabsStore?.getCurrentTabset) {
    useCommandExecutor().executeFromUi(new DeleteGroupCommand(tabsStore.getCurrentTabset, g.id))
      .then(() => {
        tabsetGroups.value = _.filter(tabsetGroups.value, group => group.id !== g.id)
      })
  }
}

const tabsFor = (column: TabsetColumn) => {
  let res: Tab[] = []
  //console.log("id", column, props.tabs)
  if (column.id === SPECIAL_ID_FOR_NO_GROUP_ASSIGNED) {
    res = _.filter(props.tabs, (t: Tab) => !t.columnId)
  } else {
    res = _.filter(props.tabs, (t: Tab) => t.columnId === column.id)
  }
  if (res.length === 0) {
    return [new Tab(uid(), ChromeApi.createChromeTabObject('drag & drop here', '', ''))]
  }
  return res
}

</script>

<style lang="sass" scoped>
.my-card
  width: 100%

.upper-border
  border-top: 1px solid #bfbfbf
  border-left: 1px solid #bfbfbf
  border-right: 1px solid #bfbfbf
  border-top-left-radius: 4px
  border-top-right-radius: 4px

.lower-border
  border-bottom: 1px solid #bfbfbf
  border-left: 1px solid #bfbfbf
  border-right: 1px solid #bfbfbf
  border-bottom-left-radius: 4px
  border-bottom-right-radius: 4px

</style>
