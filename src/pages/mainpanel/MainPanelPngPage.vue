<template>

  <q-page padding>
    <q-toolbar class="text-primary">
      <div class="row fit">
        <div class="col-xs-12 col-md-5">
          <q-toolbar-title class="q-mb-lg">
            <div class="row justify-start items-baseline">
              <div class="col-1"><span class="text-dark">Archived Image for: {{ png?.url }}</span></div>
            </div>
            <div class="text-caption">Created {{ date.formatDate(png?.created, 'DD.MM.YYYY HH:mm') }}</div>
            <div class="text-caption">Size {{ Math.round((png?.content.size || 0) / 1024) }} kB</div>
          </q-toolbar-title>
        </div>
        <div class="col-xs-12 col-md-7 text-right">

<!--          <q-btn-->
<!--            flat dense icon="o_open_in_new"-->
<!--            color="green"-->
<!--            label="Open in new tab"-->
<!--            class="q-mr-md"-->
<!--            @click="openInNewTab">-->
<!--            <q-tooltip>Open in new tab</q-tooltip>-->
<!--          </q-btn>-->

        </div>
      </div>
    </q-toolbar>

    <div class="row">
      <div class="col">
        <hr>
        <div class="q-pa-lg">
          <div class="q-gutter-md">
            <q-pagination
                v-model="current"
                :max="pngs.length"
                direction-links/>


          </div>
        </div>
        <hr>
      </div>
    </div>

    <img id="monitoringStartImg">



  </q-page>

</template>

<script lang="ts" setup>

import {onMounted, ref, watchEffect} from "vue";
import {useRoute} from "vue-router";
import {date} from "quasar"
import MHtmlService from "src/services/MHtmlService";
import {useUiStore} from "src/stores/uiStore";
import Analytics from "src/utils/google-analytics";
import PdfService from "src/services/PdfService";
import {SavedBlob} from "src/models/SavedBlob";
import _ from "lodash"

const route = useRoute()

const tabId = ref<string>()
const blobId = ref<string>()
const title = ref()
const created = ref('')
const pngs = ref<SavedBlob[]>([])
const png = ref<SavedBlob | undefined>(undefined)
const current = ref(2)

onMounted(() => {
  Analytics.firePageViewEvent('MainPanelPngPage', document.location.href);
})

function setImage(index: number) {
  //png.value = _.first(_.filter(pngs.value, (p:SavedBlob) => p.id === blobId.value))
  png.value = pngs.value[index]
  if (!png.value) {
    return
  }
  var urlCreator = window.URL || window.webkitURL;
  var imageUrl = urlCreator.createObjectURL(png.value.content);
  console.log("imageUrl", imageUrl)
  const img1: HTMLImageElement | null = document.querySelector("#monitoringStartImg")
  if (img1) {
    img1.src = imageUrl;
  }
}

watchEffect(async () => {
  tabId.value = route.params.tabId as string
  blobId.value = route.params.blobId as string
  if (blobId.value && useUiStore().dbReady) {
    // const tabId = suggestion.value['data' as keyof object]['tabId' as keyof object]
    // console.log("got tabId", tabId)
    pngs.value = await PdfService.getPngsForTab(tabId.value)
    console.log("pngs", pngs.value)
      setImage(0);
  }
})

watchEffect(() => {
  console.log("current", current.value)
  setImage(current.value-1)
})


</script>
