<template>
  <q-dialog ref="dialogRef" @hide="onDialogHide">
    <div>
      <q-form>
        <q-card class="q-dialog-plugin" style="max-width:100%">
          <q-card-section>
            <div class="text-h6">Change Monitor</div>
          </q-card-section>
          <q-card-section>
            <div class="text-body">Activate Monitoring for Changes on this website. This might not be accurate in many
              cases.
            </div>
          </q-card-section>

          <q-card-section class="q-pt-none" v-if="usePermissionsStore().hasFeature(FeatureIdent.SAVE_TAB_AS_PNG) &&
              (!tab.monitor || tab.monitor?.type === MonitoringType.NONE)">
            <div class="q-ma-none q-pa-none">

              <q-item tag="label" class="q-ma-none q-pa-none" v-ripple>
                <q-item-section avatar top>
                  <q-checkbox v-model="snapshot"/>
                </q-item-section>
                <q-item-section>
                  <q-item-label>Create Snapshot</q-item-label>
                  <q-item-label caption>
                    You can create an image for later comparison
                  </q-item-label>
                </q-item-section>
              </q-item>

              <q-item tag="label" class="q-ma-none q-pa-none q-mt-sm" v-ripple v-if="snapshot">
                <q-item-section avatar top>
                  <q-checkbox v-model="agree"/>
                </q-item-section>
                <q-item-section>
                  <q-item-label>Agree to terms</q-item-label>
                  <q-item-label caption>
                    The websites content will be sent to our servers to create an image which is saved back on
                    your browser. Nothing is stored on the server side.
                  </q-item-label>
                </q-item-section>
              </q-item>
            </div>
          </q-card-section>

          <q-card-section class="q-pt-none">
            <div class="q-pa-md q-gutter-sm" v-if="tab.placeholders === undefined && tab.monitor?.type === MonitoringType.CONTENT_HASH">
              This website is being monitored
            </div>
            <div class="q-pa-md q-gutter-sm text-red" v-if="tab.placeholders">
              Tabs with Placeholders cannot be monitored for changes, these URLs will be ignored for now.
            </div>
          </q-card-section>

          <!--          <q-card-section class="q-pt-none">-->
          <!--            <div class="q-pa-md q-gutter-sm" v-if="tab.monitor?.type === MonitoringType.CONTENT_HASH">-->
          <!--              {{ notifications }}-->
          <!--            </div>-->
          <!--          </q-card-section>-->

          <q-card-actions align="right" class="text-primary">
            <DialogButton label="Cancel" color="accent" v-close-popup/>
            <DialogButton :label="tab.monitor ? 'Stop':'Start'"
                          :disable="snapshot ? !agree : false"
                          @wasClicked="tab.monitor ? setMonitoring(MonitoringType.NONE) : setMonitoring(MonitoringType.CONTENT_HASH)"
                          v-close-popup/>
          </q-card-actions>

        </q-card>
      </q-form>
    </div>
  </q-dialog>

</template>

<script lang="ts" setup>

import {PropType, ref, watchEffect} from "vue";
import {QForm, useDialogPluginComponent} from "quasar";
import {useCommandExecutor} from "src/services/CommandExecutor";
import {MonitoringType} from "src/models/Monitor";
import {UpdateMonitoringCommand} from "src/domain/monitoring/UpdateMonitoringCommand";
import {Tab} from "src/models/Tab";
import {usePermissionsStore} from "stores/permissionsStore";
import {FeatureIdent} from "src/models/AppFeature";
import DialogButton from "components/buttons/DialogButton.vue";
import {SavePngCommand} from "src/domain/tabs/SavePng";
import {useTabsetService} from "src/services/TabsetService2";
import {NoOpCommand} from "src/domain/commands/NoOpCommand";
import {Suggestion, SuggestionState} from "src/models/Suggestion";
import {useSuggestionsStore} from "stores/suggestionsStore";
import _ from "lodash"

defineEmits([
  ...useDialogPluginComponent.emits
])

const props = defineProps({
  tab: {type: Object as PropType<Tab>, required: true},
  note: {type: String, default: ''}
})

const {dialogRef, onDialogHide, onDialogCancel} = useDialogPluginComponent()

const snapshot = ref(false)
const agree = ref(false)
const notifications = ref<Suggestion[]>([])

watchEffect(() => {
  if (props.tab) {
    notifications.value = _.filter(useSuggestionsStore()
        .getSuggestions([SuggestionState.NOTIFICATION, SuggestionState.CHECKED]), (s: Suggestion) => {
      return s.url === props.tab?.url
    })
  }
})

const setMonitoring = (type: MonitoringType) => {
  if (type === MonitoringType.CONTENT_HASH && agree.value &&
      usePermissionsStore().hasPermission('pageCapture') &&
      usePermissionsStore().hasFeature(FeatureIdent.SAVE_TAB_AS_PNG)) {
    useCommandExecutor()
        .execute(snapshot.value ?
            new SavePngCommand(props.tab, "monitoring start") :
            new NoOpCommand())
        .then(() => {
          useCommandExecutor().executeFromUi(new UpdateMonitoringCommand(props.tab, type, snapshot.value, {}))
          useTabsetService().saveCurrentTabset()
        })
        .catch((err) => {
          useCommandExecutor().executeFromUi(new UpdateMonitoringCommand(props.tab, type, false, {
            monitoringSnapshotError: err
          }))
        })
  } else {
    useCommandExecutor().executeFromUi(new UpdateMonitoringCommand(props.tab, type))
  }

}

</script>
