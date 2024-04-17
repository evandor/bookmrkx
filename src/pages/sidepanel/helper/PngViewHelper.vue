<template>
  <div class="col-3 text-caption text-bold">created</div>
  <div class="col-6 text-right text-caption">{{ date.formatDate(created, 'DD.MM.YYYY HH:mm') }}</div>
  <div class="col-3 text-caption">
    <q-icon name="o_open_in_new" class="q-ml-md cursor-pointer" @click="openMhtml"/>
    <q-icon name="o_delete" class="q-ml-md cursor-pointer" @click="deletePdf()"/>
  </div>
</template>

<script lang="ts" setup>
import {ref} from "vue";
import {date} from "quasar";
import PdfService from "src/services/PdfService";

const mhtml = ref<any>()

const props = defineProps({
  pngId: {type: String, required: true},
  created: {type: Number, required: true},
  tabId: {type: String, required: true}
})

const openMhtml = () => window.open(chrome.runtime.getURL('www/index.html#/mainpanel/png/' + props.tabId + "/" + props.pngId));
const deletePdf = () => PdfService.deleteBlob(props.tabId, props.pngId)

</script>
