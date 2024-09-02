<template>

  <div :class="cssClass" v-if="showHint()">
    <q-banner inline-actions rounded class="text-primary" style="border: 1px solid grey">
      <div class="row q-pa-xs">
        <div class="2">
          <q-icon name="o_lightbulb" color="warning" size="1.3em"/>
        </div>
        <div class="col text-right cursor-pointer" @click="hideMessage(props.ident)">x
          <q-tooltip>close this info message</q-tooltip>
        </div>
      </div>
      <div class="row q-pa-xs">
        <div class="2"></div>
        <div class="col text-caption">
          {{ props.hint }}
          <slot></slot>
        </div>
      </div>
    </q-banner>
  </div>

</template>

<script lang="ts" setup>
import {useUiStore} from "src/ui/stores/uiStore";

const props = defineProps({
  ident: {type: String, required: true},
  hint: {type: String, required: false},
  cssClass: {type: String, default: 'q-pa-md q-gutter-sm'},
  // even if this is set to 1.0, showMessage might return "false", e.g.
  // when another message is already shown
  probability: {type: Number, default: 1},
  // the hint is shown unless it has been disabled by the user
  forceDisplay: {type: Boolean, default: false}
})
const uiStore = useUiStore()

const hideMessage = (ident: string) => useUiStore().hideInfoMessage(ident)

const showHint = () => uiStore.showMessage(props.ident, props.probability, props.forceDisplay)

</script>
