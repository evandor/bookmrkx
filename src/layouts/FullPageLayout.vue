<template>
  <q-layout view="hHh LpR lFr">
    <q-header elevated>
      <q-toolbar class="">

        <template v-if="leftDrawerOpen">
          <q-img
            class="q-ml-xs q-mr-none cursor-pointer" style="margin-top:-7px"
            @click="toggleLeftDrawer"
            src="favicon.ico" height="32px" width="32px">
            <q-tooltip class="tooltip">Toggle the tabset list view by clicking here</q-tooltip>
          </q-img>

          <q-toolbar-title>
            {{ title() }}
          </q-toolbar-title>
        </template>
        <!-- left drawer closed -->
        <template v-else>
          <q-icon
            class="q-ml-xs q-mr-none cursor-pointer"
            name="menu" size="18px" @click="toggleLeftDrawer">
            <q-tooltip class="tooltip">Toggle the tabset list view by clicking here</q-tooltip>
          </q-icon>
        </template>


        <q-space/>

        <span
          v-if="useSuggestionsStore().getSuggestions([SuggestionState.NEW, SuggestionState.DECISION_DELAYED]).length > 0">
          <q-btn
            flat
            :color="dependingOnStates()"
            name="rss" icon="o_assistant">
            <q-tooltip class="tooltip" anchor="center right" self="center left" :delay="200">You have suggestions
            </q-tooltip>
            <q-badge
              :label="useSuggestionsStore().getSuggestions([SuggestionState.NEW, SuggestionState.DECISION_DELAYED]).length"/>
          </q-btn>
          <q-menu :offset="[0, 7]">
            <q-list style="min-width: 200px">
              <q-item clickable v-close-popup v-ripple @click="suggestionDialog(s)"
                      v-for="s in useSuggestionsStore().getSuggestions([SuggestionState.NEW, SuggestionState.DECISION_DELAYED])">
                <q-item-section avatar>
                  <q-icon color="primary" :name="s.img ? s.img : 'rss_feed'"/>
                </q-item-section>
                <q-item-section>
                  <div>{{ s.title }}</div>
                  <div class="text-caption">{{ s.msg }}</div>
                </q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </span>

        <div>
          <q-btn
            @click="toggleSettings"
            flat
            size="12px"
            class="q-mr-md" icon="o_settings">
          </q-btn>

        </div>

      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" side="left" behavior="desktop" bordered>
      <Navigation></Navigation>
    </q-drawer>

    <q-drawer v-model="useUiStore().rightDrawerOpen" side="right" bordered
              content-class="column justify-between no-wrap bg-grey-1">
      <DrawerRight/>
    </q-drawer>

    <q-page-container>
      <router-view/>
      <!--      <div id="fixed-footer" class="q-pl-md q-pa-xs">{{ useUiStore().footerInfo }}</div>-->
    </q-page-container>

  </q-layout>

</template>

<script setup lang="ts">
import {ref, watchEffect} from 'vue';
import {useMeta, useQuasar} from "quasar";
import {useRouter} from "vue-router";
import Navigation from "src/components/Navigation.vue"
import _ from "lodash";
import {useUiStore} from "src/stores/uiStore";
import {useUtils} from "src/services/Utils";
import DrawerRight from "components/DrawerRight.vue";
import {Suggestion, SuggestionState} from "src/models/Suggestion";
import SuggestionDialog from "components/dialogues/SuggestionDialog.vue";
import {useSuggestionsStore} from "src/stores/suggestionsStore";

const $q = useQuasar()
const router = useRouter()

const leftDrawerOpen = ref($q.screen.gt.lg)

const suggestions = ref<Suggestion[]>(useSuggestionsStore().getSuggestions([SuggestionState.NEW, SuggestionState.DECISION_DELAYED]))

const {inBexMode} = useUtils()

$q.loadingBar.setDefaults({
  color: 'positive',
  size: '10px',
  position: 'top'
})

const settingsClicked = ref(false)

watchEffect(() => {
  suggestions.value = useSuggestionsStore().getSuggestions([SuggestionState.NEW, SuggestionState.DECISION_DELAYED])
})

useMeta(() => {
  return {
    // @ts-ignore
    title: 'Tabsets Extension' //+ appVersion
  }
})


const title = () => {
  return inBexMode() ? 'Tabsets' : process.env.MODE === 'spa' ?
    'Tabsets Web' : 'Tabsets'
}

const goHome = () => router.push("/")

const toggleLeftDrawer = () => {
  leftDrawerOpen.value = !leftDrawerOpen.value
  useUiStore().toggleLeftDrawer()
}

const suggestionDialog = (s: Suggestion) => $q.dialog({
  component: SuggestionDialog, componentProps: {
    suggestion: s
  }
})

const dependingOnStates = () =>
  _.find(useSuggestionsStore().getSuggestions([SuggestionState.NEW, SuggestionState.DECISION_DELAYED]), s => s.state === SuggestionState.NEW) ? 'warning' : 'white'

const toggleSettings = () => settingsClicked.value = !settingsClicked.value

</script>
