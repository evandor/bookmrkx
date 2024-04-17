<template>
  <div>

    <div class="row items-baseline q-mx-sm q-my-sm">

      <div class="col-2">
        <TabFaviconWidget
          class="q-mr-md q-mb-md"
          :tab="uiStore.getSelectedTab" width="24px" height="24px"/>
      </div>
      <div class="col-10 text-body1 ellipsis">
        {{ getHost(useUiStore().getSelectedTab?.url, true) }}
      </div>
      <div class="col-12 text-body2 ellipsis">
        {{ useUiStore().getSelectedTab?.title }}
      </div>

      <div class="col-12">

        <div @click="openURL(useUiStore().getSelectedTab?.url || '')">go2</div>

        <div class="text-overline ellipsis text-blue-10 cursor-pointer"
             @click.stop="NavigationService.openOrCreateTab([useUiStore().getSelectedTab?.url || ''] )">
          {{ useUiStore().getSelectedTab?.url }}&nbsp;<q-icon name="launch" color="secondary"
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
        <q-banner rounded class="bg-yellow-1 text-black" style="border:1px solid grey;border-radius: 5px;">
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
        <!--               :color="useUiStore().getSelectedTab?.note && useUiStore().getSelectedTab.note.length > 0 ? 'white' : 'warning'"-->
        <!--               :style="useUiStore().getSelectedTab?.note && useUiStore().getSelectedTab.note.length > 0 ? 'background: #FFBF46' : 'background: #ffffff'"-->
        <!--               flat-->
        <!--               icon="edit_note"-->
        <!--               @click.stop="editNoteDialog(useUiStore().getSelectedTab)">-->
        <!--          <q-tooltip>Add a note to this tab or edit it</q-tooltip>-->
        <!--        </q-btn>-->

        <!--        <q-btn flat round color="primary" size="11px" icon="o_schedule" @click.stop="scheduleTab()">-->
        <!--          <q-tooltip>Schedule this tab</q-tooltip>-->
        <!--        </q-btn>-->

        <q-btn v-if="usePermissionsStore().hasPermission('pageCapture')"
               @click.stop="saveTab(useUiStore().getSelectedTab)"
               flat round color="primary" size="11px" icon="save"
               :disabled="!isOpen(useUiStore().getSelectedTab)">
          <q-tooltip v-if="isOpen(useUiStore().getSelectedTab)">Save this tab</q-tooltip>
          <q-tooltip v-else>The tab must be open if you want to save it. Click on the link and come back here to save
            it.
          </q-tooltip>
        </q-btn>


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

    <q-expansion-item label="Note"
                      group="somegroup"

                      :default-opened="false">
      <q-card>
        <q-card-section>
          <div class="text-caption">
            {{ useUiStore().getSelectedTab.note }}
          </div>
        </q-card-section>
      </q-card>
    </q-expansion-item>

    <q-expansion-item label="Meta Data"
                      group="somegroup"

                      :default-opened="useUiStore().getSelectedTab.note === undefined">
      <q-card>
        <q-card-section>
          <div class="row q-mx-sm q-mt-none">
            <div class="col-5 text-caption text-bold">created</div>
            <div class="col-7 text-right text-caption">{{ formatDate(useUiStore().getSelectedTab?.created) }}</div>
          </div>
          <div class="row q-mx-sm">
            <div class="col-5 text-caption text-bold">changed</div>
            <div class="col-7 text-right text-caption">{{ formatDate(useUiStore().getSelectedTab?.updated) }}</div>
          </div>
          <div class="row q-mx-sm">
            <div class="col-5 text-caption text-bold">last active</div>
            <div class="col-7 text-right text-caption">{{ formatDate(useUiStore().getSelectedTab?.lastActive) }}</div>
          </div>
          <div class="row q-mx-sm">
            <div class="col-5 text-caption text-bold">opened</div>
            <div class="col-7 text-right text-caption">{{ useUiStore().getSelectedTab?.activatedCount }}x</div>
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
import {reactive, ref, watchEffect} from "vue";
import {usePermissionsStore} from "src/stores/permissionsStore";
import {useRouter} from "vue-router";
import {openURL, useQuasar} from "quasar";
import {Tab} from "src/models/Tab";
import {formatDistance} from "date-fns";
import {useUtils} from "src/services/Utils";
import NavigationService from "src/services/NavigationService";
import {useSearchStore} from "src/stores/searchStore";
import {useCommandExecutor} from "src/services/CommandExecutor";
import {SaveTabCommand} from "src/domain/tabs/SaveTab";
import {useSettingsStore} from "src/stores/settingsStore"
import {SelectTabsetCommand} from "src/domain/tabsets/SelectTabset";

const {inBexMode} = useUtils()

const uiStore = useUiStore()
const featuresStore = useSettingsStore()
const router = useRouter()
const $q = useQuasar()

const hasAllUrlsPermission = ref<boolean | undefined>(false)

const thumbnail = ref('')
const content = ref('')
const searchIndex = ref<any>()

const tags = ref<string[]>([])

watchEffect(() => {
  const selectedTab = useUiStore().getSelectedTab
  if (selectedTab) {
    tags.value = selectedTab.tags
  }
})


watchEffect(() => hasAllUrlsPermission.value = usePermissionsStore().hasAllOrigins())


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

const showTabDetails = () => router.push("/tab/" + uiStore.getSelectedTab?.id)

watchEffect(() => {
  const fuseIndex = useSearchStore().getIndex()
  const keyMaps = fuseIndex['_keysMap' as keyof object]
  const res = _.filter(fuseIndex['records' as keyof object], (r: any) => {
    return useUiStore().getSelectedTab?.url === r.$[2]?.v
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

</script>
