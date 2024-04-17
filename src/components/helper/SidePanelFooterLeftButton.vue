<template>
  <q-btn v-if="showButton()"
         :icon="props.icon"
         :class="leftButtonClass()"
         flat
         :color="isActive() ? 'secondary':''"
         :size="props.size"
         @click="toggleView()">
    <q-tooltip v-if="props.tooltip"
               :delay="700"
               anchor="top middle" self="bottom middle" class="tooltip-small">{{ props.tooltip }}</q-tooltip>
    <slot></slot>
  </q-btn>

</template>

<script lang="ts" setup>

import {SidePanelView, useUiStore} from "stores/uiStore";
import {PropType} from "vue";
import {useRouter} from "vue-router";

const props = defineProps({
  sidePanelView: {type: Object as PropType<SidePanelView>, required: true},
  icon: {type: String, required: true},
  size: {type: String, default: "9px"},
  tooltip: {type: String, required: false}
})

const router = useRouter()

const isActive = () => useUiStore().sidePanelIsActive(props.sidePanelView)
const activateView = (view: SidePanelView) => useUiStore().sidePanelSetActiveView(view)

const showButton = () => props.sidePanelView?.showButton()
//const leftButtonClass = () => "q-my-xs q-ml-xs q-mr-none q-px-xs"
const leftButtonClass = () => "q-my-xs q-px-xs q-mr-none"

const toggleView = () => {
  if (isActive()) {
    activateView(SidePanelView.MAIN)
    router.push("/sidepanel")
  } else {
    activateView(props.sidePanelView)
    router.push("/sidepanel/" + props.sidePanelView)
  }
}


</script>
