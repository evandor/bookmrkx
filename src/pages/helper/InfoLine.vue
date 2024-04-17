<template>
  <div class="col-3">
    {{ props.label }}
  </div>
  <div class="col-7">
    <slot></slot>
  </div>
  <div class="col"></div>
</template>

<script lang="ts" setup>
const props = defineProps({
  label: {type: String, required: false}
})
</script>
