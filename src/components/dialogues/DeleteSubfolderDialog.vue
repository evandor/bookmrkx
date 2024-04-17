<template>
  <q-dialog ref="dialogRef" @hide="onDialogHide">
    <div>
        <q-card class="q-dialog-plugin" style="max-width:100%">
          <q-card-section>
            <div class="text-h6">Delete Folder</div>
          </q-card-section>
          <q-card-section>
            <div class="text-body">Would you like to delete the folder: {{ props.folder.name }} (and existing subfolders)?</div>
          </q-card-section>
          <q-card-actions align="right">

            <DialogButton label="Cancel" color="accent" v-close-popup/>
            <DialogButton label="Delete"
                          type="submit"
                          :autofocus="true"
                          @keyup.enter="deleteFolder()"
                          @wasClicked="deleteFolder()"
                          v-close-popup/>

          </q-card-actions>
        </q-card>
    </div>
  </q-dialog>

</template>

<script lang="ts" setup>

import {QForm, useDialogPluginComponent} from 'quasar'
import {useCommandExecutor} from "src/services/CommandExecutor";
import {MarkTabsetDeletedCommand} from "src/domain/tabsets/MarkTabsetDeleted";
import {SidePanelView, useUiStore} from "stores/uiStore";
import DialogButton from "components/buttons/DialogButton.vue";
import {PropType, ref} from "vue";
import {Tabset} from "src/models/Tabset";
import {DeleteTabsetFolderCommand} from "src/domain/tabsets/DeleteTabsetFolderCommand";

defineEmits([
  ...useDialogPluginComponent.emits
])


const props = defineProps({
  tabset: {type: Object as PropType<Tabset>, required: true},
  folder: {type: Object as PropType<Tabset>, required: true}
})

const {dialogRef, onDialogHide} = useDialogPluginComponent()

const theForm = ref<QForm>(null as unknown as QForm)

const deleteFolder = () => useCommandExecutor().executeFromUi(new DeleteTabsetFolderCommand(props.tabset, props.folder))
    .then((res: any) => {
        useUiStore().sidePanelSetActiveView(SidePanelView.MAIN)
      return res
    })


</script>
