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
                My Tabsets!
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



    </div>
  </div>


</template>

<script setup lang="ts">

import {useQuasar} from "quasar";
import {useUiStore} from "src/stores/uiStore";
import {usePermissionsStore} from "src/stores/permissionsStore";
import {FeatureIdent} from "src/models/FeatureIdent";

const $q = useQuasar();

$q.loadingBar.setDefaults({
  color: 'green',
  size: '10px',
  position: 'bottom'
})

</script>

