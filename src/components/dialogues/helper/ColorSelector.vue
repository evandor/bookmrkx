<template>
  <div class="col cursor-pointer"
       v-for="c in colors"
       :style="colorStyle(c.ident)"
       @click="setColor(c.ident)">
    &nbsp;
    <template>
      <q-icon class="q-pl-xs" color="white" name="done"></q-icon>
    </template>
  </div>
  <div class="col cursor-pointer"
       @click="setColor(undefined)"
       style="border: 1px solid grey; max-height:22px;max-width:12px">
    <template>
      <q-icon class="q-pl-xs" color="white" name="done"></q-icon>
    </template>
  </div>
</template>

<script lang="ts" setup>

import {ref} from "vue";

const props = defineProps({
  selectedColor: {type: String, required: false}
})

const emit = defineEmits(['colorSet'])

const theColor = ref<string | undefined>(props.selectedColor || undefined)

const colors = ref([
  {ident: "#ff6666", name: 'blue'},
  {ident: "#ffb366", name: 'green'},
  {ident: "#ffff66", name: 'yellow'},
  {ident: "#66ff66", name: 'orange'},
  {ident: "#66ffb3", name: 'orange'},
  {ident: "#66ffff", name: 'orange'},
  {ident: "#66b3ff", name: 'orange'},
  {ident: "#6666ff", name: 'orange'},
  {ident: "#b366ff", name: 'orange'},
  {ident: "#ff66ff", name: 'orange'}
])

const setColor = (color: string | undefined) => {
  console.log(`setting color to '${color}'`)
  theColor.value = color
  emit('colorSet', color)
}

const colorStyle = (c: string) =>
    theColor.value === c ?
        'background-color: ' + c + ';max-height:32px;max-width:14px;border:2px solid grey;border-radius: 2px' :
        'background-color: ' + c + ';max-height:22px;max-width:12px;border:1px solid grey;border-radius: 2px'


</script>