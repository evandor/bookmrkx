<template>
  <div class="row" style="border-bottom: 1px solid #efefef">
    <div class="col q-ma-sm text-h6">
      {{ tabset?.name }}
    </div>
    <div class="col text-right q-ma-sm">
      <div v-if="editMode">
        <template v-if="dirty">
          <q-btn class="cursor-pointer" @click="saveWork()"
                 icon="save" color="warning" size="sm" text-color="white" label="Save"/>
        </template>
        <template v-else>
          <!--          <q-btn  class="cursor-pointer q-mr-md" @click="newPage()"-->
          <!--                  icon="add" color="accent" size="sm" text-color="white" label="new Page..."/>-->
          <q-btn :disable="true" icon="save" color="warning" size="sm" text-color="white" label="Save"/>
        </template>
      </div>
      <div v-else>
        <!--        <q-btn class="cursor-pointer q-mr-md" @click="newPage()"-->
        <!--               icon="add" color="accent" size="sm" text-color="white" label="new Page..."/>-->
        <!--        <q-btn class="cursor-pointer q-mr-md" @click="newPage(true)"-->
        <!--               icon="add" color="accent" size="sm" text-color="white" label="new Sub-Page..."/>-->
        <q-btn class="cursor-pointer" @click="openInEditMode()"
               icon="edit" color="warning" size="sm" text-color="white" label="Edit"/>
      </div>
    </div>
  </div>

  <!-- https://medium.com/code4mk-org/editorjs-vue-a78110c3fff8 -->
  <div class="q-mx-xl q-px-md">
    <div class="editorx_body">
      <div v-if="editMode">
        <q-input type="text" class="text-h6 q-ml-lg" borderless v-model="title" placeholder="title..." autofocus/>
      </div>
      <div class="text-h6 q-ml-lg" v-else>
        {{ tab?.title }}
      </div>
      <div id="editorjs" ref="editorJsRef" @keyup="v => keyUpEvent()"/>
    </div>
  </div>

</template>

<script lang="ts" setup>

import 'regenerator-runtime/runtime'
import {onMounted, ref, watchEffect} from "vue";
import {useRoute, useRouter} from "vue-router";
import {uid, useMeta, useQuasar} from "quasar";
import {useTabsStore} from "src/stores/tabsStore";
import {Tab, UrlExtension} from "src/models/Tab";
import {useUtils} from "src/services/Utils";
import {useTabsetService} from "src/services/TabsetService2";
import {Tabset} from "src/models/Tabset";
import ChromeApi from "src/services/ChromeApi";
import EditorJS, {OutputData} from "@editorjs/editorjs";
//import 'regenerator-runtime/runtime'
import Analytics from "src/utils/google-analytics";

import EditorJsConfig from "src/utils/EditorJsConfig";

import './editorjs/linkTool.css';
import {v5 as uuidv5} from "uuid";
import {TabAndTabsetId} from "src/models/TabAndTabsetId";

const {formatDate, sendMsg, sanitize} = useUtils()

const route = useRoute()
const router = useRouter()

const noteId = ref<string | undefined>(undefined)
const tab = ref<Tab | undefined>(undefined)
const tabsetId = ref<string | undefined>(route.query.tsId as string)
const parentId = ref<string | undefined>(route.query.parent as string)
const tabset = ref<Tabset | undefined>(undefined)
const editMode = ref(false)
const closeOnSave = ref(false)
const title = ref('')
const originalTitle = ref('')
const editorJsRef = ref(null)
const dirty = ref(false)
const initialHash = ref<string | undefined>(undefined)

let editorJS2: EditorJS = undefined as unknown as EditorJS

useMeta(() => {
  console.debug("using meta...")
  return {
    // @ts-ignore
    title: 'Note: ' + title.value
  }
})

onMounted(() => {
  Analytics.firePageViewEvent('MainPanelNotePage', document.location.href);
})

watchEffect(() => {
  dirty.value = dirty.value || (title.value !== originalTitle.value)
  //console.log("set to dirty", dirty.value)
  // dirty.value ? window.onbeforeunload = (e) => {
  //   return '';
  // } : window.onbeforeunload = null
})

watchEffect(async () => {
  noteId.value = route.params.noteId as unknown as string
  editMode.value = route.query.edit ? route.query.edit === "true" : false
  closeOnSave.value = route.query.closeOnSave ? route.query.edit === "true" : false

  if (noteId.value) {
    const tabObject = useTabsStore().getTabAndTabsetId(noteId.value)
        //.then((tabObject: TabAndTabsetId | undefined) => {

          if (tabObject) {
            //console.log("got tabobject1", tabObject)
            tab.value = tabObject.tab
            tabsetId.value = tabObject.tabsetId
            tabset.value = useTabsetService().getTabset(tabsetId.value) as Tabset | undefined
            title.value = tabObject.tab?.title || 'unknown'

            if (tab.value.longDescription) {
              const json = JSON.stringify(tab.value.longDescription)
              console.log("tab.value.longDescription",json)
              initialHash.value = uuidv5(json, 'da42d8e8-2afd-446f-b72e-8b437aa03e46')
              console.log("initialHash", initialHash.value)
            }

            if (!originalTitle.value) {
              originalTitle.value = title.value
            }
            if (!editorJS2) {
              // @ts-ignore
              editorJS2 = new EditorJS({
                holder: "editorjs",
                readOnly: !editMode.value,
                data: (tab.value.longDescription || {}) as OutputData,
                tools: EditorJsConfig.toolsconfig
              });
            } else {
              if (editorJS2 && editorJS2.readOnly) {
                editorJS2.readOnly.toggle(!editMode.value)
              }
            }
          }
     //   })
  } else {
    console.log("new Note")

    if (!editorJS2) { // && !editorJS2.isReady) {
      // @ts-ignore
      editorJS2 = new EditorJS({
        holder: "editorjs",
        autofocus: true,
        readOnly: false,
        data: {} as OutputData,
        tools: EditorJsConfig.toolsconfig
      });
    }
  }

})

const saveWork = () => {

  console.log("saving note in tabset", tabsetId.value)

  editorJS2.save().then((outputData: any) => {
    console.log("setting original", title.value, sanitize(title.value))
    originalTitle.value = sanitize(title.value)
    if (tabsetId.value) {
      const tabset = useTabsetService().getTabset(tabsetId.value) as Tabset | undefined
      console.log("tabset", tabset, tab.value)
      if (tabset && tab.value) {
        //tab.value.description = description.value
        tab.value.title = sanitize(title.value)
        tab.value.longDescription = outputData //sanitize(outputData)
        //tab.value.parent = parentId.value
        console.log("saving note", tabset, tabsetId.value)
        // needed to update the note in the side panel
        sendMsg('note-changed', {tab: tab.value, tabsetId: tabsetId.value, noteId: noteId.value})
      } else if (tabset) { // new note
        const url = chrome.runtime.getURL('www/index.html') + "#" + route.fullPath
        const newTabId = uid()
        const newTab = new Tab(newTabId, ChromeApi.createChromeTabObject(sanitize(title.value), url, ""))
        newTab.tags.push("Note")
        newTab.extension = UrlExtension.NOTE
        newTab.longDescription = outputData
        //   useTabsetService().saveCurrentTabset()
        newTab.url = newTab.url?.split('?')[0] + newTabId
        //newTab.parent = parentId.value

        // lesson learned: execute code here and send message only to update dependent parts
        const tabset = useTabsetService().getTabset(tabsetId.value) as Tabset
        console.log("creating new note", newTab)
        //tabset.tabs.push(newTab)
        //useTabsetService().saveTabset(tabset)

        // needed to update the note in the side panel
        sendMsg('note-changed', {tab: newTab, tabsetId: tabsetId.value, src: 'MainPanelNoteEditPage'})
        // redirect after save
        router.push("/mainpanel/notes/" + newTabId)
        // chrome.tabs.getCurrent((tab:chrome.tabs.Tab | undefined) => {
        //   chrome.tabs.remove(tab?.id || 0, function() { });
        // });
      }
    } else {
      console.warn("tabset id missing")
    }
  }).catch((error: any) => {
    console.log('Saving failed: ', error)
  });

}

const openInEditMode = () => router.push('./' + tab.value?.id + '?edit=true&tsId=' + tabsetId.value)

const keyUpEvent = () => {
  // editorJS2.save().then((outputData: any) => {
  //   console.log("outputData", outputData)
  //   console.log("outputData", uuidv5(JSON.stringify(outputData), 'da42d8e8-2afd-446f-b72e-8b437aa03e46'))
  //   dirty.value = uuidv5(JSON.stringify(outputData), 'da42d8e8-2afd-446f-b72e-8b437aa03e46') !== initialHash.value
  // })
  dirty.value = true
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
