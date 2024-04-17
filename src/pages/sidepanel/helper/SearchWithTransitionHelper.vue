<template>
  <Transition
              appear
              enter-active-class="animated fadeInRight"
              leave-active-class="animated fadeOutRight">
    <SearchWidget2
      :search-term="props.searchTerm"
      :search-hits="props.searchHits"
      style="position: absolute; left:10px;top:5px;max-width:260px"/>
  </Transition>

</template>

<script lang="ts" setup>

import SearchWidget2 from "components/widgets/SearchWidget2.vue";
import {ref} from "vue";

const props = defineProps({
  searchTerm: {type: String, default: ''},
  searchHits: {type: Number, required: false}
})

</script>
