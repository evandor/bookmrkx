<template>
    <q-dialog ref="dialogRef" @hide="onDialogHide">
      <NewWindowDialogBody :tabset-id="props.tabsetId" />
    </q-dialog>
</template>

<script lang="ts" setup>

import {useDialogPluginComponent} from "quasar";
import NewWindowDialogBody from "components/dialogues/helper/NewWindowDialogBody.vue";

defineEmits([
  ...useDialogPluginComponent.emits
])

const props = defineProps({
  tabsetId: {type: String, required: true}
})

const {dialogRef, onDialogHide} = useDialogPluginComponent()

</script>
