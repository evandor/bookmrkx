<template>

  <q-toolbar class="text-primary">
    <div class="row fit">
      <div class="col-xs-12 col-md-9">
        <q-toolbar-title>
          <div class="row justify-start items-baseline">
            <div class="col-1">
              {{ drawerLabel() }}
            </div>
          </div>
        </q-toolbar-title>
      </div>
      <div class="col-xs-12 col-md-3 q-ma-none q-mt-sm text-right">

        <q-icon
          v-if="!route.path.startsWith('/sidepanel/')"
          class="cursor-pointer" size="2em"
          name="chevron_right" @click="closeRightDrawer()">
          <q-tooltip class="tooltip">Hide this view</q-tooltip>
        </q-icon>

        <div class="row" v-if="tab === DrawerTabs.OPEN_TABS">
          <div class="col">
            <span class="text-caption ellipsis">{{ filter }}</span>
            <q-btn
              flat dense icon="o_filter_list"
              :color="filter ? 'secondary' : 'primary'"
              size="0.8em"
              class="q-ml-md q-mr-none">
              <q-tooltip v-if="filter">Apply Filter: '{{ filter }}'</q-tooltip>
              <q-tooltip v-else>Apply Filter</q-tooltip>
            </q-btn>
            <q-popup-edit v-model="filter" v-slot="scope">
              <q-input
                autofocus
                dense
                maxlength="9"
                v-model="scope.value"
                :model-value="scope.value"
                @update:model-value="val => setFilter2( val)"
                hint="Filter open Tabs"
                @keyup.enter="scope.set">
                <template v-slot:after>
                  <q-btn
                    flat dense color="warning" icon="cancel" v-close-popup
                    @click="cancelFilter()"
                  />
                </template>
              </q-input>
            </q-popup-edit>
          </div>
        </div>

      </div>
    </div>
  </q-toolbar>

  <div class="row greyBorderTop"></div>

<!--  <UnassignedAndOpenTabs v-if="tab === DrawerTabs.UNASSIGNED_TABS"/>-->
  <BookmarksTree v-if="tab === DrawerTabs.BOOKMARKS"/>
  <!--      <OpenTabs v-else-if="tab ===  DrawerTabs.OPEN_TABS" :filter="filter"/>-->
  <!--      <UnassignedTabs v-else-if="tab ===  DrawerTabs.UNASSIGNED_TABS" :filter="filter"/>-->
  <ByDomainList v-else-if="tab ===  DrawerTabs.GROUP_BY_HOST_TABS"/>
<!--  <SavedTabs v-else-if="tab ===  DrawerTabs.SAVED_TABS"/>-->
  <SavedPdfs v-else-if="tab ===  DrawerTabs.SAVED_TABS_AS_PDF"/>
<!--  <TabsetAsSidebar v-else-if="tab ===  DrawerTabs.SIDEBAR"/>-->
<!--  <NewTabUrls v-else-if="tab ===  DrawerTabs.NEW_TAB_URLS"/>-->
  <!--      <ScheduledTabs v-else-if="tab ===  DrawerTabs.SCHEDULED"/>-->
  <Features v-else-if="tab ===  DrawerTabs.FEATURES"/>
  <TabDetails v-else-if="tab ===  DrawerTabs.TAB_DETAILS"/>
  <TabsetDetails v-else-if="tab ===  DrawerTabs.TABSET_DETAILS"/>

  <TagsListViewer v-else-if="tab ===  DrawerTabs.TAGS_VIEWER"/>
  <TagListViewer v-else-if="tab ===  DrawerTabs.TAG_VIEWER"/>

  <TabsetHelp v-else-if="tab ===  DrawerTabs.HELP"/>

  <!-- only in sidepanel in chrome extension-->
  <!--  <TagsViewer v-else-if="tab ===  DrawerTabs.TAGS_VIEWER"/>-->

  <div v-else>unknown tab name '{{ tab }}' {{ typeof tab }}</div>

</template>

<script lang="ts" setup>
import {ref, watch, watchEffect} from "vue";
import {useRoute, useRouter} from "vue-router";
import {useSettingsStore} from "src/stores/settingsStore";
import {DrawerTabs, useUiStore} from "src/stores/uiStore";
import Features from "components/Features.vue";
import BookmarksTree from "components/BookmarksTree.vue";
import TabDetails from "components/views/TabDetails.vue";
import TabsetHelp from "components/TabsetHelp.vue";
import TabsetDetails from "components/views/TabsetDetails.vue";
import TagsListViewer from "components/views/TagsListViewer.vue";
import TagListViewer from "components/views/TagListViewer.vue";
import ByDomainList from "components/ByDomainList.vue";
import SavedPdfs from "components/SavedPdfs.vue";

const route = useRoute()

const settingsStore = useSettingsStore()

const openTabsCountRatio = ref(0)
const tab = ref<DrawerTabs>(useUiStore().rightDrawer.activeTab)
const filter = ref<string>('')

watchEffect(() => tab.value = useUiStore().rightDrawer.activeTab)

const drawerLabel = () => {
  switch (tab.value) {
    case DrawerTabs.BOOKMARKS:
      return "Bookmarks"
    case DrawerTabs.OPEN_TABS:
      return "Open Tabs"
    case DrawerTabs.UNASSIGNED_TABS:
      return "Tabs to add"
    case DrawerTabs.GROUP_BY_HOST_TABS:
      return "Grouped by Host"
    case DrawerTabs.SAVED_TABS:
      return "Saved Pages"
    case DrawerTabs.SAVED_TABS_AS_PDF:
      return "Saved PDFs"
    case DrawerTabs.SAVED_TABS_AS_PNG:
      return "Saved Images"
    case DrawerTabs.RSS:
      return "RSS Sidebar"
    case DrawerTabs.SCHEDULED:
      return "Scheduled"
    case DrawerTabs.HISTORY:
      return "History"
    case DrawerTabs.FEATURES:
      return "Add. Features"
    case DrawerTabs.TAB_DETAILS:
      return "Tab Details"
    case DrawerTabs.TABSET_DETAILS:
      return "Tabset Details"
    case DrawerTabs.NEW_TAB_URLS:
      return "Urls on New Tab Page"
    case DrawerTabs.HELP:
      return "Help"
    case DrawerTabs.TAGS_VIEWER:
      return "Tags Viewer"
    case DrawerTabs.TAG_VIEWER:
      return "Tag Viewer"
    default:
      return tab.value
  }
}

const cancelFilter = () => {
  console.log("cancelFilter")
  filter.value = ''
}
const setFilter2 = (newVal: string) => {
  console.log("newVal2", newVal)
  filter.value = newVal
}
// const closeCurrentView = () => useUiService().closeCurrentView()
const closeRightDrawer = () => useUiStore().rightDrawerOpen = false

</script>


