<template>

  <BookmarksPage :in-side-panel="true" />

</template>

<script lang="ts" setup>

import BookmarksPage from "pages/BookmarksPage.vue";
import {onMounted} from "vue";
import Analytics from "src/utils/google-analytics";

onMounted(() => {
  Analytics.firePageViewEvent('MainPanelBookmarksPage', document.location.href);
})

</script>
