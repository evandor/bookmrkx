<template>

  <q-card flat>
    <q-card-section class="q-pa-none">

      <TabList v-if="props.tabset?.view === 'list'"
               group="otherTabs"
               :highlightUrl="highlightUrl"
               :tabsetId="props.tabset?.id"
               :tabsetSorting="props.tabset?.sorting"
               :tabsetSharedId="props.tabset?.sharedId"
               :tabset-mqtt-url="props.tabset?.mqttUrl"
               :simpleUi="props.simpleUi"
               :tabs="currentTabs()"/>

      <TabGroups v-else-if="props.tabset?.view === 'group'"
                 group="otherTabs"
                 :highlightUrl="highlightUrl"
                 :tabsetId="props.tabset?.id"
                 :tabs="currentTabs()"/>

      <TabGrid v-else-if="props.tabset?.view === 'grid'"
               group="otherTabs"
               :highlightUrl="highlightUrl"
               :tabs="currentTabs()"/>

      <TabsExporter v-else-if="props.tabset?.view === 'exporter'"
                    group="otherTabs"
                    :tabs="currentTabs()"/>

      <!-- fallback -->
      <TabList v-else
               group="otherTabs"
               :highlightUrl="highlightUrl"
               :tabsetId="props.tabset?.id"
               :tabs="currentTabs()"/>

    </q-card-section>

  </q-card>

</template>

<script lang="ts" setup>

import TabList from "components/layouts/TabList.vue";
import TabTable from "components/layouts/TabTable.vue";
import TabGroups from "components/layouts/TabGroups.vue";
import TabsExporter from "components/layouts/TabsExporter.vue";
import {useTabsStore} from "src/stores/tabsStore";
import {PropType, ref, watchEffect} from "vue";
import {Tab} from "src/models/Tab";
import _ from "lodash";
import PageForTabset from "components/layouts/PageForTabset.vue";
import TabsCanvas from "components/layouts/TabsCanvas.vue";
import {useUiStore} from "src/stores/uiStore";
import {useRoute} from "vue-router";
import {useCommandExecutor} from "src/services/CommandExecutor";
import {ToggleSortingCommand} from "src/domain/tabsets/ToggleSorting";
import TabGrid from "components/layouts/TabGrid.vue";
import {Tabset} from "src/models/Tabset";

const tabsStore = useTabsStore()
const route = useRoute()

const highlightUrl = ref('')
const orderDesc = ref(false)
const tabsetId = ref(null as unknown as string)

const props = defineProps({
  tabset: {type: Object as PropType<Tabset>, required: true},
  simpleUi: {type: Boolean, default: false}
})

watchEffect(() => {
  if (!route || !route.query) {
    return
  }
  const highlight = route?.query['highlight'] as unknown as string
  if (highlight && highlight.length > 0) {
    try {
      // highlightUrl.value = atob(highlight)
      useUiStore().addHighlight(atob(highlight))
    } catch (e: any) {
      console.error("highlight error", e)
    }
  }
})

watchEffect(() => {
  const highlightUrls: string[] = useUiStore().getHighlightUrls
  if (highlightUrls.length > 0) {
    //console.log("found hightlight", highlightUrls)
    highlightUrl.value = highlightUrls[0]
  } else {
    highlightUrl.value = ''
  }
})

watchEffect(() => {
  if (!route || !route.params) {
    return
  }
  tabsetId.value = route?.params.tabsetId as string
  if (tabsetId.value) {
    console.debug("got tabset id", tabsetId.value)
    const ts = tabsStore.selectCurrentTabset(tabsetId.value)
  }
})

function currentTabs(): Tab[] {
  //console.log("got", props.tabset.tabs)
  const filter = useUiStore().tabsFilter
  if (filter && filter.trim() !== '') {
    return _.orderBy(_.filter(props.tabset.tabs, (t: Tab) => {
      return (t.url || '')?.indexOf(filter) >= 0 ||
        (t.title || '')?.indexOf(filter) >= 0 ||
        t.description.indexOf(filter) >= 0
    }), getOrder(), [orderDesc.value ? 'desc' : 'asc'])
  }
  return _.orderBy(props.tabset.tabs, getOrder(), [orderDesc.value ? 'desc' : 'asc'])
}

function getOrder() {
  if (props.tabset) {
    switch (props.tabset?.sorting) {
      case 'alphabeticalUrl':
        return (t: Tab) => t.url?.replace("https://", "").replace("http://", "").toUpperCase()
        break
      case 'alphabeticalTitle':
        return (t: Tab) => t.title?.toUpperCase()
        break
      default:
        return (t: Tab) => 1
    }
    return (t: Tab) => 1
  }
}

function tabsForGroup(groupId: number): Tab[] {
  return _.orderBy(
    _.filter(
      tabsStore.getTabset(tabsetId.value)?.tabs,
      // @ts-ignore
      (t: Tab) => t?.groupId === groupId),
    getOrder(), [orderDesc.value ? 'desc' : 'asc'])
}

const toggleSorting = () => useCommandExecutor().executeFromUi(new ToggleSortingCommand(tabsetId.value))

const toggleOrder = () => orderDesc.value = !orderDesc.value

const sortingInfo = (): string => {
  switch (props.tabset?.sorting) {
    case 'custom':
      return ", sorted by Index" + (orderDesc.value ? ', descending' : '')
      break
    case 'alphabeticalUrl':
      return ", sorted by URL" + (orderDesc.value ? ', descending' : '')
      break
    case 'alphabeticalTitle':
      return ", sorted by Title" + (orderDesc.value ? ', descending' : '')
      break
    default:
      return "";
      break
  }
}

</script>
