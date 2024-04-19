<template>
  <div>
    <q-form @submit.prevent="deleteFolder()" ref="theForm">

      <q-card class="q-dialog-plugin" style="max-width:100%">
        <q-card-section>
          <div class="text-h6">Delete Bookmark Folder</div>
        </q-card-section>
        <q-card-section class="q-pt-none">
          <div class="text-body">Would you like to delete this folder (and potentially all its subfolders and bookmarks)? This cannot be undone.</div>
        </q-card-section>
        <q-card-actions align="right" class="text-primary">
          <q-btn outline color="accent" size="sm" label="Cancel" v-close-popup />
          <q-btn outline color="negative" size="sm" label="Delete"
                 v-close-popup type="submit" />

        </q-card-actions>
      </q-card>
    </q-form>
  </div>

</template>

<script lang="ts" setup>

import {ref} from "vue";
import {QForm} from "quasar";

import {useDialogPluginComponent} from 'quasar'
import {useBookmarksStore} from "src/bookmarks/stores/bookmarksStore";
import BookmarksService from "src/bookmarks/services/BookmarksService";

defineEmits([
  ...useDialogPluginComponent.emits
])

const props = defineProps({
  folderId: {type: String, required: true}
})

const bookmarksStore = useBookmarksStore()

const theForm = ref<QForm>(null as unknown as QForm)

const deleteFolder = () => BookmarksService.deleteBookmarksFolder(props.folderId)

</script>
