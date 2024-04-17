<template>

  <q-page padding style="padding-top: 45px">

    <div class="q-ma-none">
      <div class="q-ma-none">
        <div class="row q-ma-none q-pa-none">
          <div class="col-12 q-ma-none q-pa-none q-pt-lg">
            <TabsAsTree />
          </div>
        </div>
      </div>
    </div>

    <!-- place QPageSticky at end of page -->
    <q-page-sticky expand position="top" class="darkInDarkMode brightInBrightMode">
      <FirstToolbarHelper title="Tabs As Tree">

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
import TabsAsTree from "components/TabsAsTree.vue";

onMounted(() => {
  Analytics.firePageViewEvent('SidePanelTabsAsTreePage', document.location.href);
})

</script>
