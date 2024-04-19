<template>

  <BookmarksPage :in-side-panel="true">

    <template v-slot:actions>
      <!--      <q-btn v-if="nonFolders().length > 0"-->
      <!--             flat dense icon="upload_file"-->
      <!--             color="primary" :label="$q.screen.gt.lg ? 'Import as Tabset...' : ''"-->
      <!--             class="q-mr-sm"-->
      <!--             @click="importBookmarks">-->
      <!--        <q-tooltip>Import these bookmarks as Tabset</q-tooltip>-->
      <!--      </q-btn>-->

      <q-btn
          flat dense icon="o_add"
          color="primary" :label="$q.screen.gt.lg ? 'Add Folder...' : ''"
          class="q-mr-md"
          @click="addUrlDialog">
        <q-tooltip>Create a new Bookmark Folder</q-tooltip>
      </q-btn>

      <q-btn
          flat dense icon="delete_outline"
          color="negative" :label="$q.screen.gt.lg ? 'Delete Folder...' : ''"
          class="q-mr-md"
          @click="deleteBookmarkFolder">
        <q-tooltip>Delete this Bookmark Folder</q-tooltip>
      </q-btn>

    </template>

  </BookmarksPage>

</template>

<script lang="ts" setup>

import BookmarksPage from "src/bookmarks/pages/BookmarksPage.vue";
import {onMounted, ref, watchEffect} from "vue";
import Analytics from "src/utils/google-analytics";
import AddBookmarkFolderDialog from "components/dialogues/AddBookmarkFolderDialog.vue";
import {uid, useQuasar} from "quasar";
import {useBookmarksStore} from "src/bookmarks/stores/bookmarksStore";
import BookmarksService from "src/bookmarks/services/BookmarksService";
import {useRoute, useRouter} from "vue-router";

const $q = useQuasar()
const bookmarksStore = useBookmarksStore()
const router = useRouter()
const route = useRoute()

const bookmarkId = ref('')

onMounted(() => {
  Analytics.firePageViewEvent('MainPanelBookmarksPage', document.location.href);
})


watchEffect(() => {
  bookmarkId.value = route.params.id as string
})

const addUrlDialog = () => $q.dialog({
  component: AddBookmarkFolderDialog,
  componentProps: {parentFolderId: bookmarkId.value}
})

// const importBookmarks = () => $q.dialog({
//   component: ImportFromBookmarksDialog,
//   componentProps: {
//     count: nonFolders().length,
//     foldersCount: folders().length,
//     inSidePanel: props.inSidePanel
//   }
// })

const deleteBookmarkFolder = () => {

  $q.dialog({
    title: 'Please Confirm Deleting of Bookmarks Folder',
    message: 'Do you really want to delete this folder (and potentially all its subfolders and bookmarks)? This cannot be undone.',
    cancel: true,
    persistent: true
  }).onOk(() => {
    const parentId = bookmarksStore.currentBookmark.chromeBookmark.parentId
    BookmarksService.deleteBookmarksFolder(bookmarksStore.currentBookmark.chromeBookmark.id)
    if (parentId) {
      router.push("/mainpanel/bookmarks/" + parentId)
    }
  }).onCancel(() => {
  }).onDismiss(() => {
  })
}
</script>
