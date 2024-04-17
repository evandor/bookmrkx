<template>
  <div class="row" v-for="f in props.features">
    <div class="col-2">
      <q-icon name="check" />
    </div>
    <div class="col-10 text-subtitle2" >
      {{f}}
    </div>
  </div>
</template>

<script lang="ts" setup>

const props = defineProps({
  features: {type: Array<string>, default: []}
})

</script>