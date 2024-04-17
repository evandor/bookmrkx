<template>

  <q-item v-if="showItem()"
          @click="toggleView()"
          :disable="props.disable"
          dense clickable v-close-popup>
    <q-item-section avatar>
      <q-icon :color="isActive() ? 'primary':'secondary'" :name="props.icon" size="xs"/>
    </q-item-section>
    <q-item-section>{{ props.label }}</q-item-section>
  </q-item>

</template>

<script lang="ts" setup>

import {SidePanelView, useUiStore} from "stores/uiStore";
import {PropType} from "vue";
import {useRouter} from "vue-router";

const props = defineProps({
  sidePanelView: {type: Object as PropType<SidePanelView>, required: true},
  icon: {type: String, required: true},
  size: {type: String, default: "9px"},
  label: {type: String, required: true},
  disable: {type: Boolean, default: false},
  tooltip: {type: String, required: false}
})

const router = useRouter()

const isActive = () => useUiStore().sidePanelIsActive(props.sidePanelView)
const activateView = (view: SidePanelView) => useUiStore().sidePanelSetActiveView(view)

const showItem = () => props.sidePanelView?.showButton()

const toggleView = () => {
  if (isActive()) {
    activateView(SidePanelView.MAIN)
    router.push("/sidepanel")
  } else {
    activateView(props.sidePanelView)
    props.sidePanelView === SidePanelView.MAIN ?
      router.push("/sidepanel") :
      router.push("/sidepanel/" + props.sidePanelView)
  }
}


</script>

<style scoped>
.q-item__section--avatar {
  padding-right:4px !important;
  min-width:30px !important;
  margin-bottom:0;
}
</style>
