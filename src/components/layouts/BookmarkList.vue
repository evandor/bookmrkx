<template>

  <q-list bordered separator>
    <vue-draggable-next
      class="dragArea list-group w-full"
      :list="props.bookmarks"
      :group="{ name: 'tabs', pull: 'clone' }"
      @change="handleDragAndDrop">
      <q-item
        clickable v-ripple
        v-for="(bm) in props.bookmarks"
        :style="checkHighlighting(bm)"
        :key="props.group + '_' + bm.id">

        <BookmarkListElementWidget
          :in-side-panel="true"
          :key="props.group + '__' + bm.id" :bookmark="bm" :highlightUrl="highlightUrl"/>

      </q-item>
    </vue-draggable-next>
  </q-list>

</template>

<script setup lang="ts">
import {Bookmark} from "src/models/Bookmark";
import {PropType} from "vue";
import {VueDraggableNext} from 'vue-draggable-next'
import {useCommandExecutor} from "src/services/CommandExecutor";
import BookmarkListElementWidget from "components/widgets/BookmarkListElementWidget.vue";
import {CreateBookmarkFromOpenTabsCommand} from "src/domain/commands/CreateBookmarkFromOpenTabsCommand";

const props = defineProps({
  bookmarks: {type: Array as PropType<Array<Bookmark>>, required: true},
  group: {type: String, required: true},
  parent: {type: String, required: true},
  highlightId: {type: String, required: false},
  highlightUrl: {type: String, required: false},
  inSidePanel: {type: Boolean, default: false}
})

const handleDragAndDrop = (event: any) => {
  console.log("event", event)
  const {moved, added} = event
  if (moved) {
    console.log('d&d bookmarks moved', moved.element.id, moved.newIndex)
  }
  if (added) {
    useCommandExecutor()
      .executeFromUi(new CreateBookmarkFromOpenTabsCommand(added.element, added.newIndex, props.parent))
  }
}

const checkHighlighting = (bm: Bookmark) => {
  if (bm.chromeBookmark.id === props.highlightId) {
    return "border: 1px solid orange;border-radius:5px;"
  }
  return ""
}

</script>

<style lang="sass" scoped>
.my-card
  width: 100%
</style>
