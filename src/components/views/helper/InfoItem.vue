<template>

  <q-item clickable v-ripple>
    <q-item-section class="q-mb-md">
      <q-item-label overline>{{ props.title }}</q-item-label>
      <q-item-label caption>{{ props.value }}</q-item-label>
    </q-item-section>
  </q-item>
</template>

<script lang="ts" setup>

const props = defineProps({
  title: {type: String, default: ""},
  value: {type: String, default: ""}
})

</script>
