<template>

  <div class="q-ma-none">

    <q-toolbar class="text-primary lightgrey">
      <div class="row fit">
        <q-toolbar-title>
          <div class="row">
            <div class="col-2">
              <q-icon name="chevron_left" class="cursor-pointer" @click="router.push('/sidepanel/rsslist')">
                <q-tooltip>Back</q-tooltip>
              </q-icon>
            </div>
            <div class="col-10">
              {{ rss.title }}
            </div>
            <div class="col-1 text-right">
            </div>
          </div>
        </q-toolbar-title>
      </div>
    </q-toolbar>

    <div class="row q-ma-none q-pa-sm">
      <div class="col-12">


        <div class="row q-mb-lg">
          <div class="col">
            <div class="text-subtitle1">{{ rss.description }}</div>
            <div class="text-caption">Created {{ date.formatDate(rss.published, 'DD.MM.YYYY HH:mm') }}</div>
          </div>
        </div>

        <div class="row q-mb-lg" v-for="entry in rss.entries">
          <div class="col-5 q-pa-xs cursor-pointer">
            <q-img v-if="imageEnclosure(entry)"
                   @click="openInNewTab(entry.link)"
                   :src="imageEnclosure(entry)">
            </q-img>
          </div>
          <div class="col q-pa-xs">
            <div class="text-subtitle2" style="line-height: normal"> {{ entry.title }}</div>
          </div>
          <div class="col-12 q-pa-xs">
            <div class="text-caption"> {{ entry.description }}</div>
            <div class="text-caption text-grey-8"> {{ formatDate(entry.published) }}</div>
            <q-tooltip>this entry was created at
              {{ date.formatDate(entry.published, 'DD.MM.YYYY HH:mm') }}
            </q-tooltip>
          </div>
        </div>


      </div>
    </div>

  </div>

</template>

<script setup lang="ts">
import {onMounted, ref, watchEffect} from 'vue'
import {useRoute, useRouter} from "vue-router";
import {date, useQuasar} from "quasar";
import TabsCanvas from "src/components/layouts/TabsCanvas.vue";
import _ from "lodash"
import {useTabsStore} from "src/stores/tabsStore";
import {Tab} from "src/models/Tab";
import {Tabset, TabsetStatus} from "src/models/Tabset";
import {useSettingsStore} from "src/stores/settingsStore"
import {extract} from "@extractus/feed-extractor";
import NavigationService from "src/services/NavigationService";
import {formatDistance, parseISO} from "date-fns";
import Analytics from "src/utils/google-analytics";

const route = useRoute();
const router = useRouter();
const localStorage = useQuasar().localStorage
const tabsStore = useTabsStore()
const featuresStore = useSettingsStore()

const tabsetname = ref(tabsStore.currentTabsetName)
const filter = ref('')
const $q = useQuasar()

const encodedUrl = ref()
const title = ref()
const rss = ref({})

onMounted(() => {
  Analytics.firePageViewEvent('SidePanelRssPage', document.location.href);
})

const opts = {
  includeEntryContent: true,
  includeOptionalElements: true,
  useISODateFormat: true,
  normalization: true,
  getExtraFeedFields: (feedData: any) => {
    //console.log("feedData", feedData)
    return {
      subtitle: feedData.subtitle || '',
      image: feedData.image || undefined,
      guid: feedData.guid || ''
    }
  },
  getExtraEntryFields: (feedEntry: any) => {
    //console.log("feedEntry", feedEntry)
    const {
      enclosure,
      category
    } = feedEntry
    return {
      enclosure: {
        url: enclosure ? enclosure['@_url'] : undefined,
        type: enclosure ? enclosure['@_type'] : 'undefined',
        length: enclosure ? enclosure['@_length'] : 'undefined'
      },
      content: feedEntry['content:encoded'],
      category
    }
  }
//  useISODateFormat: useISODateFormat !== 'n',
//  normalization: normalization !== 'n'
}
// watch(() => route.params, (currentValue, oldValue) => {
//   console.log("url", currentValue, oldValue)
// })

watchEffect(() => {
  encodedUrl.value = route.params.encodedUrl as string
  console.log("url2", encodedUrl.value)
  if (encodedUrl.value) {
    try {
      extract(atob(encodedUrl.value), opts)
        .then(res => {
          console.log("res", res)
          rss.value = res
        })
    } catch (err) {
      console.log("err", err)
    }
  }
})

const openInNewTab = (link: string) => NavigationService.openOrCreateTab([link])

const imageEnclosure = (entry: any): string | undefined => {
  if (entry.enclosure && entry.enclosure.type.indexOf('image') >= 0) {
    return entry.enclosure.url
  }
  return undefined
}

const formatDate = (timestamp: any | undefined) =>
  timestamp ? formatDistance(parseISO(timestamp), new Date(), {addSuffix: true}) : ""


</script>

<style lang="sass" scoped>

.lightgrey
  background-color: $lightgrey

.greyBorderTop
  border-top: 1px solid $bordergrey

</style>
