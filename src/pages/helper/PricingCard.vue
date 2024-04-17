<template>
  <q-card class="my-card" flat bordered>
    <q-card-section horizontal>
      <q-card-section class="q-pt-xs">
        <div class="text-overline">
          <slot name="overline">Personal Use</slot>
        </div>
        <div class="text-h5 q-mt-sm q-mb-xs">
          <slot name="title">Basic</slot>
        </div>
        <div class="text-subtitle1 text-grey" style="min-height:100px;">
          <slot name="teaser">Teaser Placeholder</slot>
        </div>
      </q-card-section>


    </q-card-section>

    <q-card-section horizontal>
      <q-card-section class="q-pt-xs" style="width:100%">
        <div class="text-h5 q-mt-sm q-mb-md text-bold">
          <slot name="price">0 &euro;</slot>
        </div>
        <div class="text-caption text-grey" style="min-height:180px">
          <slot name="features" />
        </div>
      </q-card-section>


    </q-card-section>

    <q-separator />

    <q-card-actions style="min-height:70px" class="justify-center">
      <slot name="actions"/>
    </q-card-actions>
  </q-card>

</template>

<script lang="ts" setup>


</script>

<style lang="sass" scoped>
.my-card
  width: 100%
  max-width: 250px
</style>
