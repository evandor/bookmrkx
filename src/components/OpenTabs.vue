<template>

  <InfoMessageWidget
    v-if="tabsStore.currentTabsetId && tabsStore.tabs.length > 0"
    :probability="0.5"
    ident="openTabs_dnd" hint="You can drag and drop open tabs into your current tabset by clicking on the
          favicon."/>

  <InfoMessageWidget
    v-if="tabsStore.currentTabsetId && tabsStore.tabs.length > 9"
    :probability="0.7"
    ident="openTabs_darkerBackground" hint="If an open tab has a grey background, it indicates
    that is is already contained in the current tabset"/>

  <!--  @end="end"-->
  <vue-draggable-next
    :list="unpinnedNoGroup()"
    :group="{ name: 'tabs', pull: 'clone', put: false }"

    :sort="true">

    <div
      class="col-12 q-pa-xs items-center justify-center" style="width:100%; max-width: 300px;cursor: move"
      v-for="tab in unpinnedNoGroup()"
      :key="tab.id">

      <OpenTabCard2 :tab="tab"
                    :windowId="useWindowsStore().currentChromeWindow?.id || 0"/>

    </div>

  </vue-draggable-next>

</template>

<script setup lang="ts">

import {Tab} from "src/models/Tab";
import OpenTabCard from "components/layouts/OpenTabCard.vue"
import _ from "lodash"
import {useTabsStore} from "src/stores/tabsStore"
import {VueDraggableNext} from 'vue-draggable-next'
import {useUiStore} from "src/stores/uiStore";
import InfoMessageWidget from "components/widgets/InfoMessageWidget.vue";
import OpenTabCard2 from "components/layouts/OpenTabCard2.vue";
import {useWindowsStore} from "stores/windowsStore";

const props = defineProps({
  filter: {
    type: String,
    required: false
  }
})

const tabsStore = useTabsStore()
const uiStore = useUiStore()

function unpinnedNoGroup(): Tab[] {
  return _.filter(
    tabsStore.browserTabset?.tabs,
    //@ts-ignore
    (t: Tab) => {

      if (props.filter && props.filter.trim().length > 0) {
        const f = props.filter.toLowerCase()
        const chromeTab = t.chromeTab
        if (chromeTab && .
        title &&
      .
        title.toLowerCase().indexOf(f) >= 0
      )
        {
          return true
        }
        if (chromeTab && .
        url &&
      .
        url.indexOf(f) >= 0
      )
        {
          return true
        }
        if (t.name && t.name.toLowerCase().indexOf(f) >= 0) {
          return true
        }
        return false
      }

      return true//!t.pinned && t.groupId === -1
    })
}

const hideMessage = (ident: string) => useUiStore().hideInfoMessage(ident)


</script>
