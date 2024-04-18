<template>
  <div class="col-12 text-right">

    <Transition name="bounceInLeft" appear>

      <q-markup-table class="q-ma-none" dense flat>
        <thead>
        <tr>
<!--                    <th></th>-->
          <th class="text-left">Window Name</th>
          <th class="text-right">#Tabs</th>
          <th class="text-right q-pr-none" v-if="windowsToOpenOptions.length > 0">
            <span class="cursor-pointer"><q-icon name="open_in_new" class="q-mr-xs"/>Open Window </span>
            <q-menu :offset="[0, 7]" fit>
              <q-list dense style="min-width: 250px">
                <q-item clickable v-close-popup>
                  <q-item-section @click="openNewWindow({label: ' > open new Window', value: 'newWindow'})">Open new Window</q-item-section>
                </q-item>
                <q-separator v-if="windowsToOpenOptions.length > 0" />
                <q-item clickable v-close-popup v-for="w in windowsToOpenOptions">
                  <q-item-section @click="openNewWindow(w)">{{ w['label' as keyof object] }}</q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </th>
          <th class="text-right q-pr-none" v-else>
            <span class="cursor-pointer" @click="openNewWindow({label: ' > open new Window', value: 'newWindow'})"><q-icon name="open_in_new" class="q-mr-xs"/>Open Window </span>
          </th>
        </tr>
        </thead>

        <vue-draggable-next
          class="q-ma-none"
          tag="tbody"
          :list="rows"
          :group="{ name: 'tabs', pull: 'clone' }"
          @change="(event:any) => handleDragAndDrop(event)">
          <tr v-for="row in rows"
              @mouseover="hoveredWindow = row['id' as keyof object]"
              @mouseleave="hoveredWindow = undefined"
              style="max-height:15px">
<!--                        <td>{{ row['index' as keyof object] }}</td>-->
            <!--            <td>{{ row['state' as keyof object] }}</td>-->
            <td class="text-left" :class="windowNameRowClass(row)"
                @dblclick.stop="openRenameWindowDialog(row['id' as keyof object], row['name' as keyof object], row['index' as keyof object])"
                @click.prevent.stop="openWindow(row['id' as keyof object])">
              <q-icon v-if="rows.length > 1" name="drag_indicator" class="q-mr-sm" style="cursor:move">
                <q-tooltip class="tooltip-small" v-if="devMode">{{ row['index' as keyof object]}}</q-tooltip>
              </q-icon>
              <span class="cursor-pointer" :data-testid="'windowDataColumn_name_' + row['id' as keyof object]">
                {{ row['name' as keyof object] }}
                <q-tooltip class="tooltip-small" v-if="devMode">{{ row['id' as keyof object]}}</q-tooltip>
              </span>

            </td>
            <td :data-testid="'windowDataColumn_tabsCount_' + row['id' as keyof object]">
              {{ row['tabsCount' as keyof object] }}
            </td>
            <td>
              <template v-if="hoveredWindow === row['id' as keyof object]">
                <q-icon v-if="'minimized' !== row['state' as keyof object]"
                        name="visibility_off"
                        class="q-ml-sm text-warning cursor-pointer"
                        @click="minimizeWindow(row['id' as keyof object])">
                  <q-tooltip :delay=500 class="tooltip-small">Hide Window</q-tooltip>
                </q-icon>
                <!--                <q-icon name="open_in_new"-->
                <!--                        class="q-ml-sm cursor-pointer"-->
                <!--                        :class="useWindowsStore().currentChromeWindow?.id === row['id' as keyof object] ? 'text-grey' : 'text-blue-8 cursor-pointer'"-->
                <!--                        @click="openWindow(row['id' as keyof object])">-->
                <!--                  <q-tooltip :delay=500 class="tooltip-small">Open this window</q-tooltip>-->
                <!--                </q-icon>-->
                <q-icon name="edit"
                        class="q-ml-sm text-blue-8 cursor-pointer"
                        @click="openRenameWindowDialog(row['id' as keyof object], row['name' as keyof object], row['index' as keyof object])">
                  <q-tooltip :delay=500 class="tooltip-small">Edit Window Name</q-tooltip>
                </q-icon>
                <q-icon v-if="!windowIsManaged(row)"
                  name="o_bookmark_add"
                        size="xs"
                        class="q-ml-sm text-warning cursor-pointer"
                        @click="saveAsTabset(row['id' as keyof object], row['name' as keyof object])">
                  <q-tooltip :delay=500 class="tooltip-small">Save as Tabset</q-tooltip>
                </q-icon>
                <q-icon v-else
                        name="o_bookmark_add"
                        :disabled="true"
                        size="xs"
                        class="q-ml-sm text-grey cursor-pointer">
                  <q-tooltip :delay=500 class="tooltip-small">Already a tabset</q-tooltip>
                </q-icon>

                <q-icon v-if="useWindowsStore().currentChromeWindows.length === 1"
                        name="o_close"
                        class="q-ml-sm text-red-8"
                        :disabled="true">
                  <q-tooltip :delay=500 class="tooltip-small">Last Window cannot be closed</q-tooltip>
                </q-icon>
                <q-icon v-else
                        name="o_close"
                        class="q-ml-sm text-red-8 cursor-pointer"
                        @click="closeWindow(row['id' as keyof object])">
                  <q-tooltip :delay=500 class="tooltip-small">Close this window</q-tooltip>
                </q-icon>

              </template>
              <template v-else>
                <div>&nbsp;</div>
              </template>
            </td>
          </tr>
        </vue-draggable-next>
      </q-markup-table>


    </Transition>

  </div>
</template>

<script lang="ts" setup>

import {useWindowsStore} from "stores/windowsStore";
import {onMounted, ref, watch, watchEffect} from "vue";
import {Window} from "src/models/Window"
import _ from "lodash";
import { useQuasar} from "quasar";
import {VueDraggableNext} from 'vue-draggable-next'
import {useCommandExecutor} from "src/services/CommandExecutor";
import {useUtils} from "src/services/Utils";
import {useNotificationHandler} from "src/services/ErrorHandler";
import {useSettingsStore} from "stores/settingsStore";

const {handleError} = useNotificationHandler()
const {sendMsg} = useUtils()

const $q = useQuasar()
const settingsStore = useSettingsStore()

const rows = ref<object[]>([])
const currentWindowName = ref('---')

const windowsToOpen = ref<string>('')
const windowsToOpenOptions = ref<object[]>([])
const tabsetsMangedWindows = ref<object[]>([])
const hoveredWindow = ref<number | undefined>(undefined)
const devMode = ref<boolean>(settingsStore.isEnabled('dev'))

const updateWindows = () => {
    useWindowsStore().setup('got window-updated message', true)
      .then(() => rows.value = calcWindowRows())
}

onMounted(() => {
  rows.value = calcWindowRows()
})

watch(() => useWindowsStore().currentChromeWindows, (newWindows, oldWindows) => {
  //console.log("windows changed", newWindows, oldWindows)
  rows.value = calcWindowRows()
})

//console.log("====>: chrome.runtime.onMessage.hasListeners(windowsUpdatedListener)", chrome.runtime.onMessage.hasListener(windowsUpdatedListener))
//chrome.runtime.onMessage.addListener(windowsUpdatedListener)
chrome.windows.onCreated.addListener((w:chrome.windows.Window) => updateWindows())
chrome.windows.onRemoved.addListener((wId:number) => updateWindows())


chrome.tabs.onRemoved.addListener((tabId: number, removeInfo: chrome.tabs.TabRemoveInfo) => {
  //console.log("***here we are", tabId, removeInfo)
  useWindowsStore().setup('got window-updated message')
    .then(() => rows.value = calcWindowRows())
    .catch((err) => handleError(err))
})

chrome.tabs.onCreated.addListener((tab: chrome.tabs.Tab) => {
  //console.log("***here we are2", tab)
  // useWindowsStore().setup('got window-updated message')
  //   .then(() => rows.value = calcWindowRows())
  //   .catch((err) => handleError(err))
})

chrome.tabs.onUpdated.addListener((tabId: number, changeInfo: chrome.tabs.TabChangeInfo, tab: chrome.tabs.Tab) => {
  //console.log("***here we are3", tab)
  useWindowsStore().setup('got window-updated message')
    .then(() => rows.value = calcWindowRows())
    .catch((err) => handleError(err))
})

watchEffect(() => {
  // adding potentially new windows from 'open in window' logic
  windowsToOpenOptions.value = []
  tabsetsMangedWindows.value = []

  windowsToOpenOptions.value = _.sortBy(windowsToOpenOptions.value, ["label"])
})

watchEffect(() => {
  const res = useWindowsStore().currentChromeWindow && useWindowsStore().currentChromeWindow.id ?
    useWindowsStore().windowNameFor(useWindowsStore().currentChromeWindow.id || 0) || 'n/a' :
    'n/a'
  currentWindowName.value = res
})

const openNewWindow = (w: object) => {
  console.log("windows to open set to ", w)
  const label = w['label' as keyof object] as string
  const tsId = w['value' as keyof object] as string
  if (tsId === 'newWindow') {
    chrome.windows.create()
    windowsToOpen.value = ''
  } else if (label && label.trim() !== '') {
    useCommandExecutor().execute(new RestoreTabsetCommand(tsId, label, false))
    windowsToOpen.value = ''
  }
}

const openWindow = (windowId: number) => {
  if (useWindowsStore().currentChromeWindow?.id !== windowId) {
    chrome.windows.update(windowId, {drawAttention: true, focused: true},
      (callback) => {
      })
  }
}
const saveAsTabset = (windowId: number, name: string) => {
  $q.dialog({
    component: NewTabsetDialog,
    componentProps: {
      windowId: windowId,
      spaceId: useSpacesStore().space?.id,
      name: name,
      fromPanel: true
    }
  })
}

const minimizeWindow = (windowId: number) => {
  chrome.windows.update(windowId, {state: "minimized"})
  useWindowsStore().refreshCurrentWindows()
}

const closeWindow = (windowId: number) => {
  chrome.windows.remove(windowId)
  useWindowsStore().refreshCurrentWindows()
}

const calcWindowRows = () => {
  //console.log("calculating window Rows")
  const result = _.map(useWindowsStore().currentChromeWindows as chrome.windows.Window[], (cw: chrome.windows.Window) => {
    const windowFromStore: Window | undefined = useWindowsStore().windowForId(cw.id || -2)

    // console.debug(`setting window ${cw.id} ['${windowFromStore?.title}'] (#${cw.tabs?.length} tabs, #${windowFromStore?.hostList.size} hosts) -> #${windowFromStore?.index}`)

    return {
      id: cw.id,
      index: windowFromStore?.index || 0,
      tabsCount: cw.tabs?.length || 0,
      name: useWindowsStore().windowNameFor(cw.id || 0) || cw.id!.toString(),
      windowHeight: cw['height' as keyof object],
      windowWidth: cw['width' as keyof object],
      focused: cw.focused,
      alwaysOnTop: cw.alwaysOnTop,
      incognito: cw.incognito,
      sessionId: cw.sessionId,
      state: cw.state,
      type: cw.type,
      windowIcon: "*",
      hostList: windowFromStore?.hostList
    }
  })

  return _.sortBy(result, "index")
}

const handleDragAndDrop = async (event: any) => {
  const {moved, added} = event

  if (moved) {
    console.log(`moved event: '${moved.element.id}' ${moved.oldIndex} -> ${moved.newIndex}`, rows.value, event)
    //useWindowsStore().moveWindow(rows.value, moved.element.id, moved.oldIndex, moved.newIndex)
    const windowIndex = moved.element.id
    //console.log("moving window", windowIndex)
    //const theWindows = getSortedWindows(windowForId);

    //console.log("*** theWindows", theWindows)
    const oldIndex = moved.oldIndex
    const newIndex = moved.newIndex

    //console.log("moving", windowIndex, oldIndex, newIndex)
    if (oldIndex >= 0 && rows.value.length > 0) {
      console.log("old rows", _.map(rows.value, r => r['id' as keyof object] + "("+r['name' as keyof object]+"):" + r['index' as keyof object]))
      const newOrder = _.map(rows.value, r => r['id' as keyof object] as number)
      const startIndex = rows.value[0]['index' as keyof object]
      let index = 0//
      console.log("newOrder", newOrder, startIndex)
      for (const r of newOrder) {
        await useWindowsStore().updateWindowIndex(r, index++)
      }
    }
    rows.value = calcWindowRows()
    sendMsg('window-updated', {initiated: "SidePanelWindowMarkupTable#handleDragAndDrop"})

    //useWindowsStore().refreshCurrentWindows()
  } else {
    console.log("unhandled event!", event)
  }
}

const openRenameWindowDialog = (windowId: number, currentName: string, index: number) => {
  $q.dialog({component: RenameWindowDialog, componentProps: {windowId, currentName, index}})
    .onOk((name: string) => {
      console.log("hier", name)
      rows.value = calcWindowRows()
      // if (useWindowsStore().currentChromeWindow?.id === windowId) {
      //   useWindowsStore().currentWindowName = name
      //   //sendMsg('window-updated', {initiated: "RenameWindowDialog#updateWindow"})
      // }
    })
}

const windowNameRowClass = (row: any) => {
  if (useWindowsStore().currentChromeWindow?.id === row['id' as keyof object]) {
    return row['focused' as keyof object] ? 'text-bold text-italic' : 'text-bold'
  }
  if (row['focused' as keyof object]) {
    return 'text-italic'
  }
  if (row['state'] === 'minimized') {
    return 'text-grey-5'
  }
  return ''
}

const windowIsManaged = (row: object) => {
  return _.find(tabsetsMangedWindows.value, tmw => tmw['label' as keyof object] === row['name' as keyof object]) !== undefined
}

</script>

<style scoped>

.q-table th, .q-table td {
  padding-top: 0;
  padding-bottom: 0
}

</style>
