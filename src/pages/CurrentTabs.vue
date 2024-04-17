<template>

  <!-- redirecting -->


</template>

<script setup lang="ts">

import {useRouter} from "vue-router";
import {useTabsStore} from "src/stores/tabsStore";

const router = useRouter()
const tabsStore = useTabsStore()

router.push("/tabsets/" + tabsStore.currentTabsetId)

</script>
