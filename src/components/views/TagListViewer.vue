<template>
  <div class="q-ma-none" style="height:100%;max-width:100%">
    <q-scroll-area style="height: 100%">

      <template v-for="hit in tabsetHits">
        <q-list>
          <SearchHit :hit="hit"/>
        </q-list>
      </template>

    </q-scroll-area>
  </div>
</template>

<script setup lang="ts">

import {uid, useQuasar} from "quasar";
import {onMounted, ref, watchEffect} from "vue";
import {Hit} from "src/models/Hit";
import Analytics from "src/utils/google-analytics";
import {Tab} from "src/models/Tab";
import _ from "lodash";
import {Tabset} from "src/models/Tabset";
import {useUiStore} from "stores/uiStore";
import SearchHit from "components/layouts/SearchHit.vue";


const $q = useQuasar()
const tabsetHits = ref<Hit[]>([])
const showReindexDialog = ref(false)

onMounted(() => {
  Analytics.firePageViewEvent('TagListViewer', document.location.href);
})

const newSearch = (term: string) => {
  tabsetHits.value = []

}

watchEffect(() => {
  const tag = useUiStore().selectedTag
  if (tag && tag.trim() !== '') {
    newSearch(tag)
  }
})

</script>
