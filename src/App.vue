<template>
  <router-view/>
</template>

<script setup lang="ts">

import {setCssVar, useQuasar} from "quasar";
import AppService from "src/services/AppService";
import {useRouter} from "vue-router";

const $q = useQuasar()
const router = useRouter()

// https://stackoverflow.com/questions/9768444/possible-eventemitter-memory-leak-detected
// const emitter = new EventEmitter()
// emitter.setMaxListeners(12)

let useDarkMode: string = $q.localStorage.getItem('darkMode') || "auto" as string

if ($q.platform.is.safari && !$q.platform.is.bex) {
  console.log("switching dark mode default to false on safari non-bex")
  useDarkMode = $q.localStorage.getItem('darkMode') || "false" as string
}

if (useDarkMode === "true") {
  $q.dark.set(true)
} else if (useDarkMode === "false") {
  $q.dark.set(false)
} else {
  $q.dark.set("auto")
}

if (useDarkMode === "true") {
  setCssVar('primary', '#D9E8F5');
  setCssVar('secondary', '#26A69A');
  setCssVar('accent', '#9C27B0');
  setCssVar('dark', '#1d1d1d');
  setCssVar('positive', '#21BA45');
  setCssVar('negative', '#C10015');
  setCssVar('info', '#31CCEC');
  setCssVar('separator', '#AA0099');
  // setCssVar('warning', 'green');
}

AppService.init($q, router, false)

</script>
