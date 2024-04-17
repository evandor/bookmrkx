<template>
  <q-dialog ref="dialogRef" @hide="onDialogHide">
    <q-card class="q-dialog-plugin">
      <q-card-section>
        <div class="text-h6">Tab Note</div>
      </q-card-section>
      <q-card-section>
        <div class="text-body">You can start or edit a note for this specific tab</div>
      </q-card-section>

      <q-card-section class="q-pt-none">

        <div class="q-pa-md q-gutter-sm">
          <!--          <q-editor v-model="editor" min-height="5rem" />-->

          <q-input
            v-model="editor"
            filled
            type="textarea"/>
        </div>

      </q-card-section>
      <q-card-section v-if="props.schedule">
        {{ scheduleFor }}
        <q-input filled v-model="scheduleFor">
          <template v-slot:prepend>
            <q-icon name="event" class="cursor-pointer">
              <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                <q-date v-model="scheduleFor" mask="YYYY-MM-DD HH:mm">
                  <div class="row items-center justify-end">
                    <q-btn v-close-popup label="Close" color="primary" flat/>
                  </div>
                </q-date>
              </q-popup-proxy>
            </q-icon>
          </template>

          <template v-slot:append>
            <q-icon name="access_time" class="cursor-pointer">
              <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                <q-time v-model="scheduleFor" mask="YYYY-MM-DD HH:mm" format24h>
                  <div class="row items-center justify-end">
                    <q-btn v-close-popup label="Close" color="primary" flat/>
                  </div>
                </q-time>
              </q-popup-proxy>
            </q-icon>
          </template>
        </q-input>
      </q-card-section>

      <q-card-actions align="right" class="text-primary">
        <q-btn flat label="Cancel" @click="onDialogCancel"/>
        <q-btn flat label="Save Note"
               v-close-popup
               @click="saveNote()"/>
      </q-card-actions>


    </q-card>
  </q-dialog>

</template>

<script lang="ts" setup>

import {ref, watchEffect} from "vue";
import TabsetService from "src/services/TabsetService";
import {date, useQuasar} from "quasar";
import {useRouter} from "vue-router";
import {useTabsStore} from "src/stores/tabsStore";

import {useDialogPluginComponent} from 'quasar'

defineEmits([
  ...useDialogPluginComponent.emits
])

const props = defineProps({
  tabId: {
    type: String,
    required: true
  },
  note: {
    type: String,
    default: ''
  },
  schedule: {
    type: Boolean,
    default: false
  }
})

const editor = ref(props.note)

const {dialogRef, onDialogHide, onDialogCancel} = useDialogPluginComponent()

const tabsStore = useTabsStore()
const router = useRouter()
const $q = useQuasar()

const dateFormat = "YYYY-MM-DD HH:mm"
const newTabsetName = ref('')
const newTabsetNameExists = ref(false)
const hideWarning = ref(false)
const scheduleFor = ref(date.formatDate(new Date().getTime(), dateFormat))

watchEffect(() => {
  newTabsetNameExists.value = !!tabsStore.nameExistsInContextTabset(newTabsetName.value);
})

const parseDate = (str: string): Date => {
  return date.extractDate(str, dateFormat)
}

const saveNote = () => {
  TabsetService.saveNote(props.tabId, editor.value, props.schedule ? parseDate(scheduleFor.value) : undefined)
    .then(() => {
      $q.notify({
        message: props.schedule ? 'The tab has been scheduled' : 'The note has been saved',
        type: 'positive'
      })
    })
    .catch(() => {
      $q.notify({
        message: 'There was a problem saving the note',
        type: 'negative'
      })
    })
}


</script>
