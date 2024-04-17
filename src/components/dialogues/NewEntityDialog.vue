<template>
    <q-dialog ref="dialogRef" @hide="onDialogHide">

      <q-card class="q-dialog-plugin" style="max-width:100%">
        <q-card-section>
          <div class="text-h6">Add Entity</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <div class="text-body">Name:</div>
          <q-input v-model="newEntityName"
                   class="q-mb-md q-pb-none"
                   dense autofocus
                   data-testid="newEntityName">
            <template v-slot:hint>

            </template>
          </q-input>


        </q-card-section>



        <q-card-actions align="right">
          <DialogButton label="Cancel" color="primary" v-close-popup/>
          <DialogButton label="Add"
                        type="submit"
                        @click="createNewEntity()"
                        v-close-popup/>
        </q-card-actions>

      </q-card>


    </q-dialog>
</template>

<script lang="ts" setup>

import {useDialogPluginComponent} from "quasar";
import {Tabset} from "src/models/Tabset";
import {usePermissionsStore} from "stores/permissionsStore";
import {FeatureIdent} from "src/models/AppFeature";
import ColorSelector from "components/dialogues/helper/ColorSelector.vue";
import DialogButton from "components/buttons/DialogButton.vue";
import {ref} from "vue";
import {useCommandExecutor} from "src/services/CommandExecutor";
import {AddEntityCommand} from "src/domain/entites/AddEntityCommand";

defineEmits([
  ...useDialogPluginComponent.emits
])

const props = defineProps({
  name: {type: String, default: ""}
})

const {dialogRef, onDialogHide} = useDialogPluginComponent()

const newEntityName = ref(props.name)

const createNewEntity = () => {
  console.log("new entity", newEntityName.value)
  useCommandExecutor().executeFromUi(new AddEntityCommand(newEntityName.value))
}
</script>
