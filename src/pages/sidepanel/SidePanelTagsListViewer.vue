<template>

  <q-page style="padding-top: 50px">

    <div class="q-mt-md q-ma-none q-pa-none">
      <InfoMessageWidget
          :probability="1"
          ident="sidePanelTagsListViewer_overview"
          hint="Tabs you add are being tagged automatically (or you can tag them
            yourself). This is a list of the most used tags."/>
    </div>

    <div class="row q-ma-none q-pa-none">
      <div class="col-12 q-ma-none q-pa-none q-pt-sm">
      </div>
    </div>

    <!-- place QPageSticky at end of page -->
    <q-page-sticky expand position="top" class="darkInDarkMode brightInBrightMode">

      <FirstToolbarHelper title="Tags List">
        <template v-slot:iconsRight>

          <SidePanelToolbarTabNavigationHelper/>
          <CloseSidePanelViewButton />
        </template>
      </FirstToolbarHelper>

    </q-page-sticky>

  </q-page>

</template>

<script lang="ts" setup>

import {useNotificationHandler} from "src/services/ErrorHandler";
import {SidePanelView, useUiStore} from "src/stores/uiStore";
import FirstToolbarHelper from "pages/sidepanel/helper/FirstToolbarHelper.vue";
import InfoMessageWidget from "components/widgets/InfoMessageWidget.vue";
import SidePanelToolbarTabNavigationHelper from "pages/sidepanel/helper/SidePanelToolbarTabNavigationHelper.vue";
import CloseSidePanelViewButton from "components/buttons/CloseSidePanelViewButton.vue";

const {handleError} = useNotificationHandler()

const selectTag = (tag: string) => {
  console.log("selecting", tag)
  useUiStore().setSelectedTag(tag)
  // router.push("/sidepanel/tags")
  useUiStore().sidePanelSetActiveView(SidePanelView.TAG)
}

</script>
