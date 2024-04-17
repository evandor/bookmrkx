<template>
  <q-page
    :style="open ?
        'background-color:white;border: 2px dotted rgba(0, 0, 0, 0.3);border-radius:5px;' :
        'background-color:white;border: 1px dashed rgba(0, 0, 0, 0.3);border-radius:4px 0px 0px 4px;'">
    <template v-if="open">
      <q-toolbar>
        <q-toolbar-title>

          {{ selectedTabset ? selectedTabset.name : "Tabsets" }}</q-toolbar-title>
        <q-icon size="md" name="chevron_right" class="cursor-pointer"
                @click="closeContentScriptFrame(true)"></q-icon>
      </q-toolbar>
    </template>

    <template v-else>
      <q-icon size="xs" name="chevron_left" class="cursor-pointer q-ma-none q-pa-none"
              @click="closeContentScriptFrame(false)"></q-icon>
      <q-img
        class="q-ma-none cursor-pointer"
        @click="closeContentScriptFrame(false)"
        src="favicon.ico" height="16px" width="16px" />
    </template>

    <template v-if="open">
      <div class="q-ma-md">
        <q-btn label="add" v-if="!alreadyInTabset()" @click="saveInSelectedTabset()"/>
        <hr>
        <q-input v-if="alreadyInTabset()" dense
                 hint="Add/Publish Comment"
                 type="textarea" v-model="comment" />
      </div>
    </template>
  </q-page>
</template>

<script lang="ts" setup>
import {useUtils} from "src/services/Utils";
import {onMounted, ref, watchEffect} from "vue";
import {useTabsStore} from "stores/tabsStore";
import {useTabsetService} from "src/services/TabsetService2";
import {useCommandExecutor} from "src/services/CommandExecutor";
import {AddTabToTabsetCommand} from "src/domain/tabs/AddTabToTabsetCommand"
import {Tab} from "src/models/Tab";
import {uid} from "quasar";
import {Tabset} from "src/models/Tabset";

const {sendMsg} = useUtils()

const open = ref(false)
const currentChromeTab = ref<chrome.tabs.Tab | undefined>(undefined)
const selectedTabset = ref<Tabset | undefined>(undefined)
const comment = ref('')

onMounted(() => chrome.tabs.getCurrent().then((t: chrome.tabs.Tab | undefined) => currentChromeTab.value = t))

watchEffect(() => selectedTabset.value = useTabsetService().getCurrentTabset())

const closeContentScriptFrame = (close: boolean) => {
  console.log("closeContentScriptFrame...", useTabsetService().getCurrentTabset())
  if (close) {
    window.parent.postMessage({height:"40px", width:"30px", top:"80px", right:"0px"}, "*");
  } else {
    window.parent.postMessage({height:"440px", width:"220px", top:"75px", right:"5px"}, "*");
  }
  console.log("document5", document.parentElement?.style)
  //console.log("document4", window.document.getElementById('ts-contentscript-iframe'))
  if (currentChromeTab.value) {
    //sendMsg('toggle-cs-iframe', {tabId: currentChromeTab.value.id, close})
    open.value = !close
  }
}

const alreadyInTabset = () =>
  (currentChromeTab.value?.url && useTabsStore().getCurrentTabset) ?
    useTabsetService().urlExistsInCurrentTabset(currentChromeTab.value.url) :
    false

const saveInSelectedTabset = () => {
  if (!selectedTabset.value || alreadyInTabset()) {
    return
  }
  useCommandExecutor().execute(new AddTabToTabsetCommand(new Tab(uid(), currentChromeTab.value), selectedTabset.value))
}


</script>
