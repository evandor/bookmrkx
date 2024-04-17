<template>
  <q-btn
      :icon="props.icon"
      flat
      class="q-ma-none q-pa-xs cursor-pointer"
      style="max-width:18px"
      :size="props.size">
    <q-tooltip class="tooltip" v-if="props.tooltip">{{props.tooltip}}</q-tooltip>
  </q-btn>
</template>
<script setup lang="ts">

const props = defineProps({
  icon: {type: String, required: true},
  tooltip: {type: String, required: false},
  size: {type: String, default: "13px"}
})
</script>