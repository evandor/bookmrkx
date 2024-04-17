<template>

  <div class="cursor-pointer">
    <div
      class="q-ma-none q-pa-none text-subtitle q-pl-sm cursor-pointer ellipsis">
      {{ tabsetLabel() }}
      <q-tooltip class="tooltip_small">The currenly selected tabset</q-tooltip>
      <q-icon name="arrow_drop_down" class="q-mr-xs " size="xs"/>
    </div>

    <q-menu :offset="[0,0]">
      <q-list dense>

        <q-item disable v-if="tabsetsOptions.length > 0 && usePermissionsStore().hasFeature(FeatureIdent.SPACES)">
          {{ useSpacesStore().space?.label ? 'Tabsets of ' + useSpacesStore().space.label : 'Tabsets w/o Space' }}
        </q-item>
        <q-item disable
                v-else-if="!usePermissionsStore().hasFeature(FeatureIdent.SPACES)">
          Switch to other Tabset:
        </q-item>
        <q-item v-if="allTabsetsButCurrent.length > 10">
          <q-select
            filled
            :model-value="switchTabsetModel"
            use-input
            hide-selected
            fill-input
            input-debounce="0"
            :options="switchTabsetOptions"
            @filter="filterFn"
            @input-value="setModel"
            hint="Text autocomplete"
            style="width: 250px; padding-bottom: 32px">
            <template v-slot:no-option>
              <q-item>
                <q-item-section class="text-grey">
                  No results
                </q-item-section>
              </q-item>
            </template>
          </q-select>
        </q-item>
        <q-item v-else
                clickable v-for="ts in allTabsetsButCurrent"
                @click="switchToTabset(ts as Tabset)">
          {{ ts.name }}
        </q-item>

        <template v-if="usePermissionsStore().hasFeature(FeatureIdent.SPACES) && !useAsTabsetsSwitcher">
          <q-separator/>
          <q-item clickable @click.stop="router.push('/sidepanel/spaces')">
            Switch Space...
          </q-item>
        </template>

        <template v-if="!useAsTabsetsSwitcher">
          <q-separator/>
          <q-item clickable @click.stop="router.push('/sidepanel')">
            Show all Tabsets
          </q-item>
        </template>

        <template
          v-if="usePermissionsStore().hasFeature(FeatureIdent.BACKUP) || usePermissionsStore().hasFeature(FeatureIdent.IGNORE)">
          <q-separator/>
          <q-item disable>
            Special Tabsets
          </q-item>
          <q-item v-for="ts in tabsetsWithTypes([TabsetType.SPECIAL])" clickable v-close-popup
                  @click="switchTabset(ts)">
            <q-item-section class="q-ml-sm">{{ ts.name }}</q-item-section>
          </q-item>
        </template>

        <template v-if="!useAsTabsetsSwitcher">
          <q-separator/>
          <q-item clickable v-close-popup @click="openNewTabsetDialog()">
            <q-item-section>Add new Tabset</q-item-section>
          </q-item>
        </template>

        <q-separator/>
        <q-item v-if="tabsStore.currentTabsetName" clickable v-close-popup @click="openEditTabsetDialog()">
          <q-item-section>Edit Tabset Name</q-item-section>
        </q-item>

        <template v-if="!useAsTabsetsSwitcher">
          <q-separator/>
        </template>
      </q-list>
    </q-menu>
  </div>

</template>

<script lang="ts" setup>

import {ref, watchEffect} from "vue";
import {useRouter} from "vue-router";
import {useQuasar} from "quasar";
import _ from "lodash";
import {SelectTabsetCommand} from "src/domain/tabsets/SelectTabset";
import {useCommandExecutor} from "src/services/CommandExecutor";
import NewTabsetDialog from "components/dialogues/NewTabsetDialog.vue";
import {usePermissionsStore} from "src/stores/permissionsStore";
import {FeatureIdent} from "src/models/AppFeature";
import {Tabset, TabsetStatus, TabsetType} from "src/models/Tabset";

const props = defineProps({
  fromPanel: {type: Boolean, default: true},
  useAsTabsetsSwitcher: {type: Boolean, default: false}
})
const router = useRouter()
const $q = useQuasar()

const tabsetsOptions = ref<object[]>([])
const allTabsetsButCurrent = ref<Tabset[]>([])
const switchTabsetModel = ref(null)
const switchTabsetOptions = ref<string[]>([])


const filterFn = (val: any, update: any, abort: any) => {
  update(() => {
    const needle = val.toLocaleLowerCase()
    switchTabsetOptions.value = _.map(allTabsetsButCurrent.value as Tabset[], (ts: Tabset) => ts.name)
      .filter(v => v.toLocaleLowerCase().indexOf(needle) > -1)
  })
}

const setModel = (val: any) => {
  console.log("setting model", val)
  const found = _.filter(allTabsetsButCurrent.value as Tabset[], (ts: Tabset) => ts.name === val)
  if (found && found.length > 0) {
    console.log("setting model", found)
    switchTabsetModel.value = val
  }
}




</script>
