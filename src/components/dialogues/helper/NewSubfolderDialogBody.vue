<template>
  <div>
    <q-form @submit.prevent="submit()" ref="theForm">

      <q-card class="q-dialog-plugin" style="max-width:100%">
        <q-card-section>
          <div class="text-h6">Add Folder</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <div class="text-body">Name:</div>
          <q-input v-model="newFolderName"
                   class="q-mb-md q-pb-none"
                   dense autofocus
                   @update:model-value="(val:string | number | null) => checkIsValid()"
                   :rules="[
                       (val:string) => val.trim() !== '.' && val.trim() !== '..' || 'This is a reserved name',
                       (val:string) => Tabset.newTabsetNameIsValid(val) || 'Please do not use special Characters',
                       (val:string) => Tabset.newTabsetNameIsShortEnough(val) || 'the maximum length is 32',
                       (val:string) => doesNotExistYet(val) || 'Folder already exists...'
                       ]">
            <template v-slot:hint>
              <span class="text-negative"></span>
            </template>
          </q-input>

          <template v-if="inBexMode()">
            <q-checkbox
              data-testid="newTabsetAutoAdd"
              v-model="addAllOpenTabs">
              <slot><span>Add all open tabs</span></slot>
            </q-checkbox>
            &nbsp;
            <q-icon name="help" color="primary" size="1em">
              <q-tooltip>If you select this option, all currently open tabs will be added to the new folder</q-tooltip>
            </q-icon>
          </template>
        </q-card-section>

        <q-card-actions align="right">
          <DialogButton label="Cancel" color="primary" v-close-popup/>
          <DialogButton label="Add"
                        type="submit"
                        :disable="!isValid" v-close-popup/>
        </q-card-actions>

      </q-card>
    </q-form>
  </div>
</template>

<script lang="ts" setup>

import {useTabsStore} from "stores/tabsStore";
import {useRouter} from "vue-router";
import {QForm, useDialogPluginComponent} from "quasar";
import {Tabset, TabsetStatus} from "src/models/Tabset";
import {ref, watchEffect} from "vue";
import {useCommandExecutor} from "src/services/CommandExecutor";
import {useUtils} from "src/services/Utils";
import DialogButton from "components/buttons/DialogButton.vue";
import {CreateFolderCommand} from "src/domain/tabsets/CreateFolderCommand";

const {dialogRef, onDialogHide, onDialogCancel} = useDialogPluginComponent()
const {inBexMode} = useUtils()

const props = defineProps({
  name: {type: String, default: ""},
  tabsetId: {type: String, required: true},
  parentFolder: {type: String, required: false}
})

const tabsStore = useTabsStore()
const router = useRouter()

const newFolderName = ref(props.name)
const isValid = ref(false)
const addAllOpenTabs = ref(false)
const theForm = ref<QForm>(null as unknown as QForm)
const theColor = ref<string | undefined>(undefined)

const checkIsValid = () => {
  if (theForm.value) {
    theForm.value.validate()
      .then((res) => {
        isValid.value = res
      })
  }
}

const doesNotExistYet = (val: string) => {
  const existsInTabset = tabsStore.existingInTabset(val)
  return !(existsInTabset && existsInTabset.status !== TabsetStatus.DELETED && existsInTabset.status !== TabsetStatus.ARCHIVED)
}

const submit = () => {
  console.log("submit", addAllOpenTabs.value, tabsStore.tabs)

  let tabsToUse = addAllOpenTabs.value ? tabsStore.tabs : []

  useCommandExecutor()
    .executeFromUi(new CreateFolderCommand(newFolderName.value, tabsToUse, props.tabsetId, props.parentFolder))
    .then((res) => {

      if (!addAllOpenTabs.value) {
       // TabsetService.createPendingFromBrowserTabs()
      } else {
        if (tabsStore.pendingTabset) {
          // clear pending tabset - why necessary?
         // tabsStore.pendingTabset.tabs = []
        }
      }
      //useUiStore().sidePanelSetActiveView(SidePanelView.MAIN)
      //router.push("/sidepanel?first=")
    })

}

</script>
