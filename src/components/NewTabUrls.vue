<template>

  <div
    class="col-12 q-pa-xs items-center justify-center"
    v-for="url in urls">

    <q-card class="my-card" flat @click="NavigationService.openOrCreateTab([url.url])">
      <q-card-section class="q-pt-xs cursor-pointer" style="width:100%;">
        <div class="row items-baseline">
          <div class="col-2">
            <q-img
              class="rounded-borders"
              width="20px"
              height="20px"
              :src="url.favIconUrl">
            </q-img>
          </div>
          <div class="col-9 text-body2 ellipsis">
            {{ url.title }}
          </div>
          <div class="col-1" @click.stop="deleteFromList(url)">
            <q-icon name="close"/>
          </div>
        </div>

      </q-card-section>
    </q-card>
  </div>


</template>

<script setup lang="ts">

import {ref, watchEffect} from "vue";
import {useUiStore} from "src/stores/uiStore";
import NavigationService from "src/services/NavigationService";

const urls = ref<object[]>([])

watchEffect(()=> {
  urls.value = useUiStore().newTabUrlList
})

const deleteFromList = (url: any) => {
  useUiStore().removeNewTabUrl(url.url)
}


</script>
