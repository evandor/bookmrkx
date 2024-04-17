<template>
  <q-dialog ref="dialogRef" @hide="onDialogHide">
    <q-card class="q-dialog-plugin">
      <q-card-section>
        <div class="text-h6">Sharing a Tabset</div>
      </q-card-section>
      <q-card-section>
        <div class="text-body">Would you like to share the tabset {{ props.tabsetName }} with someone?</div>
      </q-card-section>

      <q-card-section>
        <div class="text-body">Invite by email address:</div>
        <q-input v-model="invitationEmail"
                 class="q-mb-md q-pb-none"
                 dense autofocus
                 type="email"
                 error-message="Please do not use special Characters, maximum length is 32"
                 @keydown.enter="invite()"/>
      </q-card-section>

      <q-card-actions align="right" class="text-primary">
        <q-btn size="md" color="accent" label="Cancel" @click="onDialogCancel"/>
        <q-btn size="md" color="warning"  label="Share Tabset"
               v-close-popup
               @click="invite()"/>
      </q-card-actions>
    </q-card>
  </q-dialog>

</template>

<script lang="ts" setup>

import {useDialogPluginComponent} from 'quasar'
import {useCommandExecutor} from "src/services/CommandExecutor";
import {ref} from "vue";
import {ShareTabsetCommand} from "src/domain/tabsets/ShareTabsetCommand"

defineEmits([
  ...useDialogPluginComponent.emits
])

const props = defineProps({
  tabsetId: {
    type: String,
    required: true
  },
  tabsetName: {
    type: String,
    required: true
  }
})

const {dialogRef, onDialogHide, onDialogCancel} = useDialogPluginComponent()
const invite = () => useCommandExecutor().executeFromUi(new ShareTabsetCommand(invitationEmail.value, props.tabsetName, props.tabsetId, "author"))
const invitationEmail = ref('')

</script>
