<template>

  <q-toolbar class="text-primary lightgrey">
    <div class="row fit">
      <div class="col-xs-12 col-md-9">
        <q-toolbar-title class="q-ma-none q-pa-none">
          <div class="row">
            <div class="col-2">
              <q-btn icon="arrow_back_ios" @click="goBack()" size="0.5em" class="q-ma-xs q-pa-sm" :disable="!canGoBack"/>
              <q-btn icon="arrow_forward_ios" @click="goForward()" size="0.5em" class="q-ma-xs q-pa-sm" :disable="!canGoForward"/>
              <q-btn icon="refresh" @click="goForward()" size="0.5em" class="q-ma-xs q-pa-sm" :disable="!canGoForward"/>
            </div>
            <div class="col">
              <q-input type="url" dense rounded v-model="src"/>

            </div>
          </div>
        </q-toolbar-title>
      </div>
      <div class="col-xs-12 col-md-3 text-right">
        <!--        <q-btn-->
        <!--          flat dense icon="o_open_in_new"-->
        <!--          color="primary"-->
        <!--          label="Open in new tab"-->
        <!--          class="q-mr-md"-->
        <!--          @click="openInNewTab"-->
        <!--        >-->
        <!--          <q-tooltip>Open in new tab</q-tooltip>-->
        <!--        </q-btn>-->

        <!--        <q-btn-->
        <!--          flat dense icon="o_reply"-->
        <!--          color="primary"-->
        <!--          label="Back to tabsets"-->
        <!--          class="q-mr-md"-->
        <!--          @click="router.push('/tabset')"-->
        <!--        >-->
        <!--          <q-tooltip>Back to tabsets</q-tooltip>-->
        <!--        </q-btn>-->
      </div>
    </div>
  </q-toolbar>

  <!--    <iframe ref="iFrameRef" id="tabIFrame" :src='src' frameBorder="0" class="greyBorderTop"/>-->

  <webview class="greyBorderTop" ref="webviewRef" plugins="plugins"
           id="foo" :src="src" style="display:inline-flex; width:100%; height:480px"></webview>

</template>

<script lang="ts" setup>

import {onMounted, ref, watch, watchEffect} from "vue";
import {useRoute, useRouter} from "vue-router";
import _ from "lodash"
import {uid} from "quasar";
import {Tab} from "src/models/Tab";
import {useTabsStore} from "stores/tabsStore";
import ChromeApi from "src/services/ChromeApi";

const route = useRoute()
const router = useRouter()

const tabId = ref()
const title = ref('')
const data = ref<string[]>([])
const src = ref('')
const webviewRef = ref(null)
const canGoBack = ref(false)
const canGoForward = ref(false)


onMounted(() => {
  console.log("mounting browser page")
  const webview = webviewRef.value
  if (webview) {
    console.log("window.innerHeight", window.innerHeight)
    // @ts-ignore
    webview.setAttribute("style", "overflow:hidden;height:" + (window.innerHeight - 106) + "px;width:100%;border:0px");

    // @ts-ignore
    webview.addEventListener('did-start-loading', (a: any, b: any) => {
      console.log("loading", a.srcElement.src)
      src.value = a.srcElement.src
      const pendingTabs:Tab[] = useTabsStore().pendingTabset.tabs
      if (pendingTabs.findIndex((t:Tab) => t.url === a.srcElement.src) < 0) {
        pendingTabs.push(new Tab(uid(),  ChromeApi.createChromeTabObject(a.srcElement.src, a.srcElement.src,"")))
      }
    })
    // @ts-ignore
    webview.addEventListener('did-stop-loading', (a:any,b:any) => {
     // console.log("stopping", a,b )
      // @ts-ignore
      canGoBack.value = webview.canGoBack()
    })
    // @ts-ignore
    webview.addEventListener('dom-ready', () => {
      // @ts-ignore
      canGoBack.value = webview.canGoBack()
      // @ts-ignore
      canGoForward.value = webview.canGoForward()
    })
  }

})

watch(() => webviewRef.value, (a: any, b: any) => {
  console.log("webview!!!", a?.src, b?.src)
  //console.log("webview", webviewRef.value?.canGoBack() || '?')
  // console.log("webview", webviewRef.value?.src)
  // webviewRef.value.getGoBack()
})

watchEffect(async () => {
  tabId.value = route.params.tabId as string
  const found = _.find(useTabsStore().getCurrentTabs, t => t.id === route.params.tabId)
  console.log("tabid set to ", tabId.value, found)
  if (found && found.url && webviewRef.value) {
    console.log("found", found.url)
    title.value = found?.title || 'unknown'
    // webviewRef.value.src = found.chromeTab.url
    src.value = found.url
    // const request = await TabsetService.getRequestForUrl(found.chromeTab.url)
    // if (request && request.requestInfo && _.find(Object.values(request.requestInfo.headers), (v: any) => v.name === 'x-frame-options')) {
    //   src.value = 'data:text/html,<p>cannot open this page in iFrame ;(</p>'
    // } else {
    //   src.value = found.chromeTab.url || 'data:text/html,<p>loading....</p>'
    // }


  }

})

const openInNewTab = () => console.log("not implemented")

const iFrameStyle = () => {
  const v = "overflow:hidden;height:" + (window.innerHeight - 80) + "px;width:100%;border:0px"
  console.log("v", v)
  return v
}

// @ts-ignore
const goBack = () => webviewRef.value.goBack()
// @ts-ignore
const goForward = () => webviewRef.value.goForward()

</script>
