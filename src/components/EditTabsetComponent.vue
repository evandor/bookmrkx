<template>


</template>

<script setup lang="ts">

import {useRouter} from "vue-router";
import {useTabsStore} from "src/stores/tabsStore";

const router = useRouter()
const tabsStore = useTabsStore()

router.push("/tabsets/" + tabsStore.currentTabsetId)

// watchEffect(() => {
//   const highlight = route.query['highlight'] as unknown as string
//   if (highlight && highlight.length > 0) {
//     try {
//       highlightUrl.value = atob(highlight)
//     } catch (e: any) {
//       console.error("highlight error", e)
//     }
//   }
// })



</script>
