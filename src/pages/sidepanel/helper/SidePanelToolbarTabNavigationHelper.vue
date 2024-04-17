<template>
  <template v-if="usePermissionsStore().hasFeature(FeatureIdent.OPEN_TABS)">
    <SidePanelToolbarButton
        icon="chevron_left"
        tooltip="Back to last tab"
        @click="NavigationService.backOneTab()"/>

    <SidePanelToolbarButton
        icon="chevron_right"
        tooltip="Return to tab before"
        @click="NavigationService.forwardOneTab()"/>

    <span class="q-ma-none q-pa-none q-mx-sm text-grey-5">|</span>
  </template>
</template>
<script setup lang="ts">
import {usePermissionsStore} from "stores/permissionsStore";
import {FeatureIdent} from "src/models/AppFeature";
import NavigationService from "src/services/NavigationService";
import SidePanelToolbarButton from "components/buttons/SidePanelToolbarButton.vue";
</script>
