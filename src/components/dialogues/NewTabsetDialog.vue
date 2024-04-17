<template>
    <q-dialog ref="dialogRef" @hide="onDialogHide">

    </q-dialog>
</template>

<script lang="ts" setup>

import {useDialogPluginComponent} from "quasar";

defineEmits([
  ...useDialogPluginComponent.emits
])

const props = defineProps({
  spaceId: {type: String, required: false},
  name: {type: String, default: ""},
  windowId: {type: Number, required: false},
  fromPanel: {type: Boolean, default: false}
})

const {dialogRef, onDialogHide} = useDialogPluginComponent()

</script>
