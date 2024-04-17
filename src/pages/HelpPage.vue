<template>

  <q-page class="greyBorderTop">
    <q-toolbar class="text-primary lightgrey">
      <div class="row fit">
        <q-toolbar-title>
          <div class="row justify-start items-baseline">
            Tabsets Extension Help Pages
          </div>
        </q-toolbar-title>
      </div>
    </q-toolbar>

    <iframe ref="iFrameRef" class="greyBorderTop" id="tabIFrame" :src='src' frameBorder="0" />

  </q-page>

</template>

<script lang="ts" setup>

import {onMounted, ref, watchEffect} from "vue";
import {useRoute, useRouter} from "vue-router";
import {useTabsStore} from "src/stores/tabsStore";
import _ from "lodash"
import TabsetService from "src/services/TabsetService";
import Analytics from "src/utils/google-analytics";

const route = useRoute()
const router = useRouter()

const ident = ref()
const title = ref()
const data = ref<string[]>([])
const src = ref('data:text/html,<p>loading...</p>')
const created = ref('')
const iFrameRef = ref(null);

onMounted(() => {
  Analytics.firePageViewEvent('HelpPage', document.location.href);
  const iFrame = iFrameRef.value
  if (iFrame) {
    // @ts-ignore
    iFrame.setAttribute("style", "overflow:hidden;height:" + (window.innerHeight - 130) + "px;width:100%;border:0px");
  }
})

watchEffect(async () => {
  ident.value = route.params.ident as string
  switch (ident.value) {
    case "howtos":
      src.value = "https://tabsets.web.app/#/plain/howtos"
      break;
    case "glossary":
      src.value = "https://tabsets.web.app/#/plain/glossary"
      break;
    case "permissions":
      src.value = "https://tabsets.web.app/#/plain/permissions"
      break;
    default:
      src.value = "https://tabsets.web.app/#/plain/howtos"
  }

})

</script>
