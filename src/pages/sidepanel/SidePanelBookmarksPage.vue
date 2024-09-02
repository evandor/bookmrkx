<template>

  <q-page padding style="padding-top: 34px">

    <div class="q-ma-none">
      <div class="q-ma-none">
        <div class="row q-ma-none q-pa-none">
          <div class="col-12 q-ma-none q-pa-none q-pt-md">

            <BookmarksTree
              :nodes="showOnlyFolders ? useBookmarksStore().nonLeafNodes : useBookmarksStore().bookmarksNodes2"
              :show-only-folders="showOnlyFolders"
              @toggle-show-only-folders="toggleShowOnlyFolders()"
              :in-side-panel="true"/>

          </div>
        </div>
      </div>
    </div>

    <!-- place QPageSticky at end of page -->
    <q-page-sticky expand position="top" class="darkInDarkMode brightInBrightMode">
      <FirstToolbarHelper title="Bookmrkx Sidepanel">

        <template v-slot:iconsRight>&nbsp;</template>

      </FirstToolbarHelper>
    </q-page-sticky>

  </q-page>

</template>

<script lang="ts" setup>

import FirstToolbarHelper from "pages/sidepanel/helper/FirstToolbarHelper.vue";
import {onMounted, ref} from "vue";
import Analytics from "src/core/utils/google-analytics";
import BookmarksTree from "src/bookmarks/components/BookmarksTree.vue";
import {useBookmarksStore} from "src/bookmarks/stores/bookmarksStore";
import {usePermissionsStore} from "stores/permissionsStore";

const showOnlyFolders = ref(true)

onMounted(() => {
  Analytics.firePageViewEvent('SidePanelBookmarksPage', document.location.href);
})

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log(" <<< received message", message)
  // if (inIgnoredMessages(message)) {
  //   return true
  // }
  if (message.name === 'feature-activated') {
    usePermissionsStore().addActivateFeature(message.data.feature)
  }
  else if (message.name === 'feature-deactivated') {
    usePermissionsStore().removeActivateFeature(message.data.feature)
  }
})

const toggleShowOnlyFolders = () => {
  showOnlyFolders.value = !showOnlyFolders.value
}

</script>
