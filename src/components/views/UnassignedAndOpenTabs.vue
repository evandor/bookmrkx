<!--<template>-->

<!--  <div v-if="!inBexMode()"-->
<!--       class="q-ma-sm bg-white text-grey" style="border: 1px dotted grey; border-radius: 3px">-->
<!--    <div class="q-pa-sm">-->
<!--      <div class="col text-caption">You are using the Web Version of Tabsets.-->
<!--      </div>-->
<!--    </div>-->
<!--  </div>-->

<!--  <div v-if="showMissingSomeTabsAction()"-->
<!--       class="q-ma-sm bg-white text-grey" style="border: 1px dotted grey; border-radius: 3px">-->
<!--    <div class="q-pa-sm">-->
<!--      <div class="col text-caption">Missing some of your tabs? Click-->
<!--        <span class="cursor-pointer text-blue-6" style="text-decoration: underline" @click="addOpenTabs">here</span>-->
<!--        to add the open ones of the browser-->
<!--      </div>-->
<!--    </div>-->
<!--  </div>-->

<!--  <div v-if="showStartingHint() && inBexMode()"-->
<!--       class="q-ma-sm bg-white text-grey" style="border: 1px dotted grey; border-radius: 3px">-->
<!--    <div class="q-pa-sm">-->
<!--      <div class="col text-caption">And now? Just open new tabs in your browser (and come back here to organize them in-->
<!--        tabsets)-->
<!--      </div>-->
<!--    </div>-->
<!--  </div>-->

<!--  <q-input v-if="!inBexMode()"-->
<!--           class="q-ma-md" dense-->
<!--           style="border: 1px dotted grey; border-radius: 5px;" type="textarea" v-model="dragTarget"/>-->

<!--  <InfoMessageWidget-->
<!--    v-if="tabsStore.currentTabsetId && unassignedTabs().length > 0 && !userCanSelect"-->
<!--    :probability="1"-->
<!--    css-class="q-pa-sm q-gutter-sm"-->
<!--    force-display-->
<!--    ident="unassignedAndOpenTabs_userCannotSelect"-->
<!--    hint="Tabs with grey background are already contained in the current tabset."/>-->

<!--  <div v-if="tabsStore.currentTabsetId && unassignedTabs().length > 1 && userCanSelect"-->
<!--       class="q-ma-xs" style="border: 1px dotted grey; border-radius: 3px">-->
<!--    <div class="row">-->
<!--      <div class="col-6 q-pa-xs">-->
<!--        <q-btn flat color="primary" size="11px" icon="keyboard_double_arrow_left"-->
<!--               :label="addLabel()"-->
<!--               @click="saveSelectedTabs()">-->
<!--          <q-tooltip class="tooltip" v-html="addTooltip()"></q-tooltip>-->
<!--        </q-btn>-->

<!--      </div>-->
<!--      <div class="col q-pa-xs text-right">-->

<!--        <q-checkbox v-if="useSelection"-->
<!--                    @update:model-value="val => toggleInvert(val)"-->
<!--                    rigth-label-->
<!--                    class="text-primary text-uppercase q-mr-lg"-->
<!--                    style="font-size: 11px"-->
<!--                    v-model="invert"-->
<!--                    color="primary"-->
<!--                    size="30px"-->
<!--                    label="invert"-->
<!--                    checked-icon="task_alt"-->
<!--                    unchecked-icon="check_box_outline_blank"-->
<!--        />-->

<!--        <q-checkbox-->
<!--          left-label-->
<!--          class="text-primary text-uppercase"-->
<!--          style="font-size: 11px"-->
<!--          v-model="useSelection"-->
<!--          color="primary"-->
<!--          size="30px"-->
<!--          :label="checkboxLabel()"-->
<!--          checked-icon="task_alt"-->
<!--          unchecked-icon="check_box_outline_blank"-->
<!--        />-->
<!--      </div>-->
<!--    </div>-->
<!--  </div>-->

<!--  <vue-draggable-next-->
<!--    :list="unassignedTabs()"-->
<!--    :group="{ name: 'tabs', pull: 'clone', put: false }"-->
<!--    :sort="true">-->

<!--    <div-->
<!--      class="col-12 q-pa-xs items-center justify-center" style="width:100%; max-width: 300px;cursor: move"-->
<!--      v-for="tab in unassignedTabs()"-->

<!--      :key="tab.id">-->

<!--      <OpenTabCard-->
<!--        v-on:selectionChanged="tabSelectionChanged"-->
<!--        v-on:addedToTabset="tabAddedToTabset"-->
<!--        v-on:hasSelectable="hasSelectable"-->
<!--        :tab="tab"-->
<!--        :useSelection="useSelection"/>-->

<!--    </div>-->

<!--  </vue-draggable-next>-->

<!--</template>-->
<!--<script setup lang="ts">-->
<!--import {useTabsStore} from "src/stores/tabsStore";-->
<!--import {Tab} from "src/models/Tab";-->
<!--import {Tabset} from "src/models/Tabset";-->
<!--import _ from "lodash";-->
<!--import {onMounted, ref, watchEffect} from "vue"-->
<!--import OpenTabCard from "components/layouts/OpenTabCard.vue";-->
<!--import {VueDraggableNext} from 'vue-draggable-next'-->
<!--import TabsetService from "src/services/TabsetService";-->
<!--import {uid, useQuasar} from "quasar";-->
<!--import AddUrlDialog from "components/dialogues/AddUrlDialog.vue";-->
<!--import {useUtils} from "src/services/Utils"-->
<!--import {useTabsetService} from "src/services/TabsetService2";-->
<!--import InfoMessageWidget from "components/widgets/InfoMessageWidget.vue";-->
<!--import {useRoute} from "vue-router";-->
<!--import {usePermissionsStore} from "src/stores/permissionsStore";-->
<!--import {FeatureIdent} from "src/models/AppFeature";-->

<!--const {inBexMode} = useUtils()-->

<!--const tabsStore = useTabsStore()-->
<!--const route = useRoute()-->
<!--const $q = useQuasar()-->

<!--const useSelection = ref(false)-->
<!--const invert = ref(false)-->
<!--const dragTarget = ref('')-->
<!--const userCanSelect = ref(false)-->

<!--const tabSelection = ref<Set<string>>(new Set<string>())-->

<!--function unassignedTabs(): Tab[] {-->
<!--  return _.filter(-->
<!--    tabsStore.pendingTabset?.tabs,-->
<!--    (tab: Tab) => {-->
<!--      if (usePermissionsStore().hasFeature(FeatureIdent.IGNORE)) {-->
<!--        const ignoreTS = useTabsetService().getTabset('IGNORE')-->
<!--        if (ignoreTS && tab.url !== undefined) {-->
<!--          const foundIndex = ignoreTS.tabs.findIndex((ignoreTab: Tab) =>-->
<!--            tab.url?.startsWith(ignoreTab.url || 'somestrangestring'))-->
<!--          if (foundIndex >= 0) {-->
<!--            console.log("ignoring", tab.url, ignoreTS.tabs[foundIndex].url)-->
<!--            return false-->
<!--          }-->
<!--        }-->
<!--      }-->
<!--      return true-->
<!--    })-->
<!--}-->

<!--watchEffect(() => {-->
<!--  userCanSelect.value = false-->
<!--})-->

<!--//onMounted(() => userCanSelect.value = false)-->

<!--watchEffect(() => {-->
<!--  // console.log("d&d", dragTarget.value)-->
<!--  if (dragTarget.value.trim() === "") {-->
<!--    return-->
<!--  }-->
<!--  try {-->
<!--    const url = new URL(dragTarget.value)-->
<!--    $q.dialog({component: AddUrlDialog, componentProps: {providedUrl: url.toString()}})-->
<!--  } catch (err) {-->
<!--    console.log("hier", err)-->
<!--  }-->
<!--  dragTarget.value = ''-->
<!--})-->

<!--const addTooltip = () => useSelection.value ?-->
<!--  `Add ${tabSelection.value.size} tab(s) to ${tabsStore.currentTabsetName}` :-->
<!--  `Add all tabs to ${tabsStore.currentTabsetName}`-->

<!--const deleteTabset = () => useSelection.value ?-->
<!--  `Remove ${tabSelection.value.size} tabs from this view` :-->
<!--  `Remove all tabs from this view`-->

<!--// const addLabel = () => useSelection.value ? 'add ' + tabSelection.value.size + ' tabs' : 'add'-->
<!--const addLabel = () => 'add'-->
<!--const checkboxLabel = () => useSelection.value ? '' : 'use selection'-->
<!--const tabSelectionChanged = (a: any) => {-->
<!--  const {tabId, selected} = a-->
<!--  if (selected) {-->
<!--    tabSelection.value.add(tabId)-->
<!--  } else {-->
<!--    tabSelection.value.delete(tabId)-->
<!--  }-->
<!--}-->

<!--const tabAddedToTabset = (a: any) => {-->
<!--  const {tabId, tabUrl} = a-->
<!--  tabSelection.value.delete(tabId)-->
<!--}-->

<!--const hasSelectable = () => userCanSelect.value = true-->


<!--const showMissingSomeTabsAction = () => {-->
<!--  if (process.env.MODE !== 'bex') {-->
<!--    return false-->
<!--  }-->
<!--  if (route?.query?.first) {-->
<!--    return false-->
<!--  }-->
<!--  if ((!tabsStore.pendingTabset || tabsStore.pendingTabset.tabs.length === 0) && (tabsStore.tabs?.length || 0) > 1) {-->
<!--    return true-->
<!--  }-->
<!--  return false-->
<!--}-->

<!--const showStartingHint = () => !showMissingSomeTabsAction() && tabsStore.pendingTabset?.tabs.length <= 1-->

<!--const saveSelectedTabs = () => {-->
<!--  TabsetService.saveSelectedPendingTabs()-->
<!--}-->

<!--const toggleInvert = (invert: boolean) => {-->
<!--  tabsStore.pendingTabset?.tabs.forEach(t => {-->
<!--    if (!useTabsetService().urlExistsInCurrentTabset(t.url || '')) {-->
<!--      t.selected = !t.selected-->
<!--      tabSelectionChanged({tabId: t.id, selected: t.selected})-->
<!--    }-->
<!--  })-->
<!--}-->

<!--const addOpenTabs = () => {-->
<!--  if (process.env.MODE !== 'bex') {-->
<!--    console.log("useTabsStore().pendingTabset", useTabsStore().pendingTabset)-->
<!--    useTabsStore().pendingTabset = new Tabset("dummy", "dummy", [])-->
<!--  } else {-->
<!--    TabsetService.createPendingFromBrowserTabs()-->
<!--  }-->
<!--}-->


<!--</script>-->

