<template>
  <q-page padding>

    <div class="row justify-center items-center" style="height:500px">
      <div class="text-h5 content-center">
        Tabsets Fullpage View
      </div>
    </div>


  </q-page>

</template>

<script setup lang="ts">
import {useQuasar} from "quasar";
import {useRouter} from "vue-router";
import {onMounted} from "vue";
import Analytics from "src/utils/google-analytics";

const $q = useQuasar()
const router = useRouter()

let timer

onMounted(() => {
  Analytics.firePageViewEvent('FullPageStart', document.location.href);
})


$q.loading.show({
  message: 'Initializing tabsets. The Fullpage View will deactivate the SidePanel for this tab. Please hang on...'
})
timer = setTimeout(() => {
  chrome.tabs.getCurrent((t?: chrome.tabs.Tab ) => {
    //console.log("got tab", t)
    const options = {
      tabId: t.id,
      enabled: false
    }
    console.log("setting options", options)
    // @ts-ignore
    chrome.sidePanel.setOptions(options);
  })

  setTimeout(() => {
    $q.loading.hide()
  }, 500)
  timer = void 0
}, 2000)


</script>
