<template>
  <q-list dense
          class="rounded-borders q-ma-none q-pa-none" :key="tabset.id"
          v-for="(tabset,index) in props.tabsets">
    <q-expansion-item v-if="showTabset(tabset as Tabset)"
                      header-class="q-ma-none q-pa-none q-pr-md"
                      :header-style="headerStyle(tabset as Tabset)"
                      group="tabsets"
                      :default-opened="tabsStore.tabsets.size === 1"
                      switch-toggle-side
                      expand-icon-toggle
                      dense-toggle
                      v-model="selected_model[tabset.id]"
                      @update:model-value="val => updateSelectedTabset(tabset.id, val, index)">

      <template v-slot:header>
        <q-item-section
          class="q-mt-xs"
          @mouseover="hoveredTabset = tabset.id"
          @mouseleave="hoveredTabset = undefined">
          <q-item-label :class="tabsStore.currentTabsetId === tabset.id ? 'text-bold text-underline' : ''">
            <q-icon v-if="tabset.status === TabsetStatus.FAVORITE"
                    color="warning"
                    name="push_pin"
                    style="position: relative;top:-2px">
              <q-tooltip class="tooltip">This tabset is pinned for easier access</q-tooltip>
            </q-icon>
            {{ tabsetSectionName(tabset as Tabset) }}
            <span v-if="tabset.type === TabsetType.DYNAMIC">
                  <q-icon name="o_label" color="warning">
                    <q-tooltip class="tooltip">Dynamic Tabset, listing all tabsets containing this tag</q-tooltip>
                  </q-icon>
                </span>
          </q-item-label>
          <q-item-label class="text-caption text-grey-5">
            {{
              tabsetCaption(useTabsetService().tabsToShow(tabset as Tabset), tabset.window, tabset.folders?.length)
            }}
          </q-item-label>
          <q-item-label v-if="tabset.sharedId" class="q-mb-xs"
                        @mouseover="hoveredPublicLink = true"
                        @mouseleave="hoveredPublicLink = false">
            <q-icon style="position: relative;top:-2px;left:-2px"
                    @click="shareTabsetPubliclyDialog(tabset as Tabset, tabset.sharing.toString().toLowerCase().indexOf('_outdated') >= 0)"
                    name="ios_share"
                    class="q-ma-none q-pa-none q-mr-xs"
                    :class="tabset.sharing.toString().toLowerCase().indexOf('_outdated') >= 0 ? 'cursor-pointer' : ''"
                    :color="tabset.sharing.toString().toLowerCase().indexOf('_outdated') >= 0 ? 'warning' : 'primary'">
              <q-tooltip class="tooltip" v-if="tabset.sharing.toString().toLowerCase().indexOf('_outdated') >= 0">
                This tabset is shared but has been changed in the meantime. You need to re-publish.
              </q-tooltip>
              <q-tooltip v-else class="tooltip">This tabset is shared</q-tooltip>
            </q-icon>
            <span class="text-caption cursor-pointer text-grey-7" @click="openPublicShare(tabset.id)">open shared page</span>
            <q-icon
              v-show="hoveredPublicLink"
              class="q-ml-sm cursor-pointer"
              name="content_copy" color="primary" @click="copyPublicShareToClipboard(tabset.id)">
              <q-tooltip class="tooltip-small">Copy the Link to your Clipboard</q-tooltip>
            </q-icon>
            <!--                <q-icon-->
            <!--                  v-show="hoveredPublicLink"-->
            <!--                  class="q-ml-sm cursor-pointer"-->
            <!--                  name="open_in_browser" color="primary" @click="openElectronLink(tabset.id)">-->
            <!--                  <q-tooltip class="tooltip-small">Copy the Electron Link to your Clipboard</q-tooltip>-->
            <!--                </q-icon>-->
          </q-item-label>
        </q-item-section>

        <q-item-section side
                        @mouseover="hoveredTabset = tabset.id"
                        @mouseleave="hoveredTabset = undefined">
          <q-item-label>
            <!--                <q-icon-->
            <!--                  id="foo"-->
            <!--                  v-if="showAddTabButton(tabset as Tabset, currentChromeTab)"-->
            <!--                  @click.stop="saveInTabset(tabset.id, tabset.folderActive)"-->
            <!--                  class="q-mr-none"-->
            <!--                  name="o_bookmark_add"-->
            <!--                  :class="alreadyInTabset() ? '':'cursor-pointer'"-->
            <!--                  :color="alreadyInTabset() ? 'grey-5': tsBadges.length > 0 ? 'accent':'warning'"-->
            <!--                  size="xs"-->
            <!--                  data-testid="saveInTabsetBtn">-->
            <!--                </q-icon>-->
            <q-btn outline
                   v-if="showAddTabButton(tabset as Tabset, currentChromeTab)"
                   @click.stop="saveInTabset(tabset.id, tabset.folderActive)"
                   class="q-ma-none q-px-sm q-py-none"
                   name="o_bookmark_add"
                   :class="alreadyInTabset() ? '':'cursor-pointer'"
                   :color="alreadyInTabset() ? 'grey-5': tsBadges.length > 0 ? 'accent':'warning'"
                   size="xs"
                   data-testid="saveInTabsetBtn">
              <div>Add Tab</div>
              <!--                  <q-icon right class="q-ma-none q-pa-none" size="2em" name="o_south" />-->
            </q-btn>
            <span
              v-if="!alreadyInTabset() && showAddTabButton(tabset as Tabset, currentChromeTab) && tsBadges.length > 0"
              style="color: grey;font-size: 7px;position: relative;top:-2px;left:-11px;">{{
                tsBadges.length
              }}</span>
            <q-tooltip class="tooltip-small" v-if="alreadyInTabset()">
              Tab is already contained in tabset '{{ tabset.name }}'
            </q-tooltip>
            <q-tooltip class="tooltip-small" v-else-if="tsBadges.length > 0">
              {{ tooltipAlreadyInOtherTabsets(tabset.name) }}
            </q-tooltip>
            <q-tooltip v-else-if="useTabsStore().allTabsCount === 0"
                       transition-show="flip-right"
                       transition-hide="flip-left"
                       v-model="showAddCurrentTabTooltip"
                       class="tooltip-tour"
                       anchor="bottom right" self="top middle" :offset="[-26, 3 ]">
              Click here
              <q-icon name="keyboard_arrow_up"/>
              to<br> add the current<br>tab to this tabset
            </q-tooltip>
            <q-tooltip class="tooltip-small" v-else>
              Add current Tab to '{{ tabsetNameOrChain(tabset as Tabset) }}'
            </q-tooltip>

          </q-item-label>
        </q-item-section>

        <q-item-section side
                        @mouseover="hoveredTabset = tabset.id"
                        @mouseleave="hoveredTabset = undefined">
          <q-item-label>
            <q-icon class="cursor-pointer" name="more_horiz" size="16px"/>
            <SidePanelPageContextMenu :tabset="tabset as Tabset"
                                      @edit-header-description="toggleEditHeader(tabset as Tabset, index)"/>
          </q-item-label>
        </q-item-section>
      </template>

      <div class="q-ma-none q-pa-none">

        <template v-if="editHeaderDescription">
          <div class="row q-ma-none q-pa-md">
            <q-editor style="width:100%"
                      flat
                      v-model="headerDescription" min-height="5rem"
                      :definitions="{
                            save: {
                              tip: 'Save your work',
                              icon: 'save',
                              label: 'Save',
                              handler: saveTabsetDescription
                            },
                             pageNote: {
                              tip: 'Open page Note',
                              icon: 'open',
                              label: 'Open Page Note',
                              handler: openPageNote
                            }
                          }"
                      :toolbar="[
                            ['bold', 'italic', 'strike', 'underline'],
                            ['save','pageNote']
                          ]"
                      placeholder="Create a header description for your current tabset"/>
          </div>
        </template>
        <template v-else-if="tabset.headerDescription">
          <div class="row q-ma-sm q-pa-sm text-body2 darkInDarkMode brightInBrightMode"
               style="border:1px solid #efefef;border-radius:3px;" v-html="tabset.headerDescription"></div>
        </template>

        <q-list>
          <q-item v-for="folder in calcFolders(tabset as Tabset)"
                  clickable
                  v-ripple
                  class="q-ma-none q-pa-sm greyBorderBottom"
                  @dragstart="startDrag($event, folder)"
                  @dragenter="enterDrag($event, folder)"
                  @dragover="overDrag($event, folder)"
                  @dragend="endDrag($event, folder)"
                  @drop="drop($event, folder)"
                  :key="'panelfolderlist_' + folder.id">

            <q-item-section @click="selectFolder(tabset as Tabset, folder as Tabset)"
                            class="q-mr-sm text-right" style="justify-content:start;width:45px;max-width:45px">
              <div class="q-pa-none q-pl-md">
                <q-icon name="o_folder" color="warning" size="sm"/>
              </div>
            </q-item-section>
            <q-item-section @click="selectFolder(tabset as Tabset, folder as Tabset)">
              <q-item-label>
                <div class="text-bold">
                  {{ folder.name }}
                </div>
              </q-item-label>
              <q-item-label class="text-caption text-grey-5">
                {{ folderCaption(folder) }}
              </q-item-label>
            </q-item-section>

            <q-item-section side
                            v-if="folder.name !== '..'"
                            @mouseover="hoveredTabset = tabset.id"
                            @mouseleave="hoveredTabset = undefined">
              <q-item-label>
                <q-icon class="cursor-pointer" name="more_horiz" size="16px"/>
                <SidePanelSubfolderContextMenu :tabset="tabset as Tabset" :folder="folder"/>
              </q-item-label>
            </q-item-section>

          </q-item>
        </q-list>

        <!-- the actual tabs -->
        <SidePanelPageTabList
          v-if="tabsetExpanded.get(tabset.id)"
          :indent="calcFolders(tabset as Tabset)?.length > 0"
          :tabsCount="useTabsetService().tabsToShow(tabset as Tabset).length"
          :tabset="tabsetForTabList(tabset as Tabset)"/>
        <!-- the actual tabs: end -->

      </div>
    </q-expansion-item>


  </q-list>
</template>

<script lang="ts" setup>

import {Tabset, TabsetSharing, TabsetStatus, TabsetType} from "src/models/Tabset";
import {useTabsStore} from "stores/tabsStore";
import {useTabsetService} from "src/services/TabsetService2";
import SidePanelPageContextMenu from "pages/sidepanel/SidePanelPageContextMenu.vue";
import SidePanelSubfolderContextMenu from "pages/sidepanel/SidePanelSubfolderContextMenu.vue";
import SidePanelPageTabList from "components/layouts/SidePanelPageTabList.vue";
import {onMounted, PropType, ref, watchEffect} from "vue";
import {useUiStore} from "stores/uiStore";
import _ from "lodash";
import {usePermissionsStore} from "stores/permissionsStore";
import {FeatureIdent} from "src/models/AppFeature";
import {useCommandExecutor} from "src/services/CommandExecutor";
import {SelectTabsetCommand} from "src/domain/tabsets/SelectTabset";
import {useSpacesStore} from "stores/spacesStore";
import {Tab} from "src/models/Tab";
import ShareTabsetPubliclyDialog from "components/dialogues/ShareTabsetPubliclyDialog.vue";
import {openURL, scroll, uid, useQuasar} from "quasar";
import {CopyToClipboardCommand} from "src/domain/commands/CopyToClipboard";
import {AddTabToTabsetCommand} from "src/domain/tabs/AddTabToTabsetCommand";
import {useUtils} from "src/services/Utils";
import getScrollTarget = scroll.getScrollTarget;

import {ExecutionResult} from "src/domain/ExecutionResult";
import {useNotificationHandler} from "src/services/ErrorHandler";
import {useWindowsStore} from "stores/windowsStore";
import TabsetService from "src/services/TabsetService";
import {FirebaseCall} from "src/services/firebase/FirebaseCall";

const props = defineProps({
  tabsets: {type: Array as PropType<Array<Tabset>>, required: true}
})

const {setVerticalScrollPosition} = scroll
const {inBexMode, sanitize} = useUtils()
const {handleSuccess, handleError} = useNotificationHandler()

const $q = useQuasar()
const tabsStore = useTabsStore()


// https://stackoverflow.com/questions/12710905/how-do-i-dynamically-assign-properties-to-an-object-in-typescript
interface SelectionObject {
  [key: string]: boolean
}

const showSearchBox = ref(false)
const showAddCurrentTabTooltip = ref(false)
const tabsetExpanded = ref<Map<string, boolean>>(new Map())
const selected_model = ref<SelectionObject>({})
const hoveredTabset = ref<string | undefined>(undefined)
const selectedTab = ref<Tab | undefined>(undefined)
const tsBadges = ref<object[]>([])
const editHeaderDescription = ref<boolean>(false)
const tabsetName = ref<object>(null as unknown as object)
const tabsetNameOptions = ref<object[]>([])
const currentChromeTab = ref<chrome.tabs.Tab>(null as unknown as chrome.tabs.Tab)
const hoveredPublicLink = ref(false)
const headerDescription = ref<string>('')

onMounted(() => {
  if (useTabsStore().allTabsCount === 0) {
    setTimeout(() => {
      showAddCurrentTabTooltip.value = true
      setTimeout(() => showAddCurrentTabTooltip.value = false, 4500)
    }, 1500)
  }
})

const scrollToElement = (el: any, delay: number) => {
  if (!el) {
    return
  }
  setTimeout(() => {
    const target = getScrollTarget(el)
    const offset = el.offsetTop
    const duration = 200
    setVerticalScrollPosition(target, offset - 120, duration)
  }, delay);

}

watchEffect(() => {
  // should trigger if currentTabsetId is changed from "the outside"
  const currentTabsetId = useTabsStore().currentTabsetId
  selected_model.value = {}
  selected_model.value[currentTabsetId] = true
  tabsetExpanded.value.set(currentTabsetId, true)
  const index = _.findIndex(props.tabsets as Tabset[], (ts: Tabset) => ts.id === currentTabsetId)
  scrollToElement(document.getElementsByClassName("q-expansion-item")[index], 300)
  useUiStore().tabsetsExpanded = true
})

watchEffect(() => {
  //console.log(" >>> change in getSelectedTab", useUiStore().getSelectedTab)
  selectedTab.value = useUiStore().getSelectedTab
  if (selectedTab.value) {
    currentChromeTab.value = null as unknown as chrome.tabs.Tab
  }
})

watchEffect(() => {
  if (useTabsStore().tabsets) {
    //console.log(" >>> change in tabsets...")
    tabsetNameOptions.value = _.map([...useTabsStore().tabsets.values()] as Tabset[], (ts: Tabset) => {
      return {
        label: ts.name,
        value: ts.id
      }
    })
    if (tabsetNameOptions.value.length > 0) {
      tabsetName.value = tabsetNameOptions.value[0]
    }
  }
})

watchEffect(() => {
  //console.log(" >>> change in getSelectedTab", useUiStore().getSelectedTab)
  selectedTab.value = useUiStore().getSelectedTab
  if (selectedTab.value) {
    currentChromeTab.value = null as unknown as chrome.tabs.Tab
  }
})

watchEffect(() => {
  if (currentChromeTab.value?.url) {
    const url = currentChromeTab.value.url
    const tabsetIds = useTabsetService().tabsetsFor(url)
    tsBadges.value = []
    //created.value = undefined
    _.forEach(tabsetIds, tsId => {
      tsBadges.value.push({
        label: TabsetService.nameForTabsetId(tsId),
        tabsetId: tsId,
        encodedUrl: btoa(url || '')
      })
    })
  }

  watchEffect(() => {
    const windowId = useWindowsStore().currentChromeWindow?.id || 0
    currentChromeTab.value = useTabsStore().getCurrentChromeTab(windowId) || useTabsStore().currentChromeTab
  })
})

const showTabset = (tabset: Tabset) => !useUiStore().tabsFilter ?
  true :
  (useUiStore().tabsFilter === '' || useTabsetService().tabsToShow(tabset).length > 0)


const headerStyle = (tabset: Tabset) => {
  const tabsetOpened: boolean = _.findIndex([...tabsetExpanded.value.keys()],
    (key: string) => (key !== null) && tabsetExpanded.value.get(key) !== undefined) >= 0
  let style = tabsetExpanded.value.get(tabset.id) ?
    'border:0 solid grey;border-top-left-radius:4px;border-top-right-radius:4px;' :
    tabsetOpened ?
      'border:0 solid grey;border-radius:4px;opacity:30%;' :
      'border:0 solid grey;border-radius:4px;'
  if (tabset.color && usePermissionsStore().hasFeature(FeatureIdent.COLOR_TAGS)) {
    style = style + 'border-left:4px solid ' + tabset.color
  } else {
    style = style + 'border-left:4px solid #f5f5f5'
  }
  return style
}

const suggestTabsetImport = () => {
  const currentTabUrl = useTabsStore().currentChromeTab?.url
  if (currentTabUrl?.startsWith("https://shared.tabsets.net/#/pwa/tabsets/")) {
    const urlSplit = currentTabUrl.split("/")
    const tabsetId = urlSplit[urlSplit.length - 1]
    console.log("tabsetId", tabsetId, useTabsetService().getTabset(tabsetId))
    return !useTabsetService().getTabset(tabsetId)
  }
  return false
}

const importSharedTabset = () => {
  const currentTabUrl = useTabsStore().currentChromeTab?.url
  if (currentTabUrl) {
    console.log("Importing", currentTabUrl)
    const urlSplit = currentTabUrl.split("/")
    const tabsetId = urlSplit[urlSplit.length - 1]
    FirebaseCall.get("/share/public/" + tabsetId + "?cb=" + new Date().getTime(), false)
      .then((res: any) => {
        const newTabset = res as Tabset
        newTabset.sharing = TabsetSharing.UNSHARED
        //_.forEach(newTabset.tabs, t => t.preview = TabPreview.THUMBNAIL)
        useTabsetService().saveTabset(newTabset)
        useTabsetService().reloadTabset(newTabset.id)
      })
  }
}

const updateSelectedTabset = (tabsetId: string, open: boolean, index: number | undefined = undefined) => {
  console.log("updated...", tabsetId, open, index, Object.keys(tabsetExpanded.value))
  tabsetExpanded.value.set(tabsetId, open)
  if (open) {
    if (index) {
      scrollToElement(document.getElementsByClassName("q-expansion-item")[index], 300)
    }

    useUiStore().tabsetsExpanded = true

    useCommandExecutor()
      .execute(new SelectTabsetCommand(tabsetId, useSpacesStore().space?.id))
      .then(() => {
        const promises: Promise<any>[] = []
        //console.log("selecteded tabset > ", tabsetId)
        const selectedTabset = useTabsStore().getTabset(tabsetId)
        if (selectedTabset) {
          handleHeadRequests(selectedTabset)
        }
      })

  } else {
    useUiStore().tabsetsExpanded = false
  }
}

const toggleEditHeader = (tabset: Tabset, index: number) => {
  editHeaderDescription.value = !editHeaderDescription.value
  if (editHeaderDescription.value) {
    updateSelectedTabset(tabset.id, true, index)
    headerDescription.value = tabset.headerDescription || ''
  }
}

const calcFolders = (tabset: Tabset): Tabset[] => {
  //console.log("calcFolders", tabset)
  if (tabset.folderActive) {
    const af = useTabsetService().findFolder(tabset.folders, tabset.folderActive)
    if (af && af.folderParent) {
      return [new Tabset(af.folderParent, "..", [])].concat(af.folders)
    }
  }
  return tabset.folders
}

const openPageNote = () => openURL(chrome.runtime.getURL("/www/index.html#/tabsets/" + useTabsStore().currentTabsetId + "?tab=page"))

const startDrag = (evt: any, folder: Tabset) => {
  console.log("start dragging", evt, folder)
  if (evt.dataTransfer) {
    evt.dataTransfer.dropEffect = 'all'
    evt.dataTransfer.effectAllowed = 'all'
    //evt.dataTransfer.setData('text/plain', tab.id)
    //useUiStore().draggingTab(tab.id, evt)
  }
  console.log("evt.dataTransfer.getData('text/plain')", evt.dataTransfer.getData('text/plain'))
}
const enterDrag = (evt: any, folder: Tabset) => {
  //console.log("enter drag", evt, folder)
}
const overDrag = (event: any, folder: Tabset) => {
  //console.log("enter drag", event, folder)
  event.preventDefault();
}
const endDrag = (evt: any, folder: Tabset) => {
  console.log("end drag", evt, folder)
}
const drop = (evt: any, folder: Tabset) => {
  console.log("drop", evt, folder)
  const tabToDrag = useUiStore().tabBeingDragged
  const tabset = useTabsetService().getCurrentTabset()
  if (tabToDrag && tabset) {
    console.log("tabToDrag", tabToDrag)
    const moveToFolderId = folder.id
    console.log("moveToFolderId", moveToFolderId)
    useTabsetService().moveTabToFolder(tabset, tabToDrag, moveToFolderId)
  }
}

const folderCaption = (folder: Tabset) =>
  (folder.name !== "..") ?
    folder.tabs.length + " tab" + (folder.tabs.length !== 1 ? 's' : '') :
    ""

const tabsetSectionName = (tabset: Tabset) => {
  if (!tabset.folderActive || tabset.id === tabset.folderActive) {
    return tabset.name
  }
  const activeFolder = useTabsetService().findFolder([tabset], tabset.folderActive)
  return tabset.name + (activeFolder ? " - " + activeFolder.name : "")
}

const tabsetCaption = (tabs: Tab[], window: string, foldersCount: number) => {
  const filter = useUiStore().tabsFilter
  if (!tabs) {
    return '-'
  }
  let caption = ''
  if (!filter || filter.trim() === '') {
    caption = tabs.length + ' tab' + (tabs.length === 1 ? '' : 's')
  } else {
    caption = tabs.length + ' tab' + (tabs.length === 1 ? '' : 's') + ' (filtered)'
  }
  if (foldersCount > 0) {
    caption = caption + ", " + foldersCount + " folder" + (foldersCount === 1 ? '' : 's')
  }
  if (window && window !== 'current') {
    caption = caption + " - opens in: " + window
  }
  return caption
}


const shareTabsetPubliclyDialog = (tabset: Tabset, republish: boolean = false) => {
  $q.dialog({
    component: ShareTabsetPubliclyDialog,
    componentProps: {
      tabsetId: tabset.id,
      sharedId: tabset.sharedId,
      tabsetName: tabset.name,
      republish: republish
    }
  })
}

const tooltipAlreadyInOtherTabsets = (tabsetName: string) => {
  const tabsetList = _.join(_.map(tsBadges.value, (b: any) => b['label'] as keyof object), ", ")
  return "The current Tab is already contained in " +
    tsBadges.value.length + " other Tabsets: " + tabsetList + ". Click to add " +
    "it to '" + tabsetName + "' as well."
}

const openPublicShare = (tabsetId: string) => {
  const ts = useTabsetService().getTabset(tabsetId)
  if (ts && ts.sharedId) {
    openURL(getPublicTabsetLink(ts))
  }
}

const getPublicTabsetLink = (ts: Tabset) => {
  let image = "https://tabsets.web.app/favicon.ico"
  if (ts && ts.sharedId) {
    //return PUBLIC_SHARE_URL + "#/pwa/imp/" + ts.sharedId + "?n=" + btoa(ts.name) + "&a=" + btoa(ts.sharedBy || 'n/a') + "&d=" + ts.sharedAt
    //return "https://us-central1-tabsets-backend-prd.cloudfunctions.net/app/share/preview/" + ts.sharedId + "?n=" + btoa(ts.name) + "&a=" + btoa(ts.sharedBy || 'n/a')
    return process.env.BACKEND_URL + "/share/preview/" + ts.sharedId + "?n=" + btoa(ts.name) + "&a=" + btoa(ts.sharedBy || 'n/a')
  }
  return image
}

const copyPublicShareToClipboard = (tabsetId: string) => {
  const ts = useTabsetService().getTabset(tabsetId)
  if (ts && ts.sharedId) {
    const link = getPublicTabsetLink(ts)
    useCommandExecutor().executeFromUi(new CopyToClipboardCommand(link))
  }
}

const showAddTabButton = (tabset: Tabset, currentChromeTab: chrome.tabs.Tab) => {
  return inBexMode() &&
    tabset.type !== TabsetType.DYNAMIC &&
    currentChromeTab &&
    currentChromeTab.url &&
    currentChromeTab.url !== 'chrome://newtab/' &&
    currentChromeTab.url.indexOf('/www/index.html#/mainpanel/notes/') < 0 &&
    currentChromeTab.url !== '' &&
    currentChromeTab.url.indexOf('https://tabsets.web.app/?apiKey=') < 0 &&
    tabsStore.currentTabsetId === tabset.id
  //isCurrentTab()
}

const saveTabsetDescription = () => {
  console.log("saving tabset", headerDescription.value, useTabsStore().currentTabsetId)
  const currentTs = useTabsStore().getCurrentTabset
  if (currentTs) {
    currentTs.headerDescription = sanitize(headerDescription.value)
    useTabsetService().saveCurrentTabset()
    editHeaderDescription.value = false
    headerDescription.value = ''
    handleSuccess(new ExecutionResult<string>('saved', 'saved'))
  } else {
    handleError("could not save description")
  }
}

const activeFolderNameFor = (ts: Tabset, activeFolder: string) => {
  const folder = useTabsetService().findFolder(ts.folders, activeFolder)
  return folder ? folder.name : ts.name
}

const selectFolder = (tabset: Tabset, folder: Tabset) => {
  console.log("selectiong folder", tabset.id, folder.id)
  tabset.folderActive = folder.id
  useTabsetService().saveTabset(tabset)
}

const tabsetNameOrChain = (tabset: Tabset) => {
  if (tabset.folderActive) {
    return activeFolderNameFor(tabset, tabset.folderActive)
  }
  return tabset.name
}

const alreadyInTabset = () => {
  if (currentChromeTab.value?.url && tabsStore.getCurrentTabset) {
    return useTabsetService().urlExistsInCurrentTabset(currentChromeTab.value.url)
  }
  return false
}

const saveInTabset = (tabsetId: string, activeFolder: string | undefined) => {
  const useTS: Tabset | undefined = useTabsetService().getTabset(tabsetId)
  if (useTS) {
    // if (alreadyInTabset()) {
    //   return
    // }
    useCommandExecutor().execute(new AddTabToTabsetCommand(new Tab(uid(), currentChromeTab.value), useTS, activeFolder))
  } else {
    console.warn("expected to find tabsetId", tabsetId)
  }
}

const tabsetForTabList = (tabset: Tabset) => {
  if (tabset.folderActive) {
    const af = useTabsetService().findFolder(tabset.folders, tabset.folderActive)
    //console.log("result af", af)
    if (af) {
      return af
    }
  }
  return tabset
}

async function handleHeadRequests(selectedTabset: Tabset) {
  //selectedTabset.tabs.forEach((t: Tab) => {
  for (const t of selectedTabset.tabs) {
    if (t.url && !t.url.startsWith("chrome")) {
      // console.log("checking HEAD", t.url)
      try {
        const response = await fetch(t.url, {
          method: 'HEAD',
          cache: 'no-cache',
//          mode: 'no-cors',
          redirect: 'manual'
        })
        //console.log("got response", t.url)
        const oldLastModified = t.httpLastModified

        t.httpStatus = response.status
        t.httpContentType = response.headers.get("content-type") || 'unknown'
        t.httpLastModified = response.headers.get("Last-Modified") || 'unknown'
        t.httpCheckedAt = new Date().getTime()

        if (response.status !== 200) {
          // console.log(`checking HEAD found status ${response.status} for url ${t.url}`)
        }

        try {
          if (t.httpLastModified && oldLastModified) {
            if (Date.parse(t.httpLastModified) > Date.parse(oldLastModified)) {
              t.httpInfo = "UPDATED"
            }
          }
        } catch (err) {
        }
      } catch (error) {
        console.debug('got a Problem fetching url "' + t.url + '": \n', error)
        //t.httpError = error.toString()
        //return Promise.resolve()
      }
    }
  }
  useTabsetService().saveTabset(selectedTabset)
}



</script>
