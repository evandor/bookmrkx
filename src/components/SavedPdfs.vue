<template>

  <q-separator></q-separator>


  <div
    class="col-12 q-pa-xs items-center justify-center" style="width:100%; max-width: 300px;cursor: move"
    v-for="pdf in pdfs">

    <q-card class="my-card" flat @click="open(pdf.id)">
      <q-card-section class="q-pt-xs cursor-pointer" style="width:100%;">
        <div class="row items-baseline">
          <div class="col-2">
            *
          </div>
          <div class="col-9 text-body2 ellipsis">
            {{ pdf['title' as keyof object] }}
          </div>
          <div class="col-1">
<!--            <q-icon name="close" @click.stop="deleteMHtml(pdf)"/>-->
          </div>
        </div>

      </q-card-section>
    </q-card>
  </div>


</template>

<script setup lang="ts">

import {useTabsStore} from "src/stores/tabsStore"
import {ref} from "vue";
import {useRouter} from "vue-router";
import {SavedBlob} from "src/models/SavedBlob";
import PdfService from "src/services/PdfService";

const router = useRouter()

const pdfs = ref<SavedBlob[]>([])


PdfService.getPdfs()
  .then((res: SavedBlob[]) => {
    console.log("hier", res)
    pdfs.value = res
  })

const open = (url: string) => {
  router.push("/mhtml/" + url)
}

const deleteMHtml = () => {
  console.log("deleting...")
}

</script>
