<template>

  <q-page padding style="padding-top: 34px">

    <div class="q-ma-none">
      <div class="q-ma-none">
        <div class="row q-ma-none q-pa-none">
          <div class="col-12 q-ma-none q-pa-none q-pt-md">

            <SidePanelOpenTabsListViewer />

          </div>
        </div>
      </div>
    </div>

    <!-- place QPageSticky at end of page -->
    <q-page-sticky expand position="top" class="darkInDarkMode brightInBrightMode">
      <FirstToolbarHelper title="Open Tabs">

        <template v-slot:iconsRight>

          <SidePanelToolbarTabNavigationHelper />

          <SidePanelToolbarButton
              icon="close"
              tooltip="Close this view"
              @click="useUiStore().sidePanelSetActiveView(SidePanelView.MAIN)"
              color="black" />
        </template>

      </FirstToolbarHelper>
    </q-page-sticky>

  </q-page>

</template>

<script lang="ts" setup>

import BookmarksTree from "components/BookmarksTree.vue";
import FirstToolbarHelper from "pages/sidepanel/helper/FirstToolbarHelper.vue";
import {SidePanelView, useUiStore} from "stores/uiStore";
import {onMounted} from "vue";
import Analytics from "src/utils/google-analytics";
import ToolbarButton from "components/buttons/SidePanelToolbarButton.vue";
import SidePanelToolbarTabNavigationHelper from "pages/sidepanel/helper/SidePanelToolbarTabNavigationHelper.vue";
import SidePanelToolbarButton from "components/buttons/SidePanelToolbarButton.vue";
import {useTabsetService} from "src/services/TabsetService2";
import {uid} from "quasar";
import SidePanelOpenTabsListViewer from "pages/sidepanel/SidePanelOpenTabsListViewer.vue";

onMounted(() => {
  Analytics.firePageViewEvent('SidePanelBookmarksPage', document.location.href);
})

// const onMessageListener = async (message: any, sender: any, sendResponse: any) => {
//   console.log(" <<< received message", message)
//   if (message.name === "sidepanel-switch-view") {
//     // const tsId = message.data.changedTabsetId
//     // await useTabsetService().reloadTabset(tsId)
//     // console.log("tsId", tsId)
//     // sortedSpaces.value = getSortedSpaces()
//     // tabsetsForSpaces.value = await getTabsetsForSpaces()
//     // randomKey.value = uid()
//     // //console.log("tabsetsForSpace", tabsetsForSpaces.value)
//   }
// }

</script>
