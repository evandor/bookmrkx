<template>

  <InfoMessageWidget
    v-if="tabset?.type === TabsetType.DYNAMIC"
    :probability="1"
    ident="dynamicTabset_info"
    hint="This is a 'dynamic' Tabset, i.e. it gets its data from some kind of query (e.g. checking for tags in your tabsets) and is readonly for that reason."/>

  <q-list separator>

    <q-item
      clickable
      v-ripple
      v-for="tab in currentTabs()"
      class="q-ma-none q-pa-xs"
      :style="itemStyle(tab)"
      @click.stop="showDetails(tab)"
      :key="'paneltablist_' + tab.id">

      <PanelTabListElementWidget :key="'ptlew__' + tab.id" :tab="tabAsTab(tab)"/>

    </q-item>

  </q-list>

</template>

<script setup lang="ts">
import {Tab} from "src/models/Tab";
import {PropType, ref} from "vue";
import {useQuasar} from "quasar";
import _ from "lodash"
import {useTabsStore} from "src/stores/tabsStore";
import {DrawerTabs, useUiStore} from "src/stores/uiStore";
import {useUtils} from "src/services/Utils"
import InfoMessageWidget from "components/widgets/InfoMessageWidget.vue";
import {usePermissionsStore} from "src/stores/permissionsStore";
import {FeatureIdent} from "src/models/AppFeature";
import PanelTabListElementWidget from "components/widgets/PanelTabListElementWidget.vue";
import {useRoute} from "vue-router";
import {Tabset, TabsetType} from "src/models/Tabset";
import {DynamicTabSourceType} from "src/models/DynamicTabSource";

const {inBexMode} = useUtils()

const $q = useQuasar()
const tabsStore = useTabsStore()
const route = useRoute()

const highlightUrl = ref('')
const tabsetId = ref(null as unknown as string)

const props = defineProps({
  tabset: {type: Object as PropType<Tabset>, required: true}
})

const thumbnails = ref<Map<string, string>>(new Map())
const tabAsTab = (tab: Tab): Tab => tab as unknown as Tab

const showButtonsProp = ref<Map<string, boolean>>(new Map())

const showButtons = (tabId: string, show: boolean) => showButtonsProp.value.set(tabId, show)


function currentTabs(): Tab[] {
  console.log("current", props.tabset, props.tabset.dynamicTabs, props.tabset.dynamicTabs?.type)
  if (props.tabset && props.tabset.dynamicTabs && props.tabset.dynamicTabs.type === DynamicTabSourceType.TAG) {
    const results: Tab[] = []
    //console.log("checking", props.tabset.dynamicTabs)
    const tag = props.tabset.dynamicTabs?.config['tags' as keyof object][0]
    console.log("using tag", tag)
    _.forEach([...tabsStore.tabsets.values()], (tabset: Tabset) => {
      _.forEach(tabset.tabs, (tab: Tab) => {
        if (tab.tags?.indexOf(tag) >= 0) {
          results.push(tab)
        }
      })
    })
    // return _.orderBy(results, getOrder(), [orderDesc.value ? 'desc' : 'asc'])
    return results
  } else {
    return tabsStore.getCurrentTabs
  }

}

const showDetails = (tab: Tab) => {
  useUiStore().setSelectedTab(tab)
  useUiStore().rightDrawerSetActiveTab(DrawerTabs.TAB_DETAILS)
}

const itemStyle = (tab: Tab) => "border-bottom: 1px solid #fafafa"


</script>

<style lang="sass" scoped>
.my-card
  width: 100%
</style>
