<template>

  <div class="q-gutter-md row items-start fit">
    <q-select dense standout filled autofocus
              :placeholder="inputPlaceholder()"
              class="fit q-mx-md"
              color="primary"
              :bg-color="props.fromPanel ? 'white' : ''"
              label-color="primary"
              :model-value="search"
              ref="searchBox"
              hide-dropdown-icon
              @update:model-value="val => updateSearch( val)"
              @keydown.enter.prevent="submitSearch()"
              use-input
              :options="options"
              @filter="filterFn">

      <template v-slot:no-option>
        <q-item>
          <q-item-section class="text-grey">
            No results
          </q-item-section>
        </q-item>
        <q-item>
          <q-item-section class="text-grey">
            Mark hits in documents
          </q-item-section>
        </q-item>
      </template>

      <template v-slot:prepend>
        <q-icon v-if="highlight" name="flashlight_on"/>
        <q-icon v-else-if="!searchStore.term" name="search"/>
        <q-icon v-else name="clear" class="cursor-pointer" color="grey" size="12px" @click="clearSearch"/>
      </template>

      <template v-slot:append>
        <q-avatar v-if="searchStore.term && route.fullPath === '/sidepanel'">
          <q-icon name="o_filter_alt" size="18px"
                  :color="(useUiStore().tabsFilter) ? 'red':'black'"
                  class="cursor-pointer" @click="filterNotSearch()"/>
          <q-tooltip v-if="useUiStore().tabsFilter"
                     class="tooltip">Click again to remove filter</q-tooltip>
          <q-tooltip v-else
            class="tooltip">Filter for '{{searchStore.term}}' instead of searching</q-tooltip>
        </q-avatar>
      </template>

      <template v-slot:option="scope">
        <q-item v-bind="scope.itemProps" class="bg-grey-2">
          <q-item-section avatar>
            <q-icon v-if="scope.opt.id === 'highlight'" name="flashlight_on" color="black"/>
            <q-icon v-else-if="scope.opt.id.startsWith('tabset|')" name="o_tab" color="black"/>
            <q-img v-else :src="scope.opt.favIconUrl"/>
          </q-item-section>
          <q-item-section>
            <q-item-label v-if="scope.opt.id === 'highlight'" class="text-subtitle2">highlight in page
            </q-item-label>
            <q-item-label v-else-if="scope.opt.id.startsWith('tabset|')" class="text-subtitle2">
              {{ tabsetName(scope.opt.id) }}
            </q-item-label>
            <q-item-label v-else class="text-subtitle2">{{ scope.opt.title }}</q-item-label>

            <q-item-label caption class="text-blue-8">{{ scope.opt.url }}</q-item-label>
            <q-rating v-if="scope.opt.id !== 'highlight' && !scope.opt.id.startsWith('tabset|')"
                      :model-value="Math.round(scope.opt.score / 18)"
                      size="13px"
                      color="warning"
                      readonly
            />
          </q-item-section>
        </q-item>
      </template>

    </q-select>
  </div>


</template>

<script lang="ts" setup>
import {onMounted, onUnmounted, ref, watch, watchEffect} from "vue";
import {useSearchStore} from "src/stores/searchStore";
import {Hit} from "src/models/Hit";
import {useRoute, useRouter} from "vue-router";
import NavigationService from "src/services/NavigationService";
import {SearchIndexQuery} from "src/domain/queries/SearchIndexQuery";
import {useQueryExecutor} from "src/services/QueryExecutor";
import {useUiStore} from "src/stores/uiStore";
import JsUtils from "src/utils/JsUtils";
import {useCommandExecutor} from "src/services/CommandExecutor";
import {SelectTabsetCommand} from "src/domain/tabsets/SelectTabset";

const props = defineProps({
  fromPanel: {type: Boolean, default: false},
  searchTerm: {type: String, default: ''},
  searchHits: {type: Number, required: false}
})

const searchStore = useSearchStore()
const search = ref(props.searchTerm)
const theHits = ref<Hit[]>([])
const moreHits = ref<boolean>(false)
const router = useRouter()
const route = useRoute()
const typedOrSelected = ref<any>()
const searchBox = ref(null)
const highlight = ref<string | undefined>(undefined)

watchEffect(() => {
  console.log("search", search.value)
})

function submitSearch() {
  setTimeout(() => {
    console.log("submitting search", searchStore, typedOrSelected.value)
    if (searchStore.term === '') {
      searchStore.term = typedOrSelected.value
    }
    if (props.fromPanel) {
      if (route.fullPath === '/sidepanel/search') {
        //router.go(0)
      } else {
        router.push("/sidepanel/search")
      }
    } else {
      if (route.path === "/search") {
        runSearch(searchStore.term)
      } else {
        router.push("/search")
      }
    }
  }, 200)

}

const options = ref<Hit[]>([])

const runSearch = (term: string) => {
  if (term && term.trim().length > 2) {
    searchStore.term = term
    useQueryExecutor()
      .queryFromUi(new SearchIndexQuery(term))
      .then(res => {
        console.log("search res", res)
        theHits.value = res.result.hits
        moreHits.value = res.result.moreHits
      })
  }
}

const filterFn = (val: string, update: any, abort: any) => {
  console.log("filterFn", val)
  search.value = ''
  if (val === '/') {
    //search.value = ""
    return
  }
  runSearch(val)
  highlight.value = undefined
  useUiStore().highlightTerm = undefined

  setTimeout(() => {
    update(() => {
      //options.value = moreHits ? theHits.value.concat(new Hit()) : theHits.value
      let tabsetsAsHit: Hit[] = []
      //console.log("tabsetsAsHit", tabsetsAsHit)
      options.value = tabsetsAsHit
      options.value = options.value.concat(theHits.value)
      //console.log("options", options.value, typeof options.value)
      // if (options.value) {
      //   const pseudoHit = new Hit("highlight", "title", "", "", 0, 0, 0, [], [], [], "", "")
      //   pseudoHit.name = val
      //   options.value = options.value.concat(pseudoHit)
      // }
    })
  }, 100)
}

const updateSearch = (val: any) => {
  if (val === null) {
    search.value = ''
  }
  typedOrSelected.value = val
  console.log("updateSearch", typedOrSelected.value)
  if (val?.chromeTab) {
    searchStore.term = ''
    NavigationService.openOrCreateTab([val.url])
  } else if (val?.id === "highlight") {
    console.log("setting highlight", val.name)
    highlight.value = val.name
    useUiStore().setHighlightTerm(val.name)
    JsUtils.runCssHighlight()
  } else if (val && val.id?.startsWith('tabset|')) {
    const tsId = val.tabsets[0]
    console.log("got tsid", tsId)
    if (tsId) {
      useCommandExecutor()
        .execute(new SelectTabsetCommand(tsId, val.spaces[0] || undefined))
    }
  }
}

const inputPlaceholder = () => {
  if (highlight.value) {
    return highlight.value
  }
  // if (Math.random() < 0.1) {
  //   return "use the key '/' for quick access to search"
  // }
  if (props.searchHits && props.searchHits > 0) {
    return `Found ${props.searchTerm} ${props.searchHits} time(s)`
  }
  return `Search in all tabs and bookmarks`
}

const clearSearch = () => {
  searchStore.term = ''
  typedOrSelected.value = null
}

const tabsetName = (id: string) => id.split('|')[1] || '???'

const filterNotSearch = () => {
  console.log("filtering1", searchStore.term, useUiStore().tabsFilter)
  if (useUiStore().tabsFilter) {
    useUiStore().tabsFilter = undefined
    useUiStore().setHighlightTerm(undefined)
    JsUtils.runCssHighlight()
  } else{
    const useValue = searchStore.term && searchStore.term.trim().length > 0 ? searchStore.term.trim() : undefined
    useUiStore().tabsFilter = useValue
    useUiStore().setHighlightTerm(useValue)
    JsUtils.runCssHighlight()
  }

}

</script>
