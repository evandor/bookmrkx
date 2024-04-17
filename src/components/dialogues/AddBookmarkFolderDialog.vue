<template>
  <q-dialog ref="dialogRef" @hide="onDialogHide">
    <q-card class="q-dialog-plugin">
      <q-card-section>
        <div class="text-h6">Add Bookmark Folder</div>
      </q-card-section>
      <q-card-section>
        <div class="text-body">Please provide the name of the new Folder</div>
      </q-card-section>

      <q-card-section class="q-pt-none">
        <div class="text-body">Name:</div>
        <q-input dense v-model="folderName"
                 data-testid="add_folder_input"
                 autofocus @keyup.enter="createNewFolder()"/>
      </q-card-section>

      <q-card-actions align="right" class="text-primary">
        <q-btn flat label="Cancel" v-close-popup/>
        <q-btn flat label="Add Folder"
               data-testid="add_folder_submit"
               :disable="folderName.trim().length === 0" v-close-popup
               @click="createNewFolder()"/>
      </q-card-actions>
    </q-card>

  </q-dialog>

</template>

<script lang="ts" setup>

import {ref, watchEffect} from "vue";

import {useDialogPluginComponent} from 'quasar'
import {useCommandExecutor} from "src/services/CommandExecutor";
import {CreateBookmarkFolderCommand} from "src/domain/commands/CreateBookmarkFolderCommand";

defineEmits([
  ...useDialogPluginComponent.emits
])

const props = defineProps({
  parentFolderId: {type: String, required: true}
})

const {dialogRef, onDialogHide, onDialogOK, onDialogCancel} = useDialogPluginComponent()
const folderName = ref('')

const createNewFolder = () => {
  useCommandExecutor().execute(new CreateBookmarkFolderCommand(folderName.value, props.parentFolderId))
  onDialogOK()
}

</script>
