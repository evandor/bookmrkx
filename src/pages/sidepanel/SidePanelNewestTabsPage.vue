<template>

  <q-page style="padding-top: 50px">

    <div class="q-mt-md q-ma-none q-pa-none">
      <InfoMessageWidget
        :probability="1"
        ident="sidePanelNewestTabsPage_overview"
        hint="Here you can check the 100 newest of your tabs sorted by creation date."/>
    </div>

    <div class="row q-ma-none q-pa-none">
      <div class="col-12 q-ma-none q-pa-none">

        <q-list class="q-ma-none">
          <q-item v-for="tab in newestTabs()"
                  clickable
                  v-ripple
                  class="q-ma-none q-pa-sm">

            <PanelTabListElementWidget
              :header="'created ' + formatDate(tab.created)"
              :tab="tab"/>

          </q-item>
        </q-list>

      </div>
    </div>

    <!-- place QPageSticky at end of page -->
    <q-page-sticky expand position="top" class="darkInDarkMode brightInBrightMode">

      <FirstToolbarHelper title="Newest Tabs">

        <template v-slot:iconsRight>
          <SidePanelToolbarTabNavigationHelper/>
          <CloseSidePanelViewButton />
        </template>

      </FirstToolbarHelper>

    </q-page-sticky>

  </q-page>


</template>

<script lang="ts" setup>

import {useTabsStore} from "stores/tabsStore";
import _ from "lodash"
import {Tabset} from "src/models/Tabset";
import {Tab} from "src/models/Tab";
import PanelTabListElementWidget from "components/widgets/PanelTabListElementWidget.vue";
import {formatDistance} from "date-fns";
import FirstToolbarHelper from "pages/sidepanel/helper/FirstToolbarHelper.vue";
import InfoMessageWidget from "components/widgets/InfoMessageWidget.vue";
import {onMounted} from "vue";
import Analytics from "src/utils/google-analytics";
import SidePanelToolbarTabNavigationHelper from "pages/sidepanel/helper/SidePanelToolbarTabNavigationHelper.vue";
import CloseSidePanelViewButton from "components/buttons/CloseSidePanelViewButton.vue";

const tabsStore = useTabsStore()

onMounted(() => {
  Analytics.firePageViewEvent('SidePanelNewestTabsPage', document.location.href);
})

const newestTabs = ():Tab[] =>
  _.take(_.orderBy(
    _.flatMap([...tabsStore.tabsets.values()] as Tabset[],
      (tabset: Tabset) =>
        _.flatMap(tabset.tabs)),
    (t: Tab) => t.created, "desc"), 100)

const formatDate = (timestamp: number | undefined) =>
  timestamp ? formatDistance(timestamp, new Date(), {addSuffix: true}) : "?"

</script>
