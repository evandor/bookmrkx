<template>

  <q-list class="q-mt-md">

    <!--      v-model:expanded="useNotificationsStore().bookmarksExpanded"-->
    <q-tree
      :nodes="tabNodes"
      node-key="id"
      selected-color="dark"
      @mouseenter="entered(true)"
      @mouseleave="entered(false)"
      v-model:selected="selected">

      <template v-slot:header-node="prop">
        <q-icon name="o_folder" class="q-mr-sm"/>
        <span class="cursor-pointer fit no-wrap">{{ prop.node.label }}</span>
      </template>
    </q-tree>

  </q-list>

</template>

<script setup lang="ts">

import {useRouter} from "vue-router";
import {useTabsStore} from "src/stores/tabsStore";
import {ref, watch, watchEffect} from "vue";
import {uid, useQuasar} from "quasar";
import {useBookmarksStore} from "src/stores/bookmarksStore";
import {useNotificationsStore} from "src/stores/notificationsStore";
import {usePermissionsStore} from "src/stores/permissionsStore";
import {useNotificationHandler} from "src/services/ErrorHandler";
import NavigationService from "src/services/NavigationService";
import {FeatureIdent} from "src/models/AppFeature";
import DeleteBookmarkFolderDialog from "components/dialogues/bookmarks/DeleteBookmarkFolderDialog.vue";
import {TreeNode} from "src/models/Tree";
import _ from "lodash"

const router = useRouter()
const permissionsStore = usePermissionsStore()

const $q = useQuasar();
const localStorage = useQuasar().localStorage

const mouseHover = ref(false)
const selected = ref('')
const deleteButtonId = ref('')
const nodesToUrl = ref<Map<string, object>>(new Map())
const bookmarksPermissionGranted = ref<boolean | undefined>(undefined)

const {handleSuccess, handleError} = useNotificationHandler()

const tabNodes = ref([])

function createNodes(tabs: object[], level = 0): TreeNode[] {
  //console.log("---creating nodes", tabs.length, level)
  const nodes: TreeNode[] = []

  const levelIdents = new Map<string, object>()
  for (const e of tabs) {
    const segments = e['segments' as keyof object] as string[]
    if (segments && segments.length > level) {
      const name = segments[level]
      //console.log("got name", name)
      levelIdents.set(name, e)
    }
  }

  for (const name of _.sortBy([...levelIdents.keys()], k => k)) {
    //console.log("name", name, level)
    const t: object = levelIdents.get(name) || {}
    const filteredTabs = _.filter(tabs, t => {
      const segments = t['segments' as keyof object] as string[]
      //console.log("checking", segments.length, level, segments[level], name)
      return (segments && segments.length > level + 1 && segments[level] === name)
    })
    const children: TreeNode[] = createNodes(filteredTabs, level + 1)
   // console.log("calculated children", children.length)
    const newNodeId = uid()
    let url = t['protocol' as keyof object] + "//" + t['hostname' as keyof object]
    for (let i = 1; i <= level; i++) {
      url += "/" + t['segments' as keyof object][i]
    }
    children.length === 0 ?
      nodesToUrl.value.set(newNodeId, t['url' as keyof object]) :
      nodesToUrl.value.set(newNodeId, url)
    const newNode = new TreeNode(newNodeId, name as string, name as string, undefined, "", children)
    nodes.push(newNode)
  }
  return nodes
}

watchEffect(() => {
  const tabs: object[] = []
  for (const ts of useTabsStore().tabsets.values()) {
    for (const t of ts.tabs) {
      if (t.url) {
        try {
          const url = new URL(t.url)
          const segments: string[] = []
          segments.push(url.host.replace("www.", ""))
          const splits = _.filter(url.pathname.split("/"), e => e.trim().length > 0)
          segments.push(...(splits))
          tabs.push({
            protocol: url.protocol,
            hostname: url.hostname,
            url: t.url,
            name: t.name,
            title: t.title,
            segments: segments
          })
        } catch (err) {
        }
      }
    }
  }
  const nodes = createNodes(tabs, 0);
  console.log("nodes", nodes)
  tabNodes.value = JSON.parse(JSON.stringify(nodes))
})

watchEffect(() => {
  bookmarksPermissionGranted.value = true// permissionsStore.hasFeature(FeatureIdent.BOOKMARKS)
  useBookmarksStore().loadBookmarks()
})

watch(() => selected.value, (currentValue, oldValue) => {
  if (currentValue !== oldValue) {
    const found = nodesToUrl.value.get(currentValue)
    console.log("found", found)
    NavigationService.openOrCreateTab([found])
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
