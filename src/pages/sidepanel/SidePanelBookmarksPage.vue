<template>

  <q-page padding style="padding-top: 34px">

    <div class="q-ma-none">
      <div class="q-ma-none">
        <div class="row q-ma-none q-pa-none">
          <div class="col-12 q-ma-none q-pa-none q-pt-md">
            <BookmarksTree
              :nodes="showOnlyFolders ? useBookmarksStore().nonLeafNodes : useBookmarksStore().bookmarksNodes2"
              @toggle-show-only-folders="toggleShowOnlyFolders()"
              :in-side-panel="true"/>
          </div>
        </div>
      </div>
    </div>

    <!-- place QPageSticky at end of page -->
    <q-page-sticky expand position="top" class="darkInDarkMode brightInBrightMode">
      <FirstToolbarHelper title="Bookmrkx Sidepanel">

        <template v-slot:iconsRight>

          <SidePanelToolbarTabNavigationHelper />

<!--          <SidePanelToolbarButton-->
<!--              icon="close"-->
<!--              tooltip="Close this view"-->
<!--              @click="useUiStore().sidePanelSetActiveView(SidePanelView.MAIN)"-->
<!--              color="black" />-->
        </template>

      </FirstToolbarHelper>
    </q-page-sticky>

  </q-page>

</template>

<script lang="ts" setup>

import BookmarksTree from "components/BookmarksTree.vue";
import FirstToolbarHelper from "pages/sidepanel/helper/FirstToolbarHelper.vue";
import {onMounted, ref} from "vue";
import Analytics from "src/utils/google-analytics";
import SidePanelToolbarTabNavigationHelper from "pages/sidepanel/helper/SidePanelToolbarTabNavigationHelper.vue";
import {useBookmarksStore} from "stores/bookmarksStore";

const showOnlyFolders = ref(true)

onMounted(() => {
  Analytics.firePageViewEvent('SidePanelBookmarksPage', document.location.href);
})

const toggleShowOnlyFolders = () => {
  console.log("****")
  showOnlyFolders.value = !showOnlyFolders.value
}

</script>
