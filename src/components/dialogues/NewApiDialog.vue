<template>
    <q-dialog ref="dialogRef" @hide="onDialogHide">

      <q-card class="q-dialog-plugin" style="max-width:100%">
        <q-card-section>
          <div class="text-h6">Add API</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <div class="text-body">Name:</div>
          <q-input v-model="newApiName"
                   class="q-mb-md q-pb-none"
                   dense autofocus
                   data-testid="newApiName">
            <template v-slot:hint>

            </template>
          </q-input>


        </q-card-section>



        <q-card-actions align="right">
          <DialogButton label="Cancel" color="primary" v-close-popup/>
          <DialogButton label="Add"
                        type="submit"
                        @click="createNewApi()"
                        v-close-popup/>
        </q-card-actions>

      </q-card>


    </q-dialog>
</template>

<script lang="ts" setup>

import {useDialogPluginComponent} from "quasar";
import DialogButton from "components/buttons/DialogButton.vue";
import {ref} from "vue";
import {useCommandExecutor} from "src/services/CommandExecutor";
import {AddApiCommand} from "src/domain/apis/AddApiCommand";

defineEmits([
  ...useDialogPluginComponent.emits
])

const props = defineProps({
  name: {type: String, default: ""}
})

const {dialogRef, onDialogHide} = useDialogPluginComponent()

const newApiName = ref(props.name)

const createNewApi = () => {
  console.log("new api", newApiName.value)
  useCommandExecutor().executeFromUi(new AddApiCommand(newApiName.value))
}
</script>
