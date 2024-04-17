<template>
  <div class="q-ma-none">

    <q-toolbar class="text-primary lightgrey">
      <div class="row fit">
        <q-toolbar-title>
          <div class="row">
            <div class="col-2">
              <q-icon name="chevron_left" class="cursor-pointer" @click="router.push('/sidepanel')">
                <q-tooltip>Back</q-tooltip>
              </q-icon>
            </div>
            <div class="col-10">
              Tab Details
            </div>
            <div class="col-1 text-right">
            </div>
          </div>
        </q-toolbar-title>
      </div>
    </q-toolbar>

    <div class="row items-baseline q-mx-sm q-my-sm">

      <div class="col-2">
        <TabFaviconWidget v-if="tab"
                          class="q-mr-md q-mb-md"
                          :tab="tab" width="24px" height="24px"/>
      </div>
      <div class="col-10 text-body1 ellipsis-3">
        {{ getHost(tab?.url, true) }}
      </div>
      <div class="col-12 text-body2 ellipsis-3">
        {{ tab?.title }}
      </div>

      <div class="col-12">
        <div class="text-overline ellipsis text-blue-10 cursor-pointer"
             @click.stop="NavigationService.openOrCreateTab([tab.url] )">
          {{ tab?.url }}&nbsp;<q-icon name="launch" color="secondary"
                                      class="cursor-pointer"></q-icon>
        </div>
      </div>

    </div>

    <div class="row q-ma-sm">
      <div class="col-5 text-caption text-bold">
        In tabsets:
      </div>
      <div class="col-7 text-right">
        <q-chip v-for="chip in tabsetChips()"
                class="cursor-pointer q-ml-xs" size="8px" clickable icon="tab" @click="openTabset(chip)">
          {{ chip.label }}
        </q-chip>
      </div>
    </div>

    <div class="row q-ma-sm">
      <div class="col-5 text-caption text-bold">
        In Bookmarks:
      </div>
      <div class="col-7 text-right">
        ...
      </div>
    </div>

    <div class="row q-ma-sm">

      <div class="col-12" v-if="hasAllUrlsPermission">
        <q-img :src="thumbnail" style="border:1px dotted grey;border-radius: 5px;" no-native-menu/>
      </div>
      <div class="col-12 bg-amber-1" v-else-if="!inBexMode()">
        <!--        <q-img src="thumbnail-not-available.png" style="border:1px solid grey;border-radius: 5px;" no-native-menu/>-->
      </div>
      <div class="col-12" v-else>
        <q-banner rounded style="border:1px solid grey;border-radius: 5px;">
          If you want to have thumbnails of your tabs, additional permissions are needed.<br><br>
          Click <span class="cursor-pointer text-blue-6" style="text-decoration: underline"
                      @click="router.push('/features/thumbnails')">here</span> to
          grant permissions for the tabset extension to create thumbnails for your tabs.
        </q-banner>
      </div>

      <div class="col-3 text-left">


        <q-btn v-if="featuresStore.isEnabled('dev')"
               @click="showTabDetails"
               round size="11px"
               color="primary"
               flat
               icon="o_more_horiz">
          <q-tooltip>Show additional information about this tab (developer mode)</q-tooltip>
        </q-btn>
      </div>
      <div class="col-9 text-right">
        <!--        <q-btn round size="11px"-->
        <!--               :color="tab?.note && tab.note.length > 0 ? 'white' : 'warning'"-->
        <!--               :style="tab?.note && tab.note.length > 0 ? 'background: #FFBF46' : 'background: #ffffff'"-->
        <!--               flat-->
        <!--               icon="edit_note"-->
        <!--               @click.stop="editNoteDialog(tab)">-->
        <!--          <q-tooltip>Add a note to this tab or edit it</q-tooltip>-->
        <!--        </q-btn>-->

        <!--        <q-btn flat round color="primary" size="11px" icon="o_schedule" @click.stop="scheduleTab()">-->
        <!--          <q-tooltip>Schedule this tab</q-tooltip>-->
        <!--        </q-btn>-->

        <template v-if="usePermissionsStore().hasFeature(FeatureIdent.SAVE_TAB_AS_PNG) && useAuthStore().isAuthenticated()">
          <q-btn
              @click.stop="savePng(tab as Tab)"
              flat round color="primary" size="11px" icon="image"
              :disabled="!isOpen(tab as Tab)">
            <q-tooltip v-if="isOpen(tab as Tab)">Save this tab as PNG</q-tooltip>
            <q-tooltip v-else>The tab must be open if you want to save it. Click on the link and come back here to save
              it.
            </q-tooltip>
          </q-btn>
        </template>

        <template v-if="usePermissionsStore().hasFeature(FeatureIdent.SAVE_TAB_AS_PDF)">
          <q-btn
              @click.stop="savePdf(tab)"
              flat round color="primary" size="11px" icon="o_picture_as_pdf"
              :disabled="!isOpen(tab)">
            <q-tooltip v-if="isOpen(tab)">Save this tab as a PDF File</q-tooltip>
            <q-tooltip v-else>The tab must be open if you want to save it. Click on the link and come back here to save
              it.
            </q-tooltip>
          </q-btn>
        </template>

        <template v-if="usePermissionsStore().hasFeature(FeatureIdent.SAVE_TAB)">
          <q-btn
              @click.stop="saveTab(tab)"
              flat round color="primary" size="11px" icon="save"
              :disabled="!isOpen(tab)">
            <q-tooltip v-if="isOpen(tab)">Save this tab</q-tooltip>
            <q-tooltip v-else>The tab must be open if you want to save it. Click on the link and come back here to save
              it.
            </q-tooltip>
          </q-btn>
        </template>


      </div>

    </div>

  </div>

  <q-separator/>

  <q-list>

    <q-expansion-item label="Tags" :default-opened="true">
      <q-card>
        <q-card-section>
          <q-select
              filled
              v-model="tags"
              use-input
              use-chips
              multiple
              hide-dropdown-icon
              input-debounce="0"
              new-value-mode="add-unique"
              @update:model-value="val => updatedTags(val)"
              style="width: 250px"
          />
        </q-card-section>
      </q-card>
    </q-expansion-item>

<!--    <q-expansion-item label="Archived Snapshots"-->
<!--                      v-if="usePermissionsStore().hasFeature(FeatureIdent.SAVE_TAB) && tab?.mhtmls?.length > 0"-->
<!--                      :default-opened="true">-->
<!--      <q-card>-->
<!--        <q-card-section>-->
<!--          <div class="row q-mx-sm q-mt-xs" v-for="mhtml in tab?.mhtmls">-->
<!--&lt;!&ndash;            <MHtmlViewHelper :mhtmlId="mhtml" :tabId="tab?.id || 'unknown'"/>&ndash;&gt;-->
<!--          </div>-->
<!--        </q-card-section>-->
<!--      </q-card>-->
<!--    </q-expansion-item>-->

    <q-expansion-item label="Archived Images"
                      v-if="usePermissionsStore().hasFeature(FeatureIdent.SAVE_TAB_AS_PNG) && pngs.length > 0">
      <q-card>
        <q-card-section>
          <div class="row q-mx-sm q-mt-xs" v-for="png in pngs">
            <PngViewHelper :pngId="png.id" :created="png.created" :tabId="tab?.id || 'unknown'"/>
          </div>
        </q-card-section>
      </q-card>
    </q-expansion-item>

    <q-expansion-item label="Archived PDFs"
                      v-if="usePermissionsStore().hasFeature(FeatureIdent.SAVE_TAB_AS_PNG) && pdfs.length > 0">
      <q-card>
        <q-card-section>
          <div class="row q-mx-sm q-mt-xs" v-for="pdf in pdfs">
            <PngViewHelper :pngId="pdf.id" :created="pdf.created" :tabId="tab?.id || 'unknown'"/>
          </div>
        </q-card-section>
      </q-card>
    </q-expansion-item>

    <!--    <q-expansion-item label="Note"-->
    <!--                      group="somegroup"-->

    <!--                      :default-opened="false">-->
    <!--      <q-card>-->
    <!--        <q-card-section>-->
    <!--          <div class="text-caption">-->
    <!--            {{ tab?.note }}-->
    <!--          </div>-->
    <!--        </q-card-section>-->
    <!--      </q-card>-->
    <!--    </q-expansion-item>-->

    <q-expansion-item label="Meta Data"
                      group="somegroup"

                      :default-opened="tab?.note === undefined">
      <q-card>
        <q-card-section>
          <div class="row q-mx-sm q-mt-none">
            <div class="col-5 text-caption text-bold">created</div>
            <div class="col-7 text-right text-caption">{{ formatDate(tab?.created) }}</div>
          </div>
          <div class="row q-mx-sm">
            <div class="col-5 text-caption text-bold">changed</div>
            <div class="col-7 text-right text-caption">{{ formatDate(tab?.updated) }}</div>
          </div>
          <div class="row q-mx-sm">
            <div class="col-5 text-caption text-bold">last active</div>
            <div class="col-7 text-right text-caption">{{ formatDate(tab?.lastActive) }}</div>
          </div>
          <div class="row q-mx-sm">
            <div class="col-5 text-caption text-bold">opened</div>
            <div class="col-7 text-right text-caption">{{ tab?.activatedCount }}x</div>
          </div>

          <template v-if="useSettingsStore().isEnabled('dev')">
            <div class="row q-mx-sm">
              <div class="col-12 text-caption text-bold q-px-xl">
                <hr>
              </div>
            </div>
            <div class="row q-mx-sm" v-for="metaRow in metaRows">
              <div class="col-5 text-caption text-bold">{{ metaRow.name }}</div>
              <div class="col-7 text-right text-caption ellipsis">
                {{ metaRow }}
                <q-tooltip>{{ metaRow }}</q-tooltip>
              </div>
            </div>
          </template>

        </q-card-section>
      </q-card>
    </q-expansion-item>

    <q-expansion-item label="Http Status"
                      group="somegroup">
      <q-card>
        <q-card-section>
          <div class="row q-mx-sm q-mt-none">
            <div class="col-5 text-caption text-bold">Http Status</div>
            <div class="col-7 text-right text-caption">{{ tab?.httpStatus }}</div>
          </div>
          <div class="row q-mx-sm q-mt-none">
            <div class="col-5 text-caption text-bold">Checked At</div>
            <div class="col-7 text-right text-caption">{{
                formatDate(tab?.httpCheckedAt)
              }}
            </div>
          </div>
          <div class="row q-mx-sm q-mt-none">
            <div class="col-5 text-caption text-bold">Info</div>
            <div class="col-7 text-right text-caption">{{ tab?.httpInfo }}</div>
          </div>
          <div class="row q-mx-sm q-mt-none">
            <div class="col-5 text-caption text-bold">Content Type</div>
            <div class="col-7 text-right text-caption">{{ tab?.httpContentType }}</div>
          </div>
          <div class="row q-mx-sm q-mt-none">
            <div class="col-5 text-caption text-bold">Last Modified</div>
            <div class="col-7 text-right text-caption">{{ tab?.httpLastModified }}</div>
          </div>
          <div class="row q-mx-sm q-mt-none">
            <div class="col-5 text-caption text-bold">Error</div>
            <div class="col-7 text-right text-caption">{{ tab?.httpError }}</div>
          </div>
        </q-card-section>
      </q-card>
    </q-expansion-item>

    <q-expansion-item label="Selections" v-if="tab?.selections?.length > 0"
                      group="somegroup">
      <q-card>
        <q-card-section>
          <div class="row q-mx-sm q-mt-none">
            <div class="col-5 text-caption text-bold">Selections</div>
            <div class="col-7 text-right text-caption">{{ tab?.selections?.length }}</div>
          </div>
          <div class="row q-mx-sm q-mt-none" v-for="selection in tab?.selections">
            <div class="col-12 text-caption">{{ selection.text }}</div>
          </div>
        </q-card-section>
      </q-card>
    </q-expansion-item>

    <q-expansion-item group="somegroup" label="Search Index">
      <q-card>
        <q-card-section>
          <div class="row q-mx-sm">
            <div class="col-12 text-caption">
              <div v-for="(k,index) in searchIndex">
                <div class="row" v-if="searchIndex.get(index)['v']">
                  <div class="col-4 q-ml-sm text-bold">
                    {{ searchIndex.get(index)['name'] }}
                  </div>
                  <div class="col-7 ellipsis">
                    {{ searchIndex.get(index)['v'] }}
                    <q-tooltip class="tooltip">{{ searchIndex.get(index)['v'] }}</q-tooltip>
                  </div>
                  <div class="col text-right">
                    <q-icon name="o_check_circle" color="primary"/>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </q-expansion-item>

  </q-list>

</template>

<script lang="ts" setup>

import {useUiStore} from "src/stores/uiStore";
import TabFaviconWidget from "components/widgets/TabFaviconWidget.vue";
import _ from "lodash";
import {useTabsetService} from "src/services/TabsetService2";
import TabsetService from "src/services/TabsetService";
import {ref, watchEffect} from "vue";
import {usePermissionsStore} from "src/stores/permissionsStore";
import {useRoute, useRouter} from "vue-router";
import {useQuasar} from "quasar";
import {Tab} from "src/models/Tab";
import {formatDistance} from "date-fns";
import {useUtils} from "src/services/Utils";
import NavigationService from "src/services/NavigationService";
import {useSearchStore} from "src/stores/searchStore";
import {useCommandExecutor} from "src/services/CommandExecutor";
import {SaveTabCommand} from "src/domain/tabs/SaveTab";
import {FeatureIdent} from "src/models/AppFeature";
import {useTabsStore} from "src/stores/tabsStore";
import {useSettingsStore} from "src/stores/settingsStore"
import {SelectTabsetCommand} from "src/domain/tabsets/SelectTabset";
import MHtmlPage from "pages/MHtmlPage.vue";
import MHtmlViewHelper from "pages/sidepanel/helper/MHtmlViewHelper.vue";
import {TabAndTabsetId} from "src/models/TabAndTabsetId";
import PdfService from "src/services/PdfService";
import {SavedBlob} from "src/models/SavedBlob";
import PngViewHelper from "pages/sidepanel/helper/PngViewHelper.vue";
import {SavePngCommand} from "src/domain/tabs/SavePng";
import {SavePdfCommand} from "src/domain/tabs/SavePdf";
import {useAuthStore} from "stores/authStore";

const {inBexMode} = useUtils()

const uiStore = useUiStore()
const featuresStore = useSettingsStore()
const router = useRouter()
const route = useRoute()
const $q = useQuasar()

const hasAllUrlsPermission = ref<boolean | undefined>(false)

const thumbnail = ref('')
const content = ref('')
const searchIndex = ref<any>()
const metaRows = ref<object[]>([])
const metas = ref({})
const tab = ref<Tab | undefined>(undefined)
const pngs = ref<SavedBlob[]>([])
const pdfs = ref<SavedBlob[]>([])

const {selectTabset} = useTabsetService()

const tags = ref<string[]>([])

watchEffect(() => {
  const tabId = route.params.tabId as unknown as string
  console.log("tabid", tabId)
  const tabObject = useTabsStore().getTabAndTabsetId(tabId)
      //.then((tabObject: TabAndTabsetId | undefined) => {
        if (tabObject) {
          tab.value = tabObject.tab
          tags.value = tab.value.tags
        }
     // })

  // const selectedTab = tab.value
  // console.log("selectedTab", selectedTab)
  // if (selectedTab) {
  //   tags.value = selectedTab.tags
  // }
})


watchEffect(() => hasAllUrlsPermission.value = usePermissionsStore().hasAllOrigins())

watchEffect(() => {
  if (tab.value) {
    TabsetService.getThumbnailFor(tab.value)
        .then(data => {
          if (data) {
            thumbnail.value = data.thumbnail
          } else {
            thumbnail.value = ''
          }
        })
    TabsetService.getContentFor(tab.value)
        .then(data => {
          if (data) {
            content.value = data['content' as keyof object]
            //metas.value = data['metas' as keyof object]
            metaRows.value = []
            _.forEach(Object.keys(data['metas' as keyof object]), k => {
              //console.log("k", k, data.metas[k])
              metaRows.value.push({
                name: k,
                value: data['metas' as keyof object][k]
              })
            })
            metaRows.value = _.sortBy(metaRows.value, s => s['name' as keyof object])
          }
        })
    PdfService.getPngsForTab(tab.value.id)
        .then((blobs: SavedBlob[]) => pngs.value = blobs)
    PdfService.getPdfsForTab(tab.value.id)
        .then((blobs: SavedBlob[]) => pdfs.value = blobs)
  }
})

function isOpen(tab: Tab | undefined): boolean {
  return TabsetService.isOpen(tab?.url || '')
}

const tabsetChips = (): object[] => {
  const badges: object[] = []
  const url = tab.value?.url
  if (url) {
    _.forEach(useTabsetService().tabsetsFor(url), ts => badges.push({
      label: TabsetService.nameForTabsetId(ts),
      tabsetId: ts,
      encodedUrl: btoa(url || '')
    }))
  }
  // if (hit.bookmarkId) {
  //   badges.push({
  //     label: 'bookmark',
  //     bookmarkId: hit.bookmarkId,
  //     encodedUrl: btoa(hit.url || '')
  //   })
  // }
  return badges;
}

function getShortHostname(host: string) {
  const nrOfDots = (host.match(/\./g) || []).length
  if (nrOfDots >= 2) {
    return host.substring(host.indexOf(".", nrOfDots - 2) + 1)
  }
  return host
}

function getHost(urlAsString: string, shorten: Boolean = true): string {
  try {
    const url = new URL(urlAsString)
    if (!shorten) {
      return url.protocol + "://" + url.host.toString()
    }
    return getShortHostname(url.host)
  } catch (e) {
    return "---";
  }
}

const formatDate = (timestamp: number | undefined) =>
    timestamp ? formatDistance(timestamp, new Date(), {addSuffix: true}) : ""

const showTabDetails = () =>
    NavigationService.openOrCreateTab([chrome.runtime.getURL("/www/index.html#/mainpanel/tab/" + tab.value?.id)])

watchEffect(() => {
  const fuseIndex = useSearchStore().getIndex()
  const keyMaps = fuseIndex['_keysMap' as keyof object]
  const res = _.filter(fuseIndex['records' as keyof object], (r: any) => {
    return tab.value?.url === r.$[2]?.v
  })
  const keys: Map<number, object> = new Map()
  Object.keys(keyMaps).forEach((k: any) => {
    keys.set(keyMaps[k], {
      name: k
    })
  })

  if (res && res.length > 0) {
    Object.keys(res[0]['$' as keyof object]).forEach(k => {
      const tmp = res[0]['$' as keyof object][k as keyof object]
      const v: any = keys.get(+k)
      v.n = tmp['n' as keyof object]
      const c = tmp['v' as keyof object]
      v.v = c //? (c.length > 100 ? c.substring(0,98) + "..." : c) : ''
      keys.set(+k, v)
    })
    searchIndex.value = keys
  }
})

const saveTab = (tab: Tab | undefined) =>
    useCommandExecutor().execute(new SaveTabCommand(useTabsStore().getCurrentTabset, tab))

const savePng = (tab: Tab | undefined) => {
  if (tab) {
    useCommandExecutor().execute(new SavePngCommand(tab, "saved by user"))
  }
}

const savePdf = (tab: Tab | undefined) => {
  if (tab) {
    useCommandExecutor().execute(new SavePdfCommand(tab, "saved by user"))
  }
}

const updatedTags = (val: string[]) => {
  if (tab.value) {
    console.log("updating tag", val)
    tab.value.tags = val
    useTabsetService().saveCurrentTabset()
        .catch((err) => console.error(err))
  }
}

const openTabset = (chip: any) => {
  console.log("chip", chip)
  useCommandExecutor()
      .execute(new SelectTabsetCommand(chip['tabsetId'], undefined))
}

</script>
