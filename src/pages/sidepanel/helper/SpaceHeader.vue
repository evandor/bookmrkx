<template>
  <q-item-section
    @mouseover="hoveredSpace = props.spaceId"
    @mouseleave="hoveredSpace = undefined">
    <q-item-label :class="spacesStore.space?.id === props.spaceId ? 'text-bold text-primary' : ''">
      <q-icon
        color="positive"
        name="o_space_dashboard"
        style="position: relative;top:-2px"/>
      {{ props.spaceLabel }}
    </q-item-label>
    <q-item-label class="text-caption text-grey-5">
      {{ props.caption }}
    </q-item-label>
  </q-item-section>
</template>

<script lang="ts" setup>

import {useSpacesStore} from "stores/spacesStore";
import {ref, watchEffect} from "vue";
import {Tabset, TabsetStatus} from "src/models/Tabset";

const props = defineProps({
  spaceId: {type: String, required: true},
  caption: {type: String, required: true},
  spaceLabel: {type: String, required: true}
})

const spacesStore = useSpacesStore()
const hoveredSpace = ref<string | undefined>(undefined)

</script>
