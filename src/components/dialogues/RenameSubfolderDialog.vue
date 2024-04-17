<template>
  <q-dialog ref="dialogRef" @hide="onDialogHide">
    <q-card class="q-dialog-plugin">
      <q-card-section>
        <div class="text-h6">Subfolder</div>
      </q-card-section>
      <q-card-section>
        <div class="text-body">You can provide a new name for this subfolder</div>
      </q-card-section>

      <q-card-section class="q-pt-none">
        <q-input dense v-model="newSubfolderName" autofocus @keydown.enter="updateSubfolder()"
                 error-message="Please do not use special Characters, maximum length is 32"
                 :error="!newSubfolderNameIsValid" />
      </q-card-section>

      <q-card-actions align="right" class="text-primary">
        <q-btn label="Cancel" size="sm" color="accent" @click="onDialogCancel"/>
        <q-btn label="Update" size="sm" color="warning"
               :disable="disableSubmit()"
               v-close-popup
               @click="updateSubfolder()"/>
      </q-card-actions>


    </q-card>
  </q-dialog>

</template>

<script lang="ts" setup>

import {computed, PropType, ref, watchEffect} from "vue";
import {useDialogPluginComponent} from "quasar";
import {useTabsStore} from "src/stores/tabsStore";
import {STRIP_CHARS_IN_USER_INPUT} from "boot/constants";
import {useCommandExecutor} from "src/services/CommandExecutor";
import {RenameWindowCommand} from "src/domain/tabsets/RenameWindow";
import {ExecutionResult} from "src/domain/ExecutionResult";
import {Tabset} from "src/models/Tabset";
import {RenameFolderCommand} from "src/domain/tabsets/RenameFolderCommand";

defineEmits([
  ...useDialogPluginComponent.emits
])

const props = defineProps({
  tabset: {type: Object as PropType<Tabset>, required: true},
  folder: {type: Object as PropType<Tabset>, required: true},
  name: {type: String, default: ''}
})

const {dialogRef, onDialogOK, onDialogHide, onDialogCancel} = useDialogPluginComponent()

const tabsStore = useTabsStore()

const newSubfolderName = ref(props.name)
const newSubfolderNameExists = ref(false)
const hideWarning = ref(false)

watchEffect(() => {
  newSubfolderNameExists.value = !!tabsStore.nameExistsInContextTabset(newSubfolderName.value);
})

const updateSubfolder = () => useCommandExecutor()
  .executeFromUi(new RenameFolderCommand(props.tabset, props.folder, newSubfolderName.value))
  // .then((result: ExecutionResult<string>) => {
  //   onDialogOK({ name: newSubfolderName.value })
  // })

const newSubfolderNameIsValid = computed(() =>
  newSubfolderName.value?.length <= 32 && !STRIP_CHARS_IN_USER_INPUT.test(newSubfolderName.value))

const disableSubmit = (): boolean => {
  return newSubfolderName.value.trim().length === 0
}

</script>

<style lang="sass" scoped>
.my-input
  max-width: 250px
</style>
