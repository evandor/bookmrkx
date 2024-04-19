<template>
  <q-toolbar class="text-primary q-pa-none q-pl-sm q-pr-xs q-pb-none greyBorderBottom" :style="offsetTop()">
    <q-toolbar-title>
      <div class="row q-ma-none q-pa-none">

        <div class="col q-ma-none q-pa-none">


          <div class="col-12 text-subtitle1">
            <slot name="title">{{ props.title }}</slot>
          </div>

        </div>

        <div class="col text-subtitle1 text-right q-ma-none q-pa-none q-pr-sm" v-if="!useUiStore().appLoading">

          <slot name="iconsRight">

            <template v-if="showSearchIcon()">
              <SidePanelToolbarButton icon="search"
                                      id="toggleSearchBtn"
                                      size="11px"
                                      @click="toggleSearch"/>
              <span class="q-ma-none q-pa-none q-mx-sm text-grey-5">|</span>
            </template>

          </slot>
        </div>
      </div>
    </q-toolbar-title>
  </q-toolbar>
</template>

<script lang="ts" setup>

import {useRouter} from "vue-router";
import {ref, watchEffect} from "vue";
import {useUiStore} from "stores/uiStore";
import {useQuasar} from "quasar";
import SidePanelToolbarButton from "components/buttons/SidePanelToolbarButton.vue";

const props = defineProps({
  title: {type: String, default: "My Tabsets"},
  forceTitle: {type: Boolean, default: false},
  showSearchBox: {type: Boolean, default: false},
  searchTerm: {type: String, default: ''},
  searchHits: {type: Number, required: false}
})

const $q = useQuasar()
const router = useRouter()

const searching = ref(false)
const windowLocation = ref('')

const toggleSearch = () => {
  searching.value = !searching.value
  if (searching.value) {
    router.push("/sidepanel/search")
  } else {
    router.push("/sidepanel")
  }
}

windowLocation.value = window.location.href

watchEffect(() => {
  if (props.showSearchBox && !searching.value) {
    searching.value = true
  }
})

if ($q.platform.is.chrome && $q.platform.is.bex) {
  chrome.commands.onCommand.addListener((command) => {
    if (command === 'search') {
      console.debug(`got Command: ${command}`);
      toggleSearch()
    }
  })
}

const showSearchIcon = () => true

const showSyncInfo = () => false

const offsetTop = () => ($q.platform.is.capacitor || $q.platform.is.cordova) ? 'margin-top:40px;' : ''

</script>

<style scoped>

.v-enter-active,
.v-leave-active {
  transition: opacity 3.5s ease;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
}

</style>
