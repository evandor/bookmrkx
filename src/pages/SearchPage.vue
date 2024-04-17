<template>


  <q-toolbar class="text-primary lightgrey">
    <div class="row fit">
      <div class="col-xs-12 col-md-5">
        <q-toolbar-title>
          <div class="row justify-start items-baseline">
            <div><span class="text-dark">Search Results for '{{
                searchStore.term
              }}': {{ tabsetHits.length }} hit(s)</span>
            </div>
            <!--              <div class="text-caption q-mb-md">Not happy with the search results? Try <span-->
            <!--                class="text-blue-9 cursor-pointer" @click="showReindexDialog = true"><u>re-indexing</u></span>.-->
            <!--              </div>-->
          </div>
        </q-toolbar-title>
      </div>
      <div class="col-xs-12 col-md-7 text-right">

<!--        <q-btn-->
<!--          flat dense icon="restore_page"-->
<!--          color="green" :label="$q.screen.gt.sm ? 'Search with browser...' : ''"-->
<!--          class="q-mr-md"-->
<!--          @click="searchWithBrowser">-->
<!--          <q-tooltip>Use your browsers default search provider to search for {{ searchStore.term }}</q-tooltip>-->
<!--        </q-btn>-->

      </div>
    </div>
  </q-toolbar>

  <div class="row fit greyBorderTop"></div>

  <InfoMessageWidget
    :probability="1"
    ident="searchPage_info"
    hint="Please note that only pages you've visted with Tabsets already active are contained in the search index."/>


  <div class="row">
    <div class="col-8 q-ma-md">
      <template v-for="hit in tabsetHits">
        <q-list>
          <SearchHit :hit="hit"/>
        </q-list>
      </template>

    </div>
    <div class="col-4 q-ma-md">

    </div>
  </div>

</template>

<script setup lang="ts">
import {ref, watchEffect} from 'vue';
import {useRoute} from "vue-router";
import _ from "lodash"
import {useSearchStore} from "src/stores/searchStore";
import {uid, useQuasar} from "quasar";
import SearchHit from "src/components/layouts/SearchHit.vue"
import {Hit} from "src/models/Hit";
import ReindexDialog from "components/dialogues/ReindexDialog.vue";
import {usePermissionsStore} from "src/stores/permissionsStore";
import {useCommandExecutor} from "src/services/CommandExecutor";
import {GrantPermissionCommand} from "src/domain/commands/GrantPermissionCommand";
import InfoMessageWidget from "components/widgets/InfoMessageWidget.vue";

const route = useRoute()
const searchStore = useSearchStore()

const termFromParams = route.query.t as string

const $q = useQuasar()
const tabsetHits = ref<Hit[]>([])
const showReindexDialog = ref(false)

const newSearch = (term: string) => {
  tabsetHits.value = []

  if (term && term.trim() !== '') {
    const results = searchStore.search(term)
    _.forEach(results, h => {
      //console.log("h", h.item.bookmarkId)
      const theHit = new Hit(
        uid(),
        //ChromeApi.createChromeTabObject(h.item.title, h.item.url, h.item.favIconUrl),
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
  }
}

//console.log("termFromParams", termFromParams, route.query)
watchEffect(() => {
  if (termFromParams && termFromParams.trim() !== '') {
    console.log("setting search term from params", termFromParams)
    searchStore.term = termFromParams
  }
})

watchEffect(() => {
  // console.log("watch effect: searchStore.term", searchStore.term)
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

const bookmarksEnabled = () => usePermissionsStore().hasPermission('bookmarks')
const grant = (permission: string) => useCommandExecutor().executeFromUi(new GrantPermissionCommand(permission))

</script>
