<template>

  <q-list class="q-mt-none">

    <div class="row">
      <div class="col-12 text-right">
        Show only Folders
        <q-checkbox v-model="showOnlyFolders"/>
      </div>
      <div class="col-12 q-mb-md">
        <q-input
          dense
          ref="filterRef"
          filled
          v-model="filter"
          label="Filter Bookmarks">
          <template v-slot:append>
            <q-icon v-if="filter !== ''" name="clear" class="cursor-pointer" @click="resetFilter"/>
          </template>
        </q-input>
      </div>
    </div>

    <div class="row q-ma-lg fit items-center justify-center" v-if="useUiStore().bookmarksLoading">
      <q-spinner-dots
        color="primary"
        size="2em"
      />
    </div>

    <q-tree
      v-if="bookmarksPermissionGranted && !useUiStore().bookmarksLoading"
      :nodes="showOnlyFolders ? bookmarksStore.nonLeafNodes : bookmarksStore.bookmarksNodes2"
      :filter="filter"
      :filterMethod="bookmarksFilter"
      node-key="id"
      @mouseenter="entered(true)"
      @mouseleave="entered(false)"
      v-model:selected="selected"
      v-model:expanded="useNotificationsStore().bookmarksExpanded">
      <template v-slot:header-node="prop">
        <q-icon name="o_folder" color="warning" class="q-mr-sm"/>
        <span class="cursor-pointer fit no-wrap ellipsis">{{ prop.node.label }} <span style="font-size:smaller"
                                                                                      class="text-grey">({{ prop.node.subFoldersCount }} / {{ prop.node.subNodesCount }})</span></span>

        <span class="text-right" v-if="mouseHover && prop.node.id === deleteButtonId" style="width:25px;">
            <q-icon name="delete_outline" color="negative" size="18px" @click.stop="deleteBookmarksFolderDialog">
              <q-tooltip>Delete this folder</q-tooltip>
            </q-icon>
        </span>
        <span class="text-right" v-else style="width:25px;">&nbsp;</span>


      </template>
      <template v-slot:header-leaf="prop">
        <q-img v-if="!useSettingsStore().isEnabled('noDDG')"
               class="rounded-borders q-mr-sm"
               width="23px"
               height="23px"
               :src="favIconFromUrl(prop.node.url)"/>
        <q-icon v-else name="o_article" class="q-mr-sm"/>
        <span class="cursor-pointer fit no-wrap ellipsis">{{ prop.node.label }}</span>
        <span class="text-right" v-if="mouseHover && prop.node.id === deleteButtonId" style="width:25px;">
          <q-icon name="delete_outline" color="negative" size="18px"
                  @click.stop="deleteBookmark(prop.node.id)">
              <q-tooltip>Delete this Bookmark</q-tooltip>
          </q-icon>
        </span>
        <span class="text-right" v-else style="width:25px;">&nbsp;</span>
      </template>

    </q-tree>

  </q-list>

</template>

<script setup lang="ts">

import {useRouter} from "vue-router";
import {useTabsStore} from "src/stores/tabsStore";
import _ from "lodash"
import {ref, watch, watchEffect} from "vue";
import {useQuasar} from "quasar";
import {useBookmarksStore} from "src/stores/bookmarksStore";
import {useNotificationsStore} from "src/stores/notificationsStore";
import BookmarksService from "src/services/BookmarksService";
import {usePermissionsStore} from "src/stores/permissionsStore";
import {useNotificationHandler} from "src/services/ErrorHandler";
import {useCommandExecutor} from "src/services/CommandExecutor";
import {GrantPermissionCommand} from "src/domain/commands/GrantPermissionCommand";
import {useSettingsStore} from "src/stores/settingsStore"
import NavigationService from "src/services/NavigationService";
import {FeatureIdent} from "src/models/AppFeature";
import NewTabsetDialog from "components/dialogues/NewTabsetDialog.vue";
import DeleteBookmarkFolderDialog from "components/dialogues/bookmarks/DeleteBookmarkFolderDialog.vue";
import {TreeNode} from "src/models/Tree";
import {useUtils} from "src/services/Utils";
import {useUiStore} from "stores/uiStore";

const router = useRouter()
const bookmarksStore = useBookmarksStore()

const $q = useQuasar();
const localStorage = useQuasar().localStorage

const loading = ref(true)
const mouseHover = ref(false)
const selected = ref('')
const deleteButtonId = ref('')
const bookmarksPermissionGranted = ref<boolean>(true)
const filter = ref('')
const filterRef = ref(null)
const bmsCount = ref(0)
const foldersCount = ref(0)
const showOnlyFolders = ref(false)
const expandedBookmarks = ref<string[]>([])

const {handleSuccess, handleError} = useNotificationHandler()
const {favIconFromUrl} = useUtils()

const props = defineProps({
  inSidePanel: {type: Boolean, default: false}
})

watchEffect(() => {
  foldersCount.value = bookmarksStore.foldersCount
  bmsCount.value = bookmarksStore.bookmarksCount
})

watchEffect(() => {
  expandedBookmarks.value = useNotificationsStore().bookmarksExpanded
  console.log("expanded Bookmarks set to ", expandedBookmarks.value)
})

watch(() => selected.value, async (currentValue, oldValue) => {
  if (currentValue !== oldValue) {
    try {
      // @ts-ignore
      const result = await chrome.bookmarks.get(currentValue)
      if (result && result.length > 0 && result[0].url) {
        NavigationService.openSingleTab(result[0].url)
      } else {
        props.inSidePanel ?
          NavigationService.openOrCreateTab(
            [chrome.runtime.getURL("/www/index.html#/mainpanel/bookmarks/" + selected.value)], undefined, [], true) :
          router.push("/bookmarks/" + selected.value)
      }
    } catch (err) {
      console.log("got error", err)
      if (chrome.runtime.lastError) {
        console.warn("got runtime error", chrome.runtime.lastError)
      }
    }
  }
})

watchEffect(() => {
  localStorage.set("bookmarks.expanded", useNotificationsStore().bookmarksExpanded)
})

watchEffect(() => {
  deleteButtonId.value = selected.value
})

$q.loadingBar.setDefaults({
  color: 'positive',
  size: '10px',
  position: 'bottom'
})

const deleteBookmarksFolderDialog = () => {
  $q.dialog({
    component: DeleteBookmarkFolderDialog,
    componentProps: {
      folderId: selected.value
    }
  })
}

const entered = (b: boolean) => mouseHover.value = b

const bookmarksFilter = (node: TreeNode, filter: string) => {
  const filt = filter.toLowerCase()
  return node.label && node.label.toLowerCase().indexOf(filt) > -1
}

const resetFilter = () => {
  filter.value = ''
  if (filterRef.value) {
    // @ts-ignore
    filterRef.value.focus()
  }
}

const shorten = (str: string, maxLength: number) => {
  if (str.length > maxLength) {
    return str.substring(0, maxLength - 3) + "..."
  }
  return str
}

const deleteBookmark = async (id: string) => {
  console.log("id", id)
  await chrome.bookmarks.remove(id)
}

</script>

<style lang="sass" scoped>
.drop-zone
  background-color: #eee
  margin-bottom: 10px
  padding: 10px

.v-enter-active,
.v-leave-active
  transition: opacity 0.5s ease

.v-enter-from,
.v-leave-to
  opacity: 0

</style>
