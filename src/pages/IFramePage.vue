<template>

  <q-toolbar class="text-primary lightgrey">
    <div class="row fit">
      <div class="col-xs-12 col-md-9">
        <q-toolbar-title>
          <div class="row justify-start items-baseline">
            <div class="col-1"><span class="text-dark ellipsis">Page: {{ title }}</span> <span
              class="text-primary">
            </span></div>
          </div>
        </q-toolbar-title>
      </div>
      <div class="col-xs-12 col-md-3 text-right">
        <q-btn
          flat dense icon="o_open_in_new"
          color="primary"
          label="Open in new tab"
          class="q-mr-md"
          @click="openInNewTab"
        >
          <q-tooltip>Open in new tab</q-tooltip>
        </q-btn>

      </div>
    </div>
  </q-toolbar>


    <InfoMessageWidget
      class="greyBorderTop"
      :probability="1"
      ident="iframePage_general"
      hint="Be aware that many pages cannot be displayed here as they defined a policy not to be displayed in an iFrame."/>

    <iframe ref="iFrameRef" id="tabIFrame" :src='src' frameBorder="0" class="greyBorderTop"/>


</template>

<script lang="ts" setup>

import {onMounted, ref, watchEffect} from "vue";
import {useRoute, useRouter} from "vue-router";
import {date} from "quasar"
import {useTabsStore} from "src/stores/tabsStore";
import _ from "lodash"
import TabsetService from "src/services/TabsetService";
import InfoMessageWidget from "components/widgets/InfoMessageWidget.vue";

const route = useRoute()
const router = useRouter()

const tabId = ref()
const title = ref('')
const data = ref<string[]>([])
const src = ref('data:text/html,<p>loading...</p>')
const iFrameRef = ref(null)


onMounted(() => {
  const iFrame = iFrameRef.value
  if (iFrame) {
    console.log("window.innerHeight", window.innerHeight)
    // @ts-ignore
    iFrame.setAttribute("style", "overflow:hidden;height:" + (window.innerHeight - 106) + "px;width:100%;border:0px");
  }
})


watchEffect(async () => {
  tabId.value = route.params.tabId as string
  const found = _.find(useTabsStore().getCurrentTabs, t => t.id === route.params.tabId)
  if (found && found.url) {
    title.value = found.title || 'unknown'
    const request = await TabsetService.getRequestForUrl(found.url)
    if (request && request.requestInfo && _.find(Object.values(request.requestInfo.headers), (v: any) => v.name === 'x-frame-options')) {
      src.value = 'data:text/html,<p>cannot open this page in iFrame ;(</p>'
    } else {
      src.value = found.url || 'data:text/html,<p>loading....</p>'
    }


  }

})

const openInNewTab = () => console.log("not implemented")

const iFrameStyle = () => {
  const v = "overflow:hidden;height:" + (window.innerHeight - 80) + "px;width:100%;border:0px"
  console.log("v", v)
  return v
}

</script>
