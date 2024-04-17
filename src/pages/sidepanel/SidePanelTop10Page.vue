<template>

  <q-page style="padding-top: 50px">

    <div class="q-mt-md q-ma-none q-pa-none">
      <InfoMessageWidget
        :probability="1"
        ident="sidePanelTop10Page_overview">
        This is the <b>top 10 list</b> of your most often accessed tabs
      </InfoMessageWidget>
    </div>

    <div class="row q-ma-lg fit items-center justify-center" v-if="loading">
      <q-spinner-dots
        color="primary"
        size="2em"
      />
    </div>

    <div v-if="!loading" class="row q-ma-none q-pa-none">
      <div class="col-12 q-ma-none q-pa-none">

        <q-list separator class="q-ma-none">
          <q-item v-for="tab in top10"
                  clickable
                  v-ripple
                  class="q-ma-none q-pa-sm">

            <PanelTabListElementWidget
              :header="'accessed ' + (tab.activatedCount !== 1) ?   tab.activatedCount + ' times' : tab.activatedCount + ' time'"
              :tab="tab"/>

          </q-item>
        </q-list>

      </div>
    </div>

    <!-- place QPageSticky at end of page -->
    <q-page-sticky expand position="top" class="darkInDarkMode brightInBrightMode">

      <FirstToolbarHelper title="'Top 10' Tabs">

        <template v-slot:iconsRight>
          <SidePanelToolbarTabNavigationHelper/>
          <CloseSidePanelViewButton/>
        </template>

      </FirstToolbarHelper>

    </q-page-sticky>

  </q-page>

</template>

<script lang="ts" setup>

import {SidePanelView, useUiStore} from "stores/uiStore";
import {useTabsStore} from "stores/tabsStore";
import _ from "lodash"
import {Tabset} from "src/models/Tabset";
import {Tab} from "src/models/Tab";
import PanelTabListElementWidget from "components/widgets/PanelTabListElementWidget.vue";
import FirstToolbarHelper from "pages/sidepanel/helper/FirstToolbarHelper.vue";
import SecondToolbarHelper from "pages/sidepanel/helper/SecondToolbarHelper.vue";
import InfoMessageWidget from "components/widgets/InfoMessageWidget.vue";
import {onMounted, ref, watchEffect} from "vue";
import Analytics from "src/utils/google-analytics";
import SidePanelToolbarTabNavigationHelper from "pages/sidepanel/helper/SidePanelToolbarTabNavigationHelper.vue";
import CloseSidePanelViewButton from "components/buttons/CloseSidePanelViewButton.vue";

const tabsStore = useTabsStore()

const top10 = ref<Tab[]>([])
const loading = ref(true)

onMounted(() => {
  Analytics.firePageViewEvent('SidePanelTop10Page', document.location.href);
})

// https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers
// https://medium.com/@adamorlowskipoland/outside-main-thread-heavy-task-calculations-in-vue-25a600350db9
//const bgCalc = new Worker("../background-calc-worker.js", { type: "module" });
//console.log("bgCalc", bgCalc)

watchEffect(() => {
  loading.value = true
  setTimeout(() => {
    top10.value = _.orderBy(
      _.flatMap([...tabsStore.tabsets.values()] as Tabset[],
        (tabset: Tabset) =>
          _.flatMap(tabset.tabs)),
      (t: Tab) => t.activatedCount, "desc")
    loading.value = false
  }, 500)
})

</script>
