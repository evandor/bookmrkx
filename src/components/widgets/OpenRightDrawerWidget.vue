<template>
  <q-icon v-if="!uiStore.rightDrawerOpen && useUiStore().userLevel === UserLevel.DEFAULT"
          class="cursor-pointer q-ml-lg" size="1.3em"
          name="chevron_left" @click="openRightDrawer()">
    <q-tooltip class="tooltip">Show the right drawer again</q-tooltip>
  </q-icon>
</template>

<script lang="ts" setup>

import {UserLevel, useUiStore} from "src/ui/stores/uiStore";

const uiStore = useUiStore()

const openRightDrawer = () => {
  console.log("opening drawer...")
  useUiStore().rightDrawerOpen = true
}

</script>
