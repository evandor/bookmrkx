<template>

  <!-- folder -->
  <template v-if="!props.bookmark.chromeBookmark.url">
    <q-item-section
      avatar class="text-primary">
      <q-icon name="o_folder_open" size="24px" color="warning"></q-icon>
    </q-item-section>
    <q-item-section
      :data-testid="useUtils().createDataTestIdentifier('tabListElementWidget', props.bookmark.chromeBookmark.title)"
      class="cursor-pointer"
      @click="selectBookmark(props.bookmark)">
      <q-item-label>{{ props.bookmark.chromeBookmark?.title }}
        <span class="text-caption text-grey-8">
           - {{ formatDate(props.bookmark.chromeBookmark?.dateAdded) }}
        <q-tooltip>this folder was created at
          {{ date.formatDate(props.bookmark.chromeBookmark?.dateAdded, 'DD.MM.YYYY HH:mm') }}
        </q-tooltip>
        </span>
      </q-item-label>
    </q-item-section>

  </template>

  <!-- bookmark -->
  <template v-else>
    <!--    <q-item-section avatar class="text-warning">-->
    <!--      <q-icon name="o_bookmark_border" size="24px"></q-icon>-->
    <!--    </q-item-section>-->

    <q-item-section avatar>
      <q-img
        class="rounded-borders" style="cursor: move"
        width="20px"
        height="20px"
        :src="getFaviconUrl(props.bookmark.chromeBookmark)">
      </q-img>
    </q-item-section>

    <q-item-section
      @mouseover="showButtons(props.bookmark.chromeBookmark?.id, true)"
      @mouseleave="showButtons(props.bookmark.chromeBookmark?.id, false)"
      @click.stop="NavigationService.openOrCreateTab([props.bookmark.chromeBookmark?.url] )">

      <q-item-label>
        <div>{{ props.bookmark.chromeBookmark?.title }}
          <span class="text-caption text-grey-8">
           - {{ formatDate(props.bookmark.chromeBookmark?.dateAdded) }}
        <q-tooltip>this folder was created at
          {{ date.formatDate(props.bookmark.chromeBookmark?.dateAdded, 'DD.MM.YYYY HH:mm') }}
        </q-tooltip>
        </span>
        </div>
      </q-item-label>

      <q-item-label caption>{{ props.bookmark.chromeBookmark?.url }}</q-item-label>

    </q-item-section>
    <q-item-section avatar
                    @mouseover="showButtons(props.bookmark.chromeBookmark?.id, true)"
                    @mouseleave="showButtons(props.bookmark.chromeBookmark?.id, false)">
      <q-btn v-if="showDeleteButton.get(props.bookmark.chromeBookmark?.id)"
             flat round color="red" size="11px" icon="delete_outline" @click.stop="deleteBookmark(props.bookmark)">
        <q-tooltip>Delete this bookmark</q-tooltip>
      </q-btn>
    </q-item-section>
  </template>


</template>

<script setup lang="ts">
import {PropType, ref} from "vue";
import {useUtils} from "src/services/Utils"
import {Bookmark} from "src/models/Bookmark";
import {useRouter} from "vue-router";
import {date} from "quasar";
import NavigationService from "src/services/NavigationService";
import BookmarksService from "src/bookmarks/services/BookmarksService";

const {formatDate} = useUtils()

const props = defineProps({
  bookmark: {type: Object as PropType<Bookmark>, required: true},
  highlightUrl: {type: String, required: false},
  inSidePanel: {type: Boolean, default: false}
})

const router = useRouter()

const showDeleteButton = ref<Map<string, boolean>>(new Map())

const getFaviconUrl = (chromeBookmark: chrome.bookmarks.BookmarkTreeNode | undefined) => {
  // if (chromeBookmark && chromeBookmark.favIconUrl && !chromeBookmark.favIconUrl.startsWith("chrome")) {
  //   return chromeBookmark.favIconUrl
  // }
  if (chromeBookmark && chromeBookmark.url) {
    let theUrl = chromeBookmark.url
    let theRealUrl
    try {
      theRealUrl = new URL(theUrl)
    } catch (err) {
      if (!theUrl.startsWith('http')) {
        theUrl = 'https://' + theUrl
        try {
          theRealUrl = new URL(theUrl)
        } catch (err) {
        }
      }
    }
    return theRealUrl ? "https://icons.duckduckgo.com/ip3/" + theRealUrl.hostname + ".ico" : 'favicon-unknown-32x32.png'
  }
  return 'favicon-unknown-32x32.png'
}

const selectBookmark = (bm: Bookmark) =>
  props.inSidePanel ?
    router.push("/mainpanel/bookmarks/" + bm.chromeBookmark.id) :
    router.push("/bookmarks/" + bm.chromeBookmark.id)

const deleteBookmark = (bm: Bookmark) => BookmarksService.deleteBookmark(bm)

const showButtons = (bookmarkId: string, show: boolean) => showDeleteButton.value.set(bookmarkId, show)


</script>
