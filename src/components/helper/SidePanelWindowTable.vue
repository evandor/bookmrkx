<template>
  <div class="col-12 text-right">
    <Transition name="bounceInLeft" appear>
      <q-table
        ref="tableRef"
        flat dense
        :rows="rows"
        :columns="columns"
        :visible-columns="['name','tabsCount','windowAction']"
        row-key="id"
        :pagination="initialPagination"
        :rows-per-page-options=[3,5,7,10,15,20]
        @update:pagination="(pagination) => setNewPagination(pagination)"
        :hide-bottom="onlyOneWindowPage(rows.length)"
        binary-state-sort>
        <template v-slot:body="props">
          <q-tr :props="props">
            <q-td key="index" :props="props">
              {{ props.row.index }}
            </q-td>
            <q-td key="name" :props="props" :class="props.row.focused ? 'text-bold':''">
              {{ props.row.name }}
              <q-popup-edit v-model="props.row.name" v-slot="scope">
                <q-input v-model="scope.value" dense autofocus counter
                         @update:model-value="(val:any) => setWindowName(props.row, val)"
                         @keyup.enter="scope.set"/>
              </q-popup-edit>
            </q-td>
            <q-td key="state" :props="props">
              {{ props.row.state }}
            </q-td>
            <q-td key="tabsCount" :props="props">
              {{ props.row.tabsCount }}
            </q-td>
            <q-td key="windowAction" :props="props">
              <q-icon
                name="expand_less"
                :class="isFirstRow(props.row) ? 'text-grey' : 'text-blue-8 cursor-pointer'"
                @click="moveWindowUp(props.row)"/>
              <q-icon
                name="expand_more"
                class="q-ml-sm"
                :class="isLastRow(props.row, rows.length) ? 'text-grey' : 'text-blue-8 cursor-pointer'"
                @click="moveWindowDown(props.row)"/>
              <q-icon name="open_in_new"
                      class="q-ml-sm"
                      :class="useWindowsStore().currentWindow?.id === props.row.id ? 'text-grey' : 'text-blue-8 cursor-pointer'"
                      @click="openWindow(props.row.id)">
                <q-tooltip :delay=500 class="tooltip-small">Open this window</q-tooltip>
              </q-icon>
<!--              <q-icon v-if="props.row.state === 'normal' || props.row.state === 'maximized'" name="o_visibility_off"-->
<!--                      class="q-ml-sm text-orange-8 cursor-pointer"-->
<!--                      @click="hideWindow(props.row.id)">-->
<!--                <q-tooltip :delay=500 class="tooltip-small">Minimize this window</q-tooltip>-->
<!--              </q-icon>-->
<!--              <q-icon v-else-if="props.row.state === 'minimized'" name="o_visibility"-->
<!--                      class="q-ml-sm text-orange-8 cursor-pointer"-->
<!--                      @click="restoreWindow(props.row.id)">-->
<!--                <q-tooltip :delay=500 class="tooltip-small">Restore this window</q-tooltip>-->
<!--              </q-icon>-->
              <q-icon name="o_close"
                      class="q-ml-sm text-red-8 cursor-pointer"
                      @click="closeWindow(props.row.id)">
                <q-tooltip :delay=500 class="tooltip-small">Close this window</q-tooltip>
              </q-icon>
            </q-td>
          </q-tr>
        </template>
      </q-table>
    </Transition>

  </div>
</template>

<script lang="ts" setup>

import {useWindowsStore} from "stores/windowsStore";
import {onMounted, ref, watch, watchEffect} from "vue";
import {Window} from "src/models/Window"
import _ from "lodash";
import {LocalStorage, QTable} from "quasar";
import {UI_WINDOWS_ITEMS_PER_PAGE} from "boot/constants";

const columns = [
  {name: 'index', field: 'index', label: '#', align: 'left', sortable: false},
  {name: 'name', field: 'name', required: true, label: 'Window Name (editable)', align: 'left', sortable: false},
  {name: 'state', field: 'state', label: 'State', align: 'left', sortable: false},
  {name: 'tabsCount', field: 'tabsCount', required: true, label: '#Tabs', align: 'right', sortable: false},
  {name: 'windowAction', align: 'center', label: 'Actions', field: 'windowAction', sortable: false}
]

const initialPagination = ref<object>({
  sortBy: 'index',
  descending: false,
  page: 1,
  rowsPerPage: LocalStorage.getItem(UI_WINDOWS_ITEMS_PER_PAGE) as number || 5
})

const rows = ref<object[]>([])
const currentWindowName = ref('---')
const tableRef = ref<QTable>(null as unknown as QTable)

onMounted(() => {
  rows.value = calcWindowRows()
})

watch(() => useWindowsStore().currentChromeWindows, (newWindows, oldWindows) => {
  console.log("windows changed", newWindows, oldWindows)
  rows.value = calcWindowRows()
})

watchEffect(() => {
  const res = useWindowsStore().currentWindow && useWindowsStore().currentWindow.id ?
    useWindowsStore().windowNameFor(useWindowsStore().currentChromeWindow.id || 0) || 'n/a' :
    'n/a'
  currentWindowName.value = res
})

const openWindow = (windowId: number) => {
  if (useWindowsStore().currentChromeWindow?.id !== windowId) {
    chrome.windows.update(windowId, {drawAttention: true, focused: true},
      (callback) => {
      })
  }
}

const moveWindowUp = (window: object) => {
  console.log("moving up", window)
  useWindowsStore().moveWindowUp(window['index' as keyof object])
  rows.value = calcWindowRows()
}

const moveWindowDown = (window: object) => {
  console.log("moving down", window)
  useWindowsStore().moveWindowDown(window['index' as keyof object])
  rows.value = calcWindowRows()
}

const hideWindow = (windowId: number) => {
  chrome.windows.update(windowId, {state: "minimized"})
  useWindowsStore().refreshCurrentWindows()
}

const restoreWindow = (windowId: number) => {
  if (useWindowsStore().currentChromeWindow?.id !== windowId) {
    chrome.windows.update(windowId, {state: "normal"})
    useWindowsStore().refreshCurrentWindows()
  }
}

const closeWindow = (windowId: number) => {
  chrome.windows.remove(windowId)
  useWindowsStore().refreshCurrentWindows()
}

const calcWindowRows = () => {
  let index = 100
  const usedIndices: number[] = []
  const result = _.map(useWindowsStore().currentChromeWindows as chrome.windows.Window[], (cw: chrome.windows.Window) => {
    const windowFromStore: Window | undefined = useWindowsStore().windowForId(cw.id || -3)
    if (!windowFromStore || !windowFromStore.index) {
      console.log("found windowfromstore without index", windowFromStore)
    }
    let indexToUse = windowFromStore && windowFromStore.index ? windowFromStore.index : index++
    if (usedIndices.indexOf(indexToUse) >= 0) {
      console.log("found used index", indexToUse, usedIndices)
      indexToUse = 1 + Math.max(...usedIndices)
      useWindowsStore().upsertWindow(cw, windowFromStore?.title, indexToUse)
    }
    usedIndices.push(indexToUse)

    console.log(`setting window ${cw.id} ['${windowFromStore?.title}'] (#${cw.tabs?.length} tabs) -> #${indexToUse}`)

    return {
      id: cw.id,
      index: indexToUse,
      tabsCount: cw.tabs?.length || 0,
      name: useWindowsStore().windowNameFor(cw.id || 0) || cw.id,
      windowHeight: cw['height' as keyof object],
      windowWidth: cw['width' as keyof object],
      focused: cw.focused,
      alwaysOnTop: cw.alwaysOnTop,
      incognito: cw.incognito,
      sessionId: cw.sessionId,
      state: cw.state,
      type: cw.type,
      windowIcon: "*"
    }
  })

  return result
}


const setWindowName = (windowRow: object, newName: string) => {
  if (newName && newName.toString().trim().length > 0) {
    const id = windowRow['id' as keyof object]
    chrome.windows.get(id, {populate: true}, (cw) => {
      useWindowsStore().upsertWindow(cw, newName.toString().trim(), windowRow['index' as keyof object])
      if (useWindowsStore().currentChromeWindow?.id === id) {
        currentWindowName.value = newName
        //console.log("setting window name to ", currentWindowName.value)
        useWindowsStore().currentWindowName = newName
      }
    })
  }

}

const setNewPagination = (pagination: object) => {
  initialPagination.value = pagination
  LocalStorage.set(UI_WINDOWS_ITEMS_PER_PAGE, pagination['rowsPerPage' as keyof object] || 5)
}

const onlyOneWindowPage = (length: number) => length <= 5 && length <= initialPagination.value['rowsPerPage' as keyof object]

const isFirstRow = (row: any) => tableRef.value.filteredSortedRows.indexOf(row) === 0
const isLastRow = (row: any, length: number) => tableRef.value.filteredSortedRows.indexOf(row) === (length - 1)

</script>
