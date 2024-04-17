<template>
  <div class="column" style="height:100%">
    <div class="col">

      <q-toolbar>
        <div class="row fit">
          <div class="col-xs-12 col-md-6">
            <q-toolbar-title>
              <div class="row justify-start items-baseline" v-if="usePermissionsStore().hasFeature(FeatureIdent.SPACES)">
                <SpacesSelectorWidget />
              </div>
              <div class="row justify-start items-baseline" v-else>
                My Tabsets
              </div>
            </q-toolbar-title>
          </div>
          <div class="col-xs-12 col-md-6 text-right">

            <q-icon
              class="cursor-pointer" size="22px" color="warning"
              style="position: relative;top:5px;right:-2px"
              name="add_circle" @click="addTabset">
              <q-tooltip
                class="tooltip"
                :delay="200"
                anchor="center left" self="center right">
                {{ usePermissionsStore().hasFeature(FeatureIdent.SPACES) ?
                  'Click here to add a new tabset to the current Space':
                  'Click here to add a new tabset'}}
              </q-tooltip>
            </q-icon>

          </div>
        </div>
      </q-toolbar>


      <q-list class="q-mt-none greyBorderTop">
        <NavTabsetsListWidgetNonBex :tabsets="tabsets()" :space-id="useSpacesStore().space?.id || undefined"/>
      </q-list>

      <q-separator v-if="tabsetsWithTypes([TabsetType.SPECIAL]).length > 0"/>

      <NavTabsetsListWidgetNonBex :tabsets="tabsetsWithTypes([TabsetType.SPECIAL])"/>

    </div>
  </div>


</template>

<script setup lang="ts">

import {useRouter} from "vue-router";
import _ from "lodash"
import {ref} from "vue";
import {useQuasar} from "quasar";
import {Tabset, TabsetStatus, TabsetType} from "src/models/Tabset";
import NewTabsetDialog from "components/dialogues/NewTabsetDialog.vue";
import {useUiStore} from "src/stores/uiStore";
import {useNotificationsStore} from "src/stores/notificationsStore";
import {usePermissionsStore} from "src/stores/permissionsStore";
import {useUtils} from "src/services/Utils";
import NavTabsetsListWidgetNonBex from "components/widgets/NavTabsetsListWidgetNonBex.vue";
import {FeatureIdent} from "src/models/AppFeature";
import {useSettingsStore} from "src/stores/settingsStore"
import SpacesSelectorWidget from "components/widgets/SpacesSelectorWidget.vue";

const $q = useQuasar();

$q.loadingBar.setDefaults({
  color: 'green',
  size: '10px',
  position: 'bottom'
})


const addTabset = () => $q.dialog({
  component: NewTabsetDialog, componentProps: {
    setEmptyByDefault: useUiStore().newTabsetEmptyByDefault
  }
})

</script>

