<template>

  <!-- toolbar -->
  <q-toolbar class="text-primary lightgrey">
    <div class="row fit">
      <div class="col-xs-12 col-md-7">
        <q-toolbar-title>
          <div class="row justify-start items-baseline">
            <div class="col-12">
                <span class="text-primary">
                  <q-icon name="article" /> Reading Mode
                </span>
            </div>
          </div>
        </q-toolbar-title>
      </div>
      <div class="col-xs-12 col-md-5 text-right">

        <q-btn
          flat dense icon="open_in_new"
          color="primary"
          :label="$q.screen.gt.lg ? 'Open Original Page' : ''"
          class="q-mr-sm"
          @click="NavigationService.openOrCreateTab([tab?.url || ''])">
          <q-tooltip>Open Original Page</q-tooltip>
        </q-btn>

<!--        <q-btn-->
<!--          flat dense icon="o_add"-->
<!--          color="primary" :label="$q.screen.gt.lg ? 'Add Folder...' : ''"-->
<!--          class="q-mr-md"-->
<!--          @click="addUrlDialog">-->
<!--          <q-tooltip>Create a new Bookmark Folder</q-tooltip>-->
<!--        </q-btn>-->

<!--        <q-btn-->
<!--          flat dense icon="delete_outline"-->
<!--          color="negative" :label="$q.screen.gt.lg ? 'Delete Folder...' : ''"-->
<!--          class="q-mr-md"-->
<!--          @click="deleteBookmarkFolder">-->
<!--          <q-tooltip>Delete this Bookmark Folder</q-tooltip>-->
<!--        </q-btn>-->

      </div>
    </div>
  </q-toolbar>


  <div class="row justify-center items-center" style="max-width: 600px;margin-left:auto;margin-right:auto">
    <div class="col-12 text-h5 q-ma-lg q-pa-sm">
      {{ title }}
    </div>
    <div class="col-12 text-h6 q-mx-lg q-pa-sm">
      {{ excerpt }}
    </div>
    <div class="col-12 text-caption q-mx-lg q-pa-sm">
      {{ siteName }}
    </div>
    <div class="col-12 text-caption q-mx-lg q-pa-sm">
      {{ byline }}
    </div>
    <div class="col-12 q-mx-lg q-pa-sm" v-html="content"></div>
  </div>
</template>

<script lang="ts" setup>

import {useRoute} from "vue-router";
import {useTabsStore} from "stores/tabsStore";
import {onMounted, ref, watchEffect} from "vue";
import {Tab} from "src/models/Tab";
import {Readability} from "@mozilla/readability";
import {useUtils} from "src/services/Utils";
import NavigationService from "src/services/NavigationService";
import Analytics from "src/utils/google-analytics";
import {useQuasar} from "quasar";

const {sanitizeAsText} = useUtils()

const $q = useQuasar()
const route = useRoute()

const tabId = route.params.tabId as string

//const tab = ref(useTabsStore().getTab(tabId))
const tab = ref<Tab>()
const title = ref('')
const excerpt = ref('')
const content = ref('')
const byline = ref('')
const siteName = ref('')

onMounted(() => {
  Analytics.firePageViewEvent('MainPanelReadingModePage', document.location.href);
})


watchEffect(async () => {
  const res = useTabsStore().getTabAndTabsetId(tabId)
  if (res && res.tab) {
    tab.value = res.tab
    const response = await fetch(tab.value.url || '')
    const s = await response.text()
    const parser = new DOMParser();
    const doc = parser.parseFromString(s, "text/html");
    const article = new Readability(doc).parse() || {};

    title.value =  sanitizeAsText(article['title' as keyof object])
    excerpt.value =  sanitizeAsText(article['excerpt' as keyof object])
    content.value =  sanitizeAsText(article['content' as keyof object])
    byline.value =  sanitizeAsText(article['byline' as keyof object])
    siteName.value =  sanitizeAsText(article['siteName' as keyof object])
  }
})

</script>
