<template>
  <q-dialog ref="dialogRef" @hide="onDialogHide">
    <q-card class="q-dialog-plugin">
      <q-card-section>
        <div class="text-h6">Tab Comment</div>
      </q-card-section>
      <q-card-section>
        <div class="text-body">Add a comment for this tab</div>
      </q-card-section>

      <q-card-section class="q-pt-none">

        <div class="q-pa-md q-gutter-sm">
          <!--          <q-editor v-model="editor" min-height="5rem" />-->

          <q-input
            v-model="editor"
            filled
            type="textarea"/>
        </div>

      </q-card-section>

      <q-card-actions align="right" class="text-primary">
        <q-btn flat label="Cancel" @click="onDialogCancel"/>
        <q-btn flat
               :label="props.sharedId ? 'Publish Comment' : 'Save Comment'"
               v-close-popup
               @click="publishComment()"/>
      </q-card-actions>


    </q-card>
  </q-dialog>

</template>

<script lang="ts" setup>

import {ref, watchEffect} from "vue";
import {date, useDialogPluginComponent, useQuasar} from "quasar";
import {useTabsStore} from "src/stores/tabsStore";
import {TabsetSharing} from "src/models/Tabset";
import {useCommandExecutor} from "src/services/CommandExecutor";
import {AddCommentCommand} from "src/domain/tabs/AddCommentCommand";

defineEmits([
  ...useDialogPluginComponent.emits
])

const props = defineProps({
  tabId: {type: String, required: true},
  sharedId: {type: String, required: false}
})

const editor = ref('')

const {dialogRef, onDialogHide, onDialogCancel} = useDialogPluginComponent()

const tabsStore = useTabsStore()
const $q = useQuasar()

const dateFormat = "YYYY-MM-DD HH:mm"
const newTabsetName = ref('')
const newTabsetNameExists = ref(false)

watchEffect(() => {
  newTabsetNameExists.value = !!tabsStore.nameExistsInContextTabset(newTabsetName.value);
})

const publishComment = () => useCommandExecutor().executeFromUi(new AddCommentCommand(props.tabId, editor.value))



</script>
