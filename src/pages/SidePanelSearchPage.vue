<template>

  <q-page style="padding-top: 50px">


    <div class="row q-ma-none q-pa-none">
      <div class="col-12 q-ma-none q-pa-none">

        <q-list class="q-ma-none">

          <template v-for="hit in tabsetHits" v-if="tabsetHits.length > 0">
            <SearchHit :hit="hit" :in-side-panel="true"/>
          </template>

          <template v-else>
            <div class="q-pa-md row items-start q-gutter-md fit">
              <q-card class="my-card fit">
                <q-card-section class="text-caption">
                  No Hits, please start typing or refine your search
                </q-card-section>
              </q-card>
            </div>
          </template>
        </q-list>

      </div>
    </div>

    <!-- place QPageSticky at end of page -->
    <q-page-sticky expand position="top" class="darkInDarkMode brightInBrightMode">

      <FirstToolbarHelper
          :show-search-box="true"
          :search-term="searchStore.term"
          :search-hits="tabsetHits.length"
          :title="'Found ' + searchStore.term + ' ' + tabsetHits.length + ' time(s)'">
        <template v-slot:iconsRight>
          <CloseSidePanelViewButton />
        </template>
      </FirstToolbarHelper>

    </q-page-sticky>

  </q-page>

</template>

<script setup lang="ts">
import {onMounted, ref, watchEffect} from 'vue';
import {useRoute} from "vue-router";
import _ from "lodash"
import {useSearchStore} from "src/stores/searchStore";
import {uid, useQuasar} from "quasar";
import SearchHit from "src/components/layouts/SearchHit.vue"
import {Hit} from "src/models/Hit";
import ReindexDialog from "components/dialogues/ReindexDialog.vue";
import FirstToolbarHelper from "pages/sidepanel/helper/FirstToolbarHelper.vue";
import Analytics from "src/utils/google-analytics";
import CloseSidePanelViewButton from "components/buttons/CloseSidePanelViewButton.vue";

const route = useRoute()
const searchStore = useSearchStore()

const termFromParams = route.query.t as string

const $q = useQuasar()
const tabsetHits = ref<Hit[]>([])
const showReindexDialog = ref(false)
const tabsetIdents = ref<object[]>([])

onMounted(() => {
  Analytics.firePageViewEvent('SidePanelSearchPage', document.location.href);
})

const newSearch = (term: string) => {
  tabsetHits.value = []

  if (term && term.trim() !== '') {

    // tabsets' names hits
    tabsetIdents.value.forEach((tabsetIdent:any) => {
      const name = tabsetIdent['name' as keyof object]
      const id = tabsetIdent['id' as keyof object]
      if (name.toLowerCase().indexOf(term.toLowerCase()) >= 0) {
        const pseudoHit = new Hit("tabset|" + name,
            name, '', '',
            0, 0, 0, [id], [], [], "", "")
        tabsetHits.value.push(pseudoHit)
      }
    })

    const results = searchStore.search(term)
    _.forEach(results, h => {
      //console.log("h", h.item.bookmarkId)
      const theHit = new Hit(
          uid(),
          //       ChromeApi.createChromeTabObject(h.item.title, h.item.url, h.item.favIconUrl),
          h.item.title,
          h.item.url,
          h.item.favIconUrl,
          0, 0,
          Math.round(100 - (100 * (h?.score || 1))),
          h.item.tabsets,
          [],
          _.map(h['matches' as keyof object], (m: any) => {
            return {
              key: m['key' as keyof object],
              indices: m['indices' as keyof object]
            }
          }),
          h.item.description,
          h.item.keywords
      )
      if (h.item.bookmarkId) {
        theHit.bookmarkId = h.item.bookmarkId
      }
      tabsetHits.value.push(theHit)
    })

    //console.log("added hits", tabsetHits.value)
  }
}

//console.log("termFromParams", termFromParams, route.query)
watchEffect(() => {
  if (termFromParams && termFromParams.trim() !== '') {
    // console.log("setting search term from params", termFromParams)
    searchStore.term = termFromParams
  }
})

watchEffect(() => {
  //console.log("watch effect: searchStore.term", searchStore.term)
  if (searchStore.term?.trim() !== '') {
    newSearch(searchStore.term)
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
