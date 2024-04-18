<template>
  <q-dialog ref="dialogRef" @hide="onDialogHide">
    <q-card class="q-dialog-plugin">
      <q-card-section>
        <div class="text-h6">Window</div>
      </q-card-section>
      <q-card-section>
        <div class="text-body">You can provide a new name for this window</div>
      </q-card-section>

      <q-card-section class="q-pt-none">
        <q-input dense v-model="newWindowName" autofocus @keydown.enter="updateWindow()"
                 error-message="Please do not use special Characters, maximum length is 32"
                 :error="!newWindowNameIsValid" />
<!--        <div class="text-body2 text-warning">{{ newTabsetDialogWarning() }}</div>-->
      </q-card-section>

      <q-card-actions align="right" class="text-primary">
        <q-btn label="Cancel" size="sm" color="accent" @click="onDialogCancel"/>
        <q-btn label="Update" size="sm" color="warning"
               :disable="disableSubmit()"
               v-close-popup
               @click="updateWindow()"/>
      </q-card-actions>


    </q-card>
  </q-dialog>

</template>

<script lang="ts" setup>

import {computed, ref} from "vue";
import {useDialogPluginComponent} from "quasar";
import {STRIP_CHARS_IN_USER_INPUT} from "boot/constants";

defineEmits([
  ...useDialogPluginComponent.emits
])

const props = defineProps({
  windowId: {type: Number, required: true},
  currentName: {type: String, required: true},
  index: {type: Number, required: true}
})

const {dialogRef, onDialogOK, onDialogHide, onDialogCancel} = useDialogPluginComponent()

const newWindowName = ref(props.currentName)

const newWindowNameIsValid = computed(() =>
  newWindowName.value?.length <= 32 && !STRIP_CHARS_IN_USER_INPUT.test(newWindowName.value))

const disableSubmit = (): boolean => {
  return newWindowName.value.trim().length === 0
}

</script>

<style lang="sass" scoped>
.my-input
  max-width: 250px
</style>
