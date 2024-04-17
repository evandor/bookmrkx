<template>

  <q-page padding style="padding-top: 45px">

    <div class="q-ma-none">

      <div class="q-ma-none">
        <div class="row q-ma-none q-pa-none">
          <div class="col-12 q-ma-none q-pa-none q-pt-lg">

            <div
              class="col-12 q-pa-xs items-center justify-center"
              v-for="rssTab in rssTabs">

              <q-card flat @click="open(rssTab)">
                <q-card-section class="q-pt-xs cursor-pointer">
                  <div class="row items-baseline">
                    <div class="col-2">
                      <TabFaviconWidget :tab="rssTab" width="20px" height="20px" />
                    </div>
                    <div class="col-9 text-body2 ellipsis">
                      {{ rssTab.title }}
                    </div>
                    <div class="col-1">
                      <q-icon name="close"/>
                    </div>
                  </div>

                </q-card-section>
              </q-card>
            </div>

          </div>
        </div>

      </div>

    </div>

    <!-- place QPageSticky at end of page -->
    <q-page-sticky expand position="top" class="darkInDarkMode brightInBrightMode">
      <FirstToolbarHelper title="RSS Feeds" :show-back-button="true"/>
    </q-page-sticky>

  </q-page>

</template>

<script lang="ts" setup>

import {onMounted, ref, watchEffect} from "vue";
import {Tabset, TabsetStatus, TabsetType} from "src/models/Tabset";
import {useRouter} from "vue-router";
import {useQuasar} from "quasar";
import {useTabsStore} from "src/stores/tabsStore";
import {useNotificationHandler} from "src/services/ErrorHandler";
import {useUtils} from "src/services/Utils";
import _ from "lodash"
import {Tab} from "src/models/Tab";
import {SidePanelView, useUiStore} from "src/stores/uiStore";
import {useCommandExecutor} from "src/services/CommandExecutor";
import {CreateDynamicTabset} from "src/domain/commands/CreateDynamicTabset";
import TabFaviconWidget from "components/widgets/TabFaviconWidget.vue";
import PanelTabListElementWidget from "components/widgets/PanelTabListElementWidget.vue";
import FirstToolbarHelper from "pages/sidepanel/helper/FirstToolbarHelper.vue";
import SecondToolbarHelper from "pages/sidepanel/helper/SecondToolbarHelper.vue";
import Analytics from "src/utils/google-analytics";

const {handleError, handleSuccess} = useNotificationHandler()
const {inBexMode} = useUtils()

const router = useRouter()
const tabsStore = useTabsStore()

const tags = ref<Map<string, number>>(new Map())
const $q = useQuasar();
const localStorage = $q.localStorage

const rssTabs = ref<Tab[]>([])

onMounted(() => {
  Analytics.firePageViewEvent('SidePanelRssListViewer', document.location.href);
})


watchEffect(() => rssTabs.value = tabsStore.rssTabs)


const open = (tab: Tab) => {
  if (tab.url) {
    router.push("/sidepanel/rss/" + btoa(tab.url))
  }
}

</script>
