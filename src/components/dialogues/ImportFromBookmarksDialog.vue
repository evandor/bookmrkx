<template>
  <q-dialog ref="dialogRef" @hide="onDialogHide">
    <ImportFromBookmarksDialogBody
      :in-side-panel="props.inSidePanel"
      :foldersCount="props.foldersCount"
      :count="props.count"/>
  </q-dialog>
</template>

<script lang="ts" setup>

import {useDialogPluginComponent} from "quasar";
import ImportFromBookmarksDialogBody from "components/dialogues/helper/ImportFromBookmarksDialogBody.vue";

defineEmits([
  ...useDialogPluginComponent.emits
])

const props = defineProps({
  inSidePanel: {type: Boolean, default: false},
  count: {type: Number, default: 0},
  foldersCount: {type: Number, default: 0}
})

const {dialogRef, onDialogHide} = useDialogPluginComponent()

</script>
