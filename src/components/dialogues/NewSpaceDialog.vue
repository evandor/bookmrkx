<template>
  <q-dialog ref="dialogRef" @hide="onDialogHide">
    <q-card class="q-dialog-plugin">
      <q-card-section>
        <div class="text-h6">Add new Space</div>
      </q-card-section>
      <q-card-section>
        <div class="text-body">A 'space' is a way to organize your tabsets. You can add tabsets to one or more spaces
          and select
          which space you want to be working on.
        </div>
      </q-card-section>
      <q-card-section>
        <div class="text-body">Please provide a name for the new space</div>
      </q-card-section>

      <q-card-section class="q-pt-none">
        <div class="text-body">New Space's name:</div>
        <q-input v-model="newSpaceName"
                 class="q-mb-none q-pb-none"
                 dense autofocus
                 error-message="Please do not use special Characters, maximum length is 32"
                 :error="!newSpaceNameIsValid"
                 data-testid="newSpaceName"
                 @keydown.enter="createNewSpace()"/>
        <div class="text-caption text-negative q-mt-none q-pt-none">{{ newSpaceDialogWarning() }}</div>

      </q-card-section>

      <q-card-actions align="right" class="text-primary">
        <q-btn flat label="Cancel" @click="onDialogCancel"/>
        <q-btn flat
               data-testid="newSpaceNameSubmit"
               label="Create new Space"
               :disable="newSpaceName.trim().length === 0 || newSpaceDialogWarning().length > 0" v-close-popup
               @click="createNewSpace()"/>
      </q-card-actions>


    </q-card>
  </q-dialog>

</template>

<script lang="ts" setup>

import {computed, ref, watchEffect} from "vue";
import {uid, useQuasar} from "quasar";
import {useRouter} from "vue-router";

import {useDialogPluginComponent} from 'quasar'
import {STRIP_CHARS_IN_USER_INPUT} from "boot/constants";
import {useSpacesStore} from "src/stores/spacesStore";

defineEmits([
  ...useDialogPluginComponent.emits
])

const props = defineProps({
  fromPanel: {type: Boolean, default: false}
})

const {dialogRef, onDialogHide, onDialogCancel} = useDialogPluginComponent()

const spacesStore = useSpacesStore()
const router = useRouter()
const $q = useQuasar()

const newSpaceName = ref('')
const newSpaceNameExists = ref(false)
const hideWarning = ref(false)

const newSpaceNameIsValid = computed(() => {
  return newSpaceName.value.length <= 32 && !STRIP_CHARS_IN_USER_INPUT.test(newSpaceName.value)
})

watchEffect(() => {
    newSpaceNameExists.value = !!spacesStore.nameExists(newSpaceName.value);
})

const createNewSpace = () => {
  hideWarning.value = true
  useSpacesStore().createSpace(newSpaceName.value)
    .then(() => {
      newSpaceName.value = ''
      let message = 'New Space ' + newSpaceName.value + ' created successfully'
      hideWarning.value = false
      if (!props.fromPanel) {
        router.push("/spaces")
      }
      $q.notify({
        message: message,
        type: 'positive'
      })
    }).catch((ex: any) => {
    console.error("ex", ex)
    hideWarning.value = false
    $q.notify({
      message: 'There was a problem creating the Space ' + newSpaceName.value,
      type: 'warning',
    })

  })
}

const newSpaceDialogWarning = () => {
  return (!hideWarning.value && spacesStore.nameExists(newSpaceName.value)) ?
    "Space's name already exists!" : ""
}


</script>
