<template>

  <q-page style="padding-top: 50px">

    <div class="row q-ma-none q-pa-none">
      <div class="col-12 q-ma-none q-pa-none q-pt-sm">

        <template v-for="hit in tabsetHits">
          <q-list>
            <SearchHit :hit="hit"/>
          </q-list>
        </template>

      </div>
    </div>


    <!-- place QPageSticky at end of page -->
    <q-page-sticky expand position="top" class="darkInDarkMode brightInBrightMode">

      <FirstToolbarHelper :title="useUiStore().selectedTag + ' (Tags List)'">

        <template v-slot:iconsRight>
          <SidePanelToolbarTabNavigationHelper/>
          <CloseSidePanelViewButton />
        </template>

      </FirstToolbarHelper>

    </q-page-sticky>

  </q-page>

</template>

<script setup lang="ts">
import {onMounted, ref, watchEffect} from 'vue';
import {useRoute, useRouter} from "vue-router";
import {useTabsStore} from "src/stores/tabsStore";
import _ from "lodash"
import {useSearchStore} from "src/stores/searchStore";
import {Tabset} from "src/models/Tabset";
import {uid, useQuasar} from "quasar";
import SearchHit from "src/components/layouts/SearchHit.vue"
import {Hit} from "src/models/Hit";
import ReindexDialog from "components/dialogues/ReindexDialog.vue";
import {usePermissionsStore} from "src/stores/permissionsStore";
import {useCommandExecutor} from "src/services/CommandExecutor";
import {GrantPermissionCommand} from "src/domain/commands/GrantPermissionCommand";
import {useUiStore} from "src/stores/uiStore";
import {Tab} from "src/models/Tab";
import {useTabsetService} from "src/services/TabsetService2";
import FirstToolbarHelper from "pages/sidepanel/helper/FirstToolbarHelper.vue";
import Analytics from "src/utils/google-analytics";
import SidePanelToolbarTabNavigationHelper from "pages/sidepanel/helper/SidePanelToolbarTabNavigationHelper.vue";
import CloseSidePanelViewButton from "components/buttons/CloseSidePanelViewButton.vue";

const route = useRoute()
const tabsStore = useTabsStore()
const searchStore = useSearchStore()

const router = useRouter()

const $q = useQuasar()
const tabsetHits = ref<Hit[]>([])
const showReindexDialog = ref(false)

onMounted(() => {
  Analytics.firePageViewEvent('SidePanelTagsPage', document.location.href);
})

const newSearch = (term: string) => {
  tabsetHits.value = []

  if (term && term.trim() !== '') {
    const results: Tab[] = []

    _.forEach([...tabsStore.tabsets.values()], (tabset: Tabset) => {
      _.forEach(tabset.tabs, (tab: Tab) => {
        if (tab.tags?.indexOf(term) >= 0) {
          console.log("found tab", term, tab.tags)
          results.push(tab)
        }
      })
    })

    _.forEach(results, h => {
      //console.log("h", h.item.bookmarkId)
      let tabsets: string[] = []
      if (h.url) {
        tabsets = useTabsetService().tabsetsFor(h.url)
      }
      const theHit = new Hit(
          uid(),
          //       h.chromeTab,
          h.title || '',
          h.url || '',
          h.favIconUrl || '',
          0, 0,
          100,
          tabsets, //h.chromeTab.tabsets,
          [],
          _.map(h['matches' as keyof object], (m: any) => {
            return {
              key: m['key' as keyof object],
              indices: m['indices' as keyof object]
            }
          }),
          h.description,
          h.keywords
      )
      if (h.bookmarkId) {
        theHit.bookmarkId = h.bookmarkId
      }
      tabsetHits.value.push(theHit)
    })
  }
}

watchEffect(() => {
  const tag = useUiStore().selectedTag
  if (tag && tag.trim() !== '') {
    newSearch(tag)
  }
})

watchEffect(() => {
  if (showReindexDialog.value) {
    $q.dialog({
      component: ReindexDialog
    }).onDismiss(() => {
      showReindexDialog.value = false
    })
  }
})

</script>
