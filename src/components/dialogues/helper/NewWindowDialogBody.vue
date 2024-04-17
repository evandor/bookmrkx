<template>
  <div>
    <q-form @submit.prevent="createNewWindow()" ref="theForm">

      <q-card class="q-dialog-plugin" style="max-width:100%">
        <q-card-section>
          <div class="text-h6">Associate Window</div>
        </q-card-section>

        <q-card-section>
          <div class="text-caption">Provide a new name for a window you can open tabs in</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <div class="text-body">Name:</div>
          <q-input v-model="newWindowName"
                   class="q-mb-md q-pb-none"
                   dense autofocus
                   @update:model-value="val => checkIsValid()"
                   :rules="[
                       val => newWindowNameIsValid(val) || 'Please do not use special Characters',
                       val => newWindowNameIsShortEnough(val) || 'the maximum length is 32',
                       val => doesNotExistYet(val) || 'Window Name already exists'
                       ]"
                   data-testid="newWindowName"/>

        </q-card-section>

        <q-card-actions align="right">
          <q-btn label="Cancel" size="sm" color="accent" v-close-popup/>
          <q-btn type="submit" size="sm" color="warning"
                 data-testid="newWindowNameSubmit"
                 :disable="!isValid"
                 label="Add"
                 v-close-popup/>
        </q-card-actions>

      </q-card>
    </q-form>
  </div>
</template>

<script lang="ts" setup>

import {useTabsStore} from "stores/tabsStore";
import {useRouter} from "vue-router";
import {QForm, uid, useDialogPluginComponent, useQuasar} from "quasar";
import {STRIP_CHARS_IN_USER_INPUT} from "boot/constants";
import {Tabset, TabsetStatus} from "src/models/Tabset";
import {ref, watchEffect} from "vue";
import {useCommandExecutor} from "src/services/CommandExecutor";
import {useWindowsStore} from "src/stores/windowsStore";
import {AssociateWindowWithTabsetCommand} from "src/domain/tabsets/AssociateWindowWithTabsetCommand";

const {dialogRef, onDialogHide, onDialogCancel} = useDialogPluginComponent()

const props = defineProps({
  tabsetId: {type: String, required: true}
})

const tabsStore = useTabsStore()
const router = useRouter()

const newWindowName = ref('')
const isValid = ref(false)
const addAllOpenTabs = ref(false)
const theForm = ref<QForm>(null as unknown as QForm)
const windowModel = ref<string>('current')
const windowOptions = ref<string[]>([])

watchEffect(() => {
  const windows: Set<string> = useWindowsStore().windowSet
  windowOptions.value = []
  windowOptions.value.push('current')
  const sortedWindowNames = Array.from(windows).sort();
  sortedWindowNames.forEach(windowName => {
    if (windowName !== "current") {
      windowOptions.value.push(windowName)
    }
  })
})

const checkIsValid = () => {
  if (theForm.value) {
    theForm.value.validate()
        .then((res) => {
          isValid.value = res
        })
  }
}

const newWindowNameIsValid = (val: string) => !STRIP_CHARS_IN_USER_INPUT.test(val)
const newWindowNameIsShortEnough = (val: string) => val ? val.length <= 32 : true

const doesNotExistYet = (val: string) => !useWindowsStore().windowSet.has(val)

const createNewWindow = () => {
  useCommandExecutor()
      .executeFromUi(new AssociateWindowWithTabsetCommand(props.tabsetId, newWindowName.value))
}

</script>
