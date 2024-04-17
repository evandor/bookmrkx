<template>

  <div
    class="q-ma-md q-pa-xs items-center justify-center" style="width:100%; max-width: 300px;border: 1px solid grey"
    v-for="tab in scheduledTabs">

    <q-card class="my-card" flat @click="open(tab)">
      <q-card-section class="q-pt-xs cursor-pointer" style="width:100%;">
        <div class="row items-baseline">
          <div class="col-2">
            <TabFaviconWidget :tab="tab" width="20px" height="20px" />
          </div>
          <div class="col-9 text-body2 ellipsis" @click="NavigationService.openOrCreateTab([tab.url])">
            {{ tab.title }}
          </div>
          <div class="col-1">
            <q-checkbox
              v-model="done"
              checked-icon="o_task_alt"
              unchecked-icon="o_brightness_1"
              indeterminate-icon="help"
            />
          </div>
        </div>

      </q-card-section>
      <q-card-section class="q-pt-xs cursor-pointer" style="width:100%;">
        <div class="row items-baseline">
          <div class="col-12">
            {{tab.scheduledFor}}
          </div>
        </div>

      </q-card-section>
    </q-card>
  </div>


</template>

<script setup lang="ts">

import {useTabsStore} from "src/stores/tabsStore"
import {ref, watchEffect} from "vue";
import {useRouter} from "vue-router";
import {Tab} from "src/models/Tab";
import TabFaviconWidget from "components/widgets/TabFaviconWidget.vue";
import NavigationService from "src/services/NavigationService";

const tabsStore = useTabsStore()
const router = useRouter()

const scheduledTabs = ref<Tab[]>([])
const done = ref(false)

watchEffect(() => scheduledTabs.value = tabsStore.scheduledTabs)

const open = (tab: Tab) => {
  if (tab.url) {
    router.push("/rss/" + btoa(tab.url))
  }
}

</script>
