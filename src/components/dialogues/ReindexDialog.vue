<template>
  <q-dialog ref="dialogRef" @hide="onDialogHide">
    <q-card class="q-dialog-plugin">
      <q-card-section>
        <div class="text-h6" v-if="props.tabsetId === ''">Index your Tabsets</div>
        <div class="text-h6" v-else>Index this Tabset</div>
      </q-card-section>
      <q-card-section>
        <div class="text-body">If your search does not yield the results you'd expect, you can try re-indexing your
          tabsets.
        </div>
      </q-card-section>

      <q-card-section class="q-pt-none">
        <div class="text-body" v-if="props.tabsetId === ''">
          Reindexing is the process of going through all your tabsets (and tabs), analyze the tabs' contents and create
          new thumbnail screenshots. For this, <b>a new browser window is opened and the tabs are analyzed one by
          one</b>.
          Given your current data, this will take about {{ duration }} minute(s).<br><br>
          <span class="text-negative">Please do not use your computer otherwise in that time as it will break the results.</span>
        </div>
        <div v-else>
          Reindexing is the process of going through all the tabs of this tabset, analyze the tabs' contents and create
          new thumbnail screenshots. For this, <b>a new browser window is opened and the tabs are analyzed one by
          one</b>.
          Given your current data, this will take about {{ duration }} minute(s).<br><br>
          <span class="text-negative">Please do not use your computer otherwise in that time as it will break the results.</span>
        </div>
      </q-card-section>

      <q-card-actions align="right" class="text-primary">
        <q-btn flat label="Cancel" @click="onDialogCancel"/>
        <q-btn flat
               data-testid="reindexSubmit"
               label="Got it, start indexing"
               v-close-popup
               @click="startIndexing()"/>
      </q-card-actions>


    </q-card>
  </q-dialog>

</template>

<script lang="ts" setup>

import {ref, watchEffect} from "vue";

import {useDialogPluginComponent} from 'quasar'
import {useSearchStore} from "src/stores/searchStore";

defineEmits([
  ...useDialogPluginComponent.emits
])

const props = defineProps({
  tabsetId: {
    type: String,
    default: ''
  }
})

const {dialogRef, onDialogHide, onDialogCancel} = useDialogPluginComponent()

const searchStore = useSearchStore()

const newTabsetName = ref('')
const newTabsetNameExists = ref(false)
const hideWarning = ref(false)
const duration = ref(1)



</script>
