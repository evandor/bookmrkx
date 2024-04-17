<template>
  <q-dialog ref="dialogRef" @hide="onDialogHide">
    <q-card class="q-dialog-plugin">
      <q-card-section>
        <div class="text-h6">Comment</div>
      </q-card-section>
      <q-card-section>
        <div class="text-body">Publish a comment</div>
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

      <q-card-section>
        <div class="text-body">Author:</div>
        <q-input v-model="author"
                 class="q-mb-md q-pb-none"
                 dense autofocus
                 type="text"
                 error-message="Please do not use special Characters, maximum length is 32"/>
      </q-card-section>


      <q-card-actions align="right" class="text-primary">
        <q-btn flat label="Cancel" @click="onDialogCancel"/>
        <q-btn flat
               label="Publish Comment"
               v-close-popup
               :disable="!author || !editor"
               @click="publishComment()"/>
      </q-card-actions>


    </q-card>
  </q-dialog>

</template>

<script lang="ts" setup>

import {ref, watchEffect} from "vue";
import {date, LocalStorage, useDialogPluginComponent, useQuasar} from "quasar";
import {useTabsStore} from "src/stores/tabsStore";
import {useCommandExecutor} from "src/services/CommandExecutor";
import {AddCommentCommand} from "src/domain/tabs/AddCommentCommand";
import {useUiStore} from "stores/uiStore";
import {SHARING_AUTHOR_IDENT} from "boot/constants";

defineEmits([
  ...useDialogPluginComponent.emits
])

const props = defineProps({
  tabId: {type: String, required: true},
  sharedId: {type: String, required: false}
})

const $q = useQuasar()

const editor = ref('')
const author = ref<string>(LocalStorage.getItem(SHARING_AUTHOR_IDENT) || '')

const {dialogRef, onDialogHide, onDialogCancel} = useDialogPluginComponent()

const tabsStore = useTabsStore()

const dateFormat = "YYYY-MM-DD HH:mm"
const newTabsetName = ref('')
const newTabsetNameExists = ref(false)

watchEffect(() => {
  newTabsetNameExists.value = !!tabsStore.nameExistsInContextTabset(newTabsetName.value);
})

const publishComment = () => {
  //$q.localStorage.set('sharing.author', author.value)
  useUiStore().sharingAuthor = author.value
  useCommandExecutor().executeFromUi(new AddCommentCommand(props.tabId, editor.value))
}


</script>
