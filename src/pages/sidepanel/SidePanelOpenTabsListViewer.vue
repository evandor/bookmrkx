<template>

  <q-list class="q-mt-none">

    <div class="row q-mt-xs">
      <div class="col-6 q-mt-sm">
        <SidePanelTabsetsSelectorWidget :use-as-tabsets-switcher="true"/>
      </div>
      <div class="col-6 text-right">
        Current Window only
        <q-checkbox v-model="currentWindowOnly"/>
      </div>
      <div class="col-12 q-mb-xs">
        <q-input
          dense
          autofocus
          ref="filterRef"
          filled
          :hint="filterHint()"
          v-model="filter"
          label="Filter Tabs">
          <template v-slot:append>
            <q-icon v-if="filter !== ''" name="clear" class="cursor-pointer" @click="resetFilter"/>
          </template>
        </q-input>
      </div>
    </div>

  </q-list>

  <div class="q-pa-none q-ma-none">

    <template v-if="currentWindowOnly">
      <div v-for="tab in tabsForCurrentWindow"
           class="q-my-none tabBorder q-mb-xs"
           :style="cardStyle(tab)">
        <OpenTabCard2
          v-on:selectionChanged="tabSelectionChanged"
          v-on:addedToTabset="tabAddedToTabset"
          v-on:hasSelectable="hasSelectable"
          :chromeTab="tab"
          :windowId="useWindowsStore().currentChromeWindow?.id || 0"
          :useSelection="useSelection"/>
      </div>
    </template>

    <template v-else>
      <q-expansion-item v-for="w in rows"
                        default-opened
                        dense-toggle
                        expand-separator
                        icon="o_grid_view"
                        :label="w['name' as keyof object]"
                        :caption="w['tabsCount' as keyof object] +  ' tab(s)'">
        <div class="q-my-none tabBorder q-mb-xs"
             v-for="tab in filteredTabs(w['tabs' as keyof object] as chrome.tabs.Tab[])">
          <OpenTabCard2
            v-on:selectionChanged="tabSelectionChanged"
            v-on:addedToTabset="tabAddedToTabset"
            v-on:hasSelectable="hasSelectable"
            :chromeTab="tab"
            :windowId="w['id' as keyof object]"
            :useSelection="useSelection"/>
        </div>

      </q-expansion-item>
    </template>


  </div>


</template>

<script setup lang="ts">
import {Tabset} from "src/models/Tabset";
import _ from "lodash";
import {onMounted, ref, watch, watchEffect} from "vue"
import {useUiStore} from "src/stores/uiStore";
import Analytics from "src/utils/google-analytics";
import {useWindowsStore} from "src/stores/windowsStore";
import {Window} from "src/models/Window";
import OpenTabCard2 from "components/layouts/OpenTabCard2.vue";
import SidePanelTabsetsSelectorWidget from "components/widgets/SidePanelTabsetsSelectorWidget.vue";

const useSelection = ref(false)
const userCanSelect = ref(false)
const currentWindowOnly = ref(true)
const tabsForCurrentWindow = ref<chrome.tabs.Tab[]>([])

const tabSelection = ref<Set<string>>(new Set<string>())
const tabs = ref<chrome.tabs.Tab[]>([])
const filter = ref('')
const filterRef = ref(null)
const filteredTabsCount = ref(0)
const rows = ref<object[]>([])

onMounted(async () => {
  Analytics.firePageViewEvent('SidePanelOpenTabsListViewer', document.location.href);
  rows.value = await calcWindowRows()
})

chrome.windows.onCreated.addListener(async (w: chrome.windows.Window) => rows.value = await calcWindowRows())
chrome.windows.onRemoved.addListener(async (wId: Number) => rows.value = await calcWindowRows())
chrome.tabs.onUpdated.addListener(async (a: any, b: any, c: any) => rows.value = await calcWindowRows())
chrome.tabs.onCreated.addListener(async (a: any) => rows.value = await calcWindowRows())
chrome.tabs.onRemoved.addListener(async (a: any, b: any) => rows.value = await calcWindowRows())

const filteredTabs = (tabs: chrome.tabs.Tab[]) => {
  const res = _.filter(tabs, (t: chrome.tabs.Tab) => (t.title || 'unknown title').toLowerCase().indexOf(filter.value) >= 0)
  filteredTabsCount.value = res.length
  return res
}

watchEffect(() => {
  userCanSelect.value = false
})

const tabSelectionChanged = (a: any) => {
  const {tabId, selected} = a
  if (selected) {
    tabSelection.value.add(tabId)
  } else {
    tabSelection.value.delete(tabId)
  }
}

const tabAddedToTabset = (a: any) => {
  const {tabId, tabUrl} = a
  tabSelection.value.delete(tabId)
}

const hasSelectable = () => userCanSelect.value = true

const resetFilter = () => {
  filter.value = ''
  if (filterRef.value) {
    // @ts-ignore
    filterRef.value.focus()
  }
}

const calcWindowRows = async () => {
  await useWindowsStore().refreshCurrentWindows()
  const result = _.map(useWindowsStore().currentChromeWindows as chrome.windows.Window[], (cw: chrome.windows.Window) => {
    const windowFromStore: Window | undefined = useWindowsStore().windowForId(cw.id || -2)

    return {
      id: cw.id,
      index: windowFromStore?.index || 0,
      tabsCount: cw.tabs?.length || 0,
      tabs: cw.tabs,
      name: useWindowsStore().windowNameFor(cw.id || 0) || cw.id!.toString(),
      focused: cw.focused,
      state: cw.state,
      type: cw.type
    }
  })
  return result// _.sortBy(result, "index")
}

const windowShouldBeOpen = (w: object) => {
  return w['id' as keyof object] === useWindowsStore().currentChromeWindow?.id
}


const cardStyle = (tab: chrome.tabs.Tab) => {
  const height = "30px";
  let background = ''
  if (hasDuplicate(tab)) {
    background = "background: radial-gradient(circle, #FFFFFF 0%, #FFECB3 100%)"
  }
  return `${background}`
}

const hasDuplicate = (tab: chrome.tabs.Tab) => {
  const allCurrentTabs: chrome.tabs.Tab[] = (useWindowsStore().currentChromeWindow?.tabs || []) as chrome.tabs.Tab[]
  return _.filter(allCurrentTabs, (t: chrome.tabs.Tab) => {
    if (tab.url && t.url === tab.url) {
      return true
    }
    return false
  }).length > 1
}

const filterHint = () => {
  if (filter.value.trim() === '') {
    return currentWindowOnly.value ?
      'window has ' + tabsForCurrentWindow.value.length + ' tab' + (tabsForCurrentWindow.value.length === 1 ? '' : 's') :
      ''
  }
  return 'found ' + filteredTabsCount.value + ' tab' + (filteredTabsCount.value === 1 ? '' : 's')
}

</script>


<style lang="sass" scoped>

.tabBorder
  border-radius: 5px 5px 0 0
  border: 1px solid $lightgrey
  border-bottom: 0

</style>
