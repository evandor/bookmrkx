<template>
  <q-dialog ref="dialogRef" @hide="onDialogHide">
    <q-card class="q-dialog-plugin">
      <q-card-section>
        <div class="text-h6">Missing Permission</div>
      </q-card-section>
      <q-card-section>
        <div class="text-body">
          The Tabsets Extension requires an additional permission ({{props.permissionName}}
          for this action.
        </div>
      </q-card-section>

      <q-card-actions align="right" class="text-primary">
        <q-btn flat label="Cancel" v-close-popup/>
        <q-btn flat label="Grant Permission"
               data-testid="add_url_submit"
               :disable="url.trim().length === 0" v-close-popup
               @click="createNewUrl()"/>
      </q-card-actions>
    </q-card>

  </q-dialog>

</template>

<script lang="ts" setup>

import {computed, ref, watchEffect} from "vue";
import TabsetService from "src/services/TabsetService";
import {uid, useQuasar} from "quasar";
import {useRouter} from "vue-router";
import {useTabsStore} from "src/stores/tabsStore";

import {useDialogPluginComponent} from 'quasar'
import {STRIP_CHARS_IN_USER_INPUT} from "boot/constants";
import {Tab} from "src/models/Tab";
import ChromeApi from "src/services/ChromeApi";

defineEmits([
  ...useDialogPluginComponent.emits
])

const url = ref('')

const props = defineProps({
  permissionName: {
    type: String,
    required: true
  })

const {dialogRef, onDialogHide, onDialogCancel} = useDialogPluginComponent()

const tabsStore = useTabsStore()
const router = useRouter()
const $q = useQuasar()

const newTabsetName = ref('')
const newTabsetNameExists = ref(false)
const hideWarning = ref(false)

watchEffect(() => {
  newTabsetNameExists.value = !!tabsStore.nameExistsInContextTabset(newTabsetName.value);
})


const newTabsetNameIsValid = computed(() => newTabsetName.value.length <= 32 && !STRIP_CHARS_IN_USER_INPUT.test(newTabsetName.value))

const createNewUrl = () => {
  console.log("new url", url.value)
  const tab = new Tab(uid(), null as unknown as chrome.tabs.Tab)
  tab.created = new Date().getTime()
  tab.chromeTab = ChromeApi.createChromeTabObject(url.value, url.value, null as unknown as string)
  tab.extension = tab.determineUrlExtension(tab.chromeTab)
  TabsetService.saveToCurrentTabset(tab)
}

</script>
