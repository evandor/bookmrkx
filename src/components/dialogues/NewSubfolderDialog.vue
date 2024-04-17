<template>
    <q-dialog ref="dialogRef" @hide="onDialogHide">
      <NewSubfolderDialogBody
        :name="props.name"
        :tabsetId="props.tabsetId"
        :parentFolder="props.parentFolder"
        />
    </q-dialog>
</template>

<script lang="ts" setup>

import {useDialogPluginComponent} from "quasar";
import NewSubfolderDialogBody from "components/dialogues/helper/NewSubfolderDialogBody.vue";

defineEmits([
  ...useDialogPluginComponent.emits
])

const props = defineProps({
  name: {type: String, default: ""},
  tabsetId: {type: String, required: true},
  parentFolder: {type: String, required: false},
})

const {dialogRef, onDialogHide} = useDialogPluginComponent()

</script>
