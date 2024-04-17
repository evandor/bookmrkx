<template>

  <div class="q-mx-xl q-px-md">
    <div class="editorx_body">
      <div id="editorjs" ref="editorJsRef" @keyup="v => keyUpEvent()"/>
    </div>
  </div>

</template>

<script setup lang="ts">

// without this, getting "EvalError: Refused to evaluate a string as JavaScript because 'unsafe-eval' is not an allowed"
import 'regenerator-runtime/runtime'
import {ref, watchEffect} from "vue";
import {useRoute} from "vue-router";
import {useTabsStore} from "src/stores/tabsStore";
import {Tab} from "src/models/Tab";
import {useUtils} from "src/services/Utils";
import {Tabset, TabsetSharing} from "src/models/Tabset";
import EditorJS, {OutputData} from "@editorjs/editorjs";

import EditorJsConfig from "src/utils/EditorJsConfig";
import {useTabsetService} from "src/services/TabsetService2";

const {formatDate, sendMsg, sanitize} = useUtils()

const tabsStore = useTabsStore()
const route = useRoute()

const tab = ref<Tab | undefined>(undefined)
const tabsetId = ref<string | undefined>(route.query.tsId as string)
const tabset = ref<Tabset | undefined>(undefined)
const dirty = ref(false)

let savingInterval: NodeJS.Timeout | undefined = undefined

let editorJS2: EditorJS = undefined as unknown as EditorJS

watchEffect(() => {
  tabsetId.value = route.params.tabsetId as string
  if (tabsetId.value) {
    console.debug("got tabset id", tabsetId.value)
    tabset.value = useTabsetService().getTabset(tabsetId.value) as Tabset | undefined
    tabsStore.selectCurrentTabset(tabsetId.value)

    if (tabset.value && !editorJS2) { // && !editorJS2.isReady) {
      // @ts-ignore
      editorJS2 = new EditorJS({
        holder: "editorjs",
        autofocus: true,
        readOnly: false,
        data: (tabset.value.page || {}) as OutputData,
        tools: EditorJsConfig.toolsconfig
      });
    }
  }
})

const keyUpEvent = () => {
  if (!dirty.value) {
    console.log("setting dirty, starting save interval")
    savingInterval = setInterval(() => {
      saveWork()
    }, 2000)
  }
  dirty.value = true
}

const saveWork = () => {

  console.log("saving", tabsetId.value)

  editorJS2.save().then((outputData: any) => {
    if (tabsetId.value) {

      console.log("tabset", tabset, tab.value)
      if (tabset.value) {
        tabset.value.page = outputData // TODO sanitize?
        console.log("saving tabset page content", tabset, tabsetId.value)
        // needed to update the content in the side panel
        //sendMsg('note-changed', {tab: tab.value, tabsetId: tabsetId.value, noteId: noteId.value})
        sendMsg('reload-tabset', {tabsetId: tabsetId.value})

        // Sharing
        if (tabset.value.sharedId && tabset.value.sharing === TabsetSharing.PUBLIC_LINK) {
          tabset.value.sharing = TabsetSharing.PUBLIC_LINK_OUTDATED
          tabset.value.sharedAt = new Date().getTime()
        }

        useTabsetService().saveTabset(tabset.value as Tabset)
        dirty.value = false
        if (savingInterval) {
          console.log("clearing interval")
          clearInterval(savingInterval)
        }
      }
    } else {
      console.warn("tabset id missing")
    }
  }).catch((error: any) => {
    console.log('Saving failed: ', error)
  });

}


</script>

<style>
.editorx_body {
  max-width: 1000px;
  margin: 0px auto;
  height: 200px;
  box-sizing: border-box;
  border: 0 solid #eee;
  border-radius: 5px;
  padding: 10px;
  /* box-shadow: 0 6px 18px #e8edfa80; */
}

.ce-block__content,
.ce-toolbar__content {
  max-width: none;
}

.ce-paragraph {
  font-size: 16px;
}

/* editorjsColumns */

.ce-editorjsColumns_col {
  border: 1px solid #eee;
  border-radius: 5px;
  gap: 10px;
  padding-top: 10px;
}

.ce-editorjsColumns_col:focus-within {
  box-shadow: 0 6px 18px #e8edfa80;
}

@media (max-width: 800px) {
  .ce-editorjsColumns_wrapper {
    flex-direction: column;
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 4px;
  }
}

.ce-inline-toolbar {
  z-index: 1000
}

.ce-block__content,
.ce-toolbar__content {
  max-width: calc(100% - 50px); /* example value, adjust for your own use case */
}

/*   */
.ce-toolbar__actions {
  right: calc(100% + 30px);
  background-color: rgba(255, 255, 255, 0.5);
  border-radius: 4px;
}

/* Would be better to remove --narrow mode */
/* Issue Raised */
/* // This causes an error which is good i think? */
.codex-editor--narrow .codex-editor__redactor {
  margin: 0;
}

/* Required to prevent clipping */
.ce-toolbar {
  z-index: 4;
}

.codex-editor {
  /* background:#f00 !important; */
  z-index: auto !important;
}


</style>
