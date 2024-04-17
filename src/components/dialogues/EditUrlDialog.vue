<template>
  <q-dialog ref="dialogRef" @hide="onDialogHide">
    <q-card class="q-dialog-plugin">
      <q-card-section>
        <div class="text-h6">Edit Tab</div>
      </q-card-section>
      <q-card-section>
        <div class="text-body">
          <div class="text-body"><b>Tab Name:</b></div>
          <q-input type="text" dense v-model="newTabName"/>
        </div>
      </q-card-section>

      <q-card-section>
        <div class="text-body">
          <div class="text-body"><b>Tab Description:</b></div>
          <q-input type="textarea" autogrow dense v-model="newTabDescription"/>
        </div>
      </q-card-section>

      <q-card-section class="q-pt-none">
        <div class="text-body"><b>URL:</b></div>
        <q-input type="url"
                 dense v-model="newTabUrl" autofocus @keydown.enter="updateTab()"
                 error-message="not a valid URL"
                 :error="!newTabUrlIsValid"
        />
        <div class="text-body2 text-warning">{{ newTabsetDialogWarning() }}</div>
      </q-card-section>

      <q-card-section class="q-pt-none" v-if="placeholders.length > 0">
        <b>Substitutions for</b>
      </q-card-section>
      <q-card-section class="q-pt-none text-caption" v-else>
        You can use placeholder like this as well: https://dax.de/${wkn}
      </q-card-section>

      <q-card-section class="q-pt-none" v-for="(placeholder,index) in placeholders">
        <div class="text-body">Placeholder <i>{{ placeholder }}</i></div>
        <q-input dense :model-value="modelFor(placeholder)"
                 @update:model-value="val => updatePlaceholder(placeholder, val)"/>
      </q-card-section>

      <template v-if="useSettingsStore().isEnabled('dev')">
        <q-card-section>
          <q-select
            label="Treat tab as"
            filled
            v-model="extensionOption"
            :options="extensionOptions"
            map-options
            emit-value
            style="width: 250px"
          />
        </q-card-section>
      </template>

      <q-card-actions align="right">
        <DialogButton label="Cancel" color="accent" v-close-popup/>
        <DialogButton label="Update"
                      @was-clicked="updateTab()"
                      v-close-popup/>
      </q-card-actions>

    </q-card>
  </q-dialog>

</template>

<script lang="ts" setup>

import {computed, PropType, ref, watchEffect} from "vue";
import {useTabsStore} from "src/stores/tabsStore";

import {useDialogPluginComponent} from 'quasar'
import {STRIP_CHARS_IN_USER_INPUT} from "boot/constants";
import {RenameTabsetCommand} from "src/domain/tabsets/RenameTabset";
import {useNotificationHandler} from "src/services/ErrorHandler";
import {useCommandExecutor} from "src/services/CommandExecutor";
import {SaveTabCommand} from "src/domain/tabs/SaveTab";
import {Tab, UrlExtension} from "src/models/Tab";
import {UpdateTabUrlCommand} from "src/domain/tabs/UpdateTabUrl";
import DialogButton from "components/buttons/DialogButton.vue";
import {ListDetailLevel, useUiStore} from "stores/uiStore";
import {usePermissionsStore} from "stores/permissionsStore";
import {useSettingsStore} from "stores/settingsStore";

defineEmits([
  ...useDialogPluginComponent.emits
])

const props = defineProps({
  tab: {type: Object as PropType<Tab>, required: true}
})

const {handleError} = useNotificationHandler()
const {dialogRef, onDialogHide, onDialogCancel} = useDialogPluginComponent()

const tabsStore = useTabsStore()

const newTabUrl = ref(props.tab.url || '')
const newTabName = ref(props.tab.name || props.tab.title)
const newTabDescription = ref(props.tab?.longDescription || props.tab?.description)
const newTabUrlExists = ref(false)
const hideWarning = ref(false)
const placeholders = ref<string[]>([])
const placeholderValues = ref<Map<string, string>>(new Map())

const placeholderReg = /\$\{(.*?)}/gm
const extensionOption = ref<UrlExtension>(UrlExtension[props.tab.extension as keyof typeof UrlExtension])

const extensionOptions = [
  {label: 'HTML', value: UrlExtension.HTML},
  {label: 'RSS', value: UrlExtension.RSS}
]

watchEffect(() => {
  newTabUrlExists.value = !!tabsStore.nameExistsInContextTabset(newTabUrl.value);
})

watchEffect(() => {
  placeholders.value = []
  for (const match of newTabUrl.value.matchAll(placeholderReg)) {
    const name = match[1]
    if (name && name.trim().length > 0) {
      placeholders.value.push(name)
      const value = props.tab?.placeholders?.config[name as keyof object] || ''
      placeholderValues.value.set(name, value)
    }
  }
})

watchEffect(() => {
  console.log("placeholderValues", placeholderValues.value)
})

const updateTab = () =>
  useCommandExecutor().executeFromUi(new UpdateTabUrlCommand(
    props.tab, newTabUrl.value,
    newTabName.value || '',
    newTabDescription.value || '',
    placeholders.value,
    placeholderValues.value,
    extensionOption.value
  ))


const newTabsetDialogWarning = () => {
  return (!hideWarning.value && newTabUrl.value !== props.tab.name && tabsStore.nameExistsInContextTabset(newTabUrl.value)) ?
    "Tabset already exists" : ""
}

const newTabUrlIsValid = computed(() => {
  //newTabUrl.value?.length <= 32 && !STRIP_CHARS_IN_USER_INPUT.test(newTabUrl.value)
  try {
    new URL(newTabUrl.value)
    return true
  } catch (e) {
    return false
  }
})

const updatePlaceholder = (placeholder: string, val: any) => {
  console.log("updateing", placeholder, val)
  placeholderValues.value.set(placeholder, val)
  console.log("placeholders", placeholders.value)
}

const modelFor = (ident: string) => placeholderValues.value.get(ident)

</script>
