<template>

  <!-- toolbar -->
  <q-toolbar class="text-primary" v-if="!tabsStore.currentTabsetId">
    <div class="row fit">
      <q-toolbar-title>
        <div class="row justify-start items-baseline">
          <div class="col-10"><span>Tabs</span> (no tabset selected)</div>
          <div class="col-2 text-right">
            <OpenRightDrawerWidget/>
          </div>
        </div>
      </q-toolbar-title>
    </div>
  </q-toolbar>
  <q-toolbar v-else> <!-- we've got a current tabset id -->
    <div class="row fit">
      <div class="col-xs-12 col-md-6 q-mt-xs">
        <q-toolbar-title>

          <template v-if="useUiStore().leftDrawerOpen">
            <!--            <span class="text-dark" v-if="$q.screen.gt.xs">Tabs of </span>-->
            <span
              class="text-primary text-weight-bold cursor-pointer"
              @mouseenter="showEditButton = true"
              @mouseout="showEditButton = false">
                  {{ tabsStore.currentTabsetName }}
                <span
                  v-if="tabset.sharedId"
                  class="text-caption">shared by {{
                    tabset.sharedBy
                  }}, {{ date.formatDate(tabset.sharedAt, 'DD.MM.YYYY HH:mm') }}</span>
                </span>
            <span v-if="tabset.sharedPath">
              <q-icon class="q-ml-md cursor-pointer" name="refresh" @click="router.push(tabset.sharedPath)">
                <q-tooltip class="tooltip-small">Refresh</q-tooltip>
              </q-icon>
            </span>

          </template>
          <template v-else>
            <TabsetsSelectorWidget/>
          </template>
          <q-icon v-if="showEditButton" style="position:relative;top:-11px;left:-5px" color="primary" name="edit"
                  size="16px"/>

        </q-toolbar-title>
      </div>
      <div class="col-xs-12 col-md-6 text-right">

        <q-btn v-if="showSorting()"
               @click="toggleSorting()"
               style="width:14px"
               class="q-mr-sm" size="10px"
               outline
               icon="o_sort_by_alpha">
          <q-tooltip>Toggle through sorting</q-tooltip>
        </q-btn>

        <q-btn v-if="showSorting()"
               :disable="tabset?.sorting === 'custom'"
               @click="toggleOrder()"
               style="width:14px"
               class="q-mr-xl" size="10px"
               outline
               :icon="orderDesc ? 'arrow_drop_up' : 'arrow_drop_down'">
          <q-tooltip>Sorting descending or ascending, currently {{ orderDesc }}</q-tooltip>
        </q-btn>


        <q-btn
          v-if="permissionsStore.hasFeature(FeatureIdent.EXPERIMENTAL_VIEWS) && tabset?.tabs.length > 0"
          @click="setView('exporter')"
          style="width:14px"
          class="q-mr-sm" size="10px"
          :flat="tabset?.view !== 'exporter'"
          :outline="tabset?.view === 'exporter'"
          icon="o_ios_share">
          <q-tooltip>Use the exporter layout if you want to copy and paste the urls of this tabset</q-tooltip>
        </q-btn>

        <!--        <q-separator vertical dark inset />-->
        <!--        <span>{{ useUiStore().tabsFilter }}</span>-->
        <q-btn
          v-if="tabsStore.currentTabsetId !== '' &&
                  tabsStore.getTabset(tabsStore.currentTabsetId) &&
                  tabsStore.getCurrentTabset?.tabs?.length > 10 &&
                  $q.screen.gt.xs"
          flat
          :text-color="useUiStore().tabsFilter ? 'secondary' : 'primary'"
          :disable="tabset?.type === TabsetType.DYNAMIC"
          :label="useUiStore().tabsFilter"
          class="cursor-pointer q-ml-lg" size="12px"
          icon="o_filter_alt">
          <q-popup-edit :model-value="useUiStore().tabsFilter" v-slot="scope"
                        @update:model-value="val => setFilter(  val)">
            <q-input v-model="scope.value" dense autofocus counter @keyup.enter="scope.set"/>
          </q-popup-edit>
          <q-tooltip
            class="tooltip"
            :delay="200"
            anchor="center left" self="center right">
            Filter this tabset
          </q-tooltip>
        </q-btn>

        <q-icon v-if="tabsStore.currentTabsetId !== '' &&
          tabset?.type !== TabsetType.DYNAMIC &&
          tabsStore.getTabset(tabsStore.currentTabsetId)"
                class="cursor-pointer" size="22px" color="warning"
                name="add_circle" @click="addUrlDialog">
          <q-tooltip
            class="tooltip"
            :delay="200"
            anchor="center left" self="center right">
            Copy and Paste or create a new Tab inside this tabset
          </q-tooltip>
        </q-icon>

        <OpenRightDrawerWidget/>
      </div>
    </div>
  </q-toolbar>

  <div class="row fit greyBorderTop"></div>

  <!--  <q-separator class="q-mb-md" />-->

  <!--  <q-banner rounded class="bg-amber-1 text-black q-ma-md"-->
  <q-banner rounded class="text-primary q-ma-md" style="border: 1px solid #efefef"
            v-if="!tabsStore.currentTabsetId && tabsStore.tabsets.size > 0">
    <div class="text-body2">
      Select an existing tabset from the list or create a new tabset.
    </div>
  </q-banner>

  <q-banner v-else-if="!$q.platform.is.bex && tabset?.tabs.length === 0">
    Click on the orange plus sign to add new tabs.
  </q-banner>

  <q-banner v-else-if="tabset?.tabs.length === 0 && tabset?.type !== TabsetType.DYNAMIC">
    To start adding new tabs to this empty tabset, open new browser tabs and come back to this extension to
    associate them with a tabset.<br><br>
    <!--If you want to assign your open tabs straight away, click <span class="cursor-pointer text-blue" @click="addOpenTabs()"><u>here</u></span>.-->
  </q-banner>

  <InfoMessageWidget
    v-if="tabset?.type === TabsetType.DYNAMIC"
    :probability="1"
    ident="tabsetPage_dynamicTabset"
    hint="This is a 'dynamic' Tabset, i.e. it gets its data from some kind of query (e.g. checking for tags in your tabsets) and is readonly for that reason."/>

  <InfoMessageWidget
    v-if="route?.query?.first && route.query.first === 'true' && tabset?.tabs.length > 0"
    :probability="1"
    ident="tabsetPage_firstTime"
    hint="Congrats - you created your first tabset. Your open tabs have been added automatically to get you started with tabsets!"/>

  <DynamicTabsetPageCards
    v-if="tabset?.type === TabsetType.DYNAMIC"
    :tabset="tabset as unknown as Tabset"/>

  <template v-else>
    <template v-if="tabset.page">
      <div class="editorx_body">
        <div id="editorjs"/>
      </div>
    </template>
    <TabsetPageCards :tabset="tabset as unknown as Tabset" :simple-ui="true"/>
  </template>

</template>

<script setup lang="ts">
import {onMounted, onUpdated, ref, unref, watchEffect} from 'vue'
import {useRoute, useRouter} from "vue-router";
import {date, openURL, uid, useQuasar} from "quasar";
import {useTabsStore} from "src/stores/tabsStore";
import TabsetService from "src/services/TabsetService";
import AddUrlDialog from "components/dialogues/AddUrlDialog.vue";
import {usePermissionsStore} from "src/stores/permissionsStore";
import InfoMessageWidget from "components/widgets/InfoMessageWidget.vue";
import {useCommandExecutor} from "src/services/CommandExecutor";
import {RenameTabsetCommand} from "src/domain/tabsets/RenameTabset";
import {Tabset, TabsetType} from "src/models/Tabset";
import {FeatureIdent} from "src/models/AppFeature";
import {ToggleSortingCommand} from "src/domain/tabsets/ToggleSorting";
import TabsetPageCards from "pages/TabsetPageCards.vue";
import OpenRightDrawerWidget from "components/widgets/OpenRightDrawerWidget.vue";
import JsUtils from "src/utils/JsUtils";
import {UserLevel, useUiStore} from "src/stores/uiStore";
import TabsetsSelectorWidget from "components/widgets/TabsetsSelectorWidget.vue";
import DynamicTabsetPageCards from "pages/DynamicTabsetPageCards.vue";
import {useTabsetService} from "src/services/TabsetService2";
import Analytics from "src/utils/google-analytics";
import EditorJS, {OutputData} from "@editorjs/editorjs";
import EditorJsConfig from "src/utils/EditorJsConfig";
import { useMeta } from 'quasar'

const route = useRoute()
const router = useRouter()
const tabsStore = useTabsStore()
const permissionsStore = usePermissionsStore()

const $q = useQuasar()

const tabsetId = ref(null as unknown as string)
const tabset = ref<Tabset>(new Tabset(uid(), "empty", []))
const orderDesc = ref(false)
const showEditButton = ref(false)

let editorJS2: EditorJS = undefined as unknown as EditorJS

const metaData = {
  // sets document title
  title: 'Index Page!',
  // optional; sets final title as "Index Page - My Website", useful for multiple level meta
  //titleTemplate: (tabset:Tabset) => `${tabset.name} - My Website`,

  // meta tags
  meta: {
    description: { name: 'description', content: 'Page 1' },
    keywords: { name: 'keywords', content: 'Quasar website' },
   // equiv: { 'http-equiv': 'Content-Type', content: 'text/html; charset=UTF-8' },
    // note: for Open Graph type metadata you will need to use SSR, to ensure page is rendered by the server
    ogTitle:  {
      property: 'og:title',
      content: 'sharing with tabsets'
    },
    ogImage: {
      property: 'og:image',
      template (tabset: Tabset) {
        console.log("tabset!!!", tabset)
        return `${tabset} - My Website`
      }
    }
  }
}

onMounted(() => {
  Analytics.firePageViewEvent('PwaTabsetPage', document.location.href);

  if (!editorJS2 && tabset.value.page) {
    // @ts-ignore
    editorJS2 = new EditorJS({
      holder: "editorjs",
      readOnly: true,
      minHeight: 1,
      data: (tabset.value.page || {}) as OutputData,
      tools: EditorJsConfig.toolsconfig
    });
    // if the editor is readonly from the start, I cannot update it when tabset.page changes
    // setTimeout(() => {
    //   editorJS2.readOnly.toggle(true)
    // }, 1000)
  }
})

//useMeta(metaData)

useMeta(() => {
  return {
    // whenever "title" from above changes, your meta will automatically update
    title: tabset.value.tabs.length > 0 ? tabset.value.tabs[0].title : '???',
    meta: {
      //description: {name: 'og:title', content: 'Page 1'},
      ogTitle:  {
        property: 'og:title',
        content: 'sharing with tabsets'
      },
      ogImage: {
        property: 'og:image',
        content: tabset.value.tabs.length > 0 ? tabset.value.tabs[0].image : ''
      }
    }
  }
})

onUpdated(() => {
  JsUtils.runCssHighlight()
})

watchEffect(() => {
  if (!route || !route.params) {
    return
  }
  tabsetId.value = route?.params.tabsetId as string
  tabset.value = useTabsetService().getTabset(tabsetId.value) || new Tabset(uid(), "empty", [])
  console.log("watch effect in tabsetpage", tabsetId.value)
})


const setNewName = (newValue: string) => useCommandExecutor().executeFromUi(new RenameTabsetCommand(tabsStore.currentTabsetId, newValue))

const setFilter = (newValue: string) => {
  console.log("filter", newValue)
  const useValue = newValue && newValue.trim().length > 0 ? newValue.trim() : undefined
  useUiStore().tabsFilter = useValue
  useUiStore().setHighlightTerm(useValue)
  JsUtils.runCssHighlight()
}


const addUrlDialog = () => $q.dialog({component: AddUrlDialog})

const setView = (view: string) => TabsetService.setView(tabsetId.value, view)

const toggleSorting = () => useCommandExecutor().executeFromUi(new ToggleSortingCommand(tabsetId.value))

const toggleOrder = () => orderDesc.value = !orderDesc.value

const showSorting = () => tabsStore.getCurrentTabs.length > 10 && $q.screen.gt.xs

</script>

<style>
.material-symbols-outlined {
  font-variation-settings: 'FILL' 0,
  'wght' 400,
  'GRAD' 0,
  'opsz' 48
}

.editorx_body {
  max-width: 1000px;
  margin-left: 72px;
  box-sizing: border-box;
  border: 0 solid #eee;
  border-radius: 5px;
  padding: 10px;
  /*box-shadow: 10px 10px 6px 18px #e8edfa80;*/
}

.ce-block__content,
.ce-toolbar__content {
  max-width: none;
}

.ce-paragraph {
  font-size: 16px;
}

/* editorjsColumns */

.ce-editorjsColumns_col {
  border: 1px solid #eee;
  border-radius: 5px;
  gap: 10px;
  padding-top: 10px;
}

.ce-editorjsColumns_col:focus-within {
  box-shadow: 0 6px 18px #e8edfa80;
}

@media (max-width: 800px) {
  .ce-editorjsColumns_wrapper {
    flex-direction: column;
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 4px;
  }
}

.ce-inline-toolbar {
  z-index: 1000
}

.ce-block__content,
.ce-toolbar__content {
  max-width: calc(100% - 50px);
}

/*   */
.ce-toolbar__actions {
  right: calc(100% + 30px);
  background-color: rgba(255, 255, 255, 0.5);
  border-radius: 4px;
}

/* Would be better to remove --narrow mode */
/* Issue Raised */
/* // This causes an error which is good i think? */
.codex-editor--narrow .codex-editor__redactor {
  margin: 0;
}

/* Required to prevent clipping */
.ce-toolbar {
  z-index: 4;
}

.codex-editor {
  /* background:#f00 !important; */
  z-index: auto !important;
}


</style>
