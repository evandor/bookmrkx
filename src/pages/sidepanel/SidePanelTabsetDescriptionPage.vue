<template>
  <div class="row q-ma-none q-pa-none" v-show="showDescription"
       @mouseover="showTabsetPageEdit = true"
       @mouseleave="showTabsetPageEdit = false"
       style="border-top:1px dotted grey">
    <!--   <div class="col-12">{{ props.tabsetDesc }}</div>-->
    <div class="col-11">
      <q-scroll-area style="width:100%"
                     :style="'height:' + scrollAreaHeight + 'px'"
                     :thumb-style="thumbStyle as unknown as Partial<CSSStyleDeclaration>"
                     :bar-style="barStyle as unknown as Partial<CSSStyleDeclaration>">
        <div class="editorx_body">
          <div :id="'editorjs_' + tabsetId"/>
        </div>
      </q-scroll-area>


    </div>
    <div class="col bg-white text-right">
      <q-icon v-if="showTabsetPageEdit" class="cursor-pointer q-mr-xs q-mt-xs" name="edit" color="primary"
              @click="openTabsetPage()" size="12px">
        <q-tooltip class="tooltip-small">Edit Description</q-tooltip>
      </q-icon>
      <br>
      <q-icon v-if="showTabsetPageEdit" class="cursor-pointer q-mr-xs q-mt-xs" name="expand_less" color="primary"
              @click="changeSize(-10)" size="12px">
        <q-tooltip class="tooltip-small">Decrease Size</q-tooltip>
      </q-icon>
      <br>
      <q-icon v-if="showTabsetPageEdit" class="cursor-pointer q-mr-xs q-mt-xs" name="expand_more" color="primary"
              @click="changeSize(10)" size="12px">
        <q-tooltip class="tooltip-small">Increase Size</q-tooltip>
      </q-icon>
      <br>
      <q-icon v-if="showTabsetPageEdit" class="cursor-pointer q-mr-xs q-mt-xs" name="close" color="primary"
              @click="toggleDesc()" size="12px">
        <q-tooltip class="tooltip-small">Hide</q-tooltip>
      </q-icon>
      <br>
      <q-icon v-if="showTabsetPageEdit" class="cursor-pointer q-mr-xs q-mt-xs" name="delete" color="negative"
              @click="deleteTabsetDescription()" size="12px">
        <q-tooltip class="tooltip-small">Delete Description</q-tooltip>
      </q-icon>
      <br>
    </div>
  </div>

  <div class="row q-ma-none q-pa-none" v-show="!showDescription">
    <div class="col-12 text-right">
      <q-icon class="cursor-pointer q-mr-xs q-mt-xs" name="edit" color="primary"
              @click="openTabsetPage()" size="12px">
        <q-tooltip class="tooltip-small">Edit Description</q-tooltip>
      </q-icon>
      <q-icon class="cursor-pointer q-mr-xs q-mt-xs" name="expand_more" color="primary"
              @click="toggleDesc()" size="12px">
        <q-tooltip class="tooltip-small">Show Description</q-tooltip>
      </q-icon>
    </div>
  </div>

</template>

<script lang="ts" setup>

import {onMounted, PropType, ref, watchEffect} from "vue";
import EditorJS, {OutputData} from "@editorjs/editorjs";
import EditorJsConfig from "src/utils/EditorJsConfig";
import {openURL} from "quasar";
import {useCommandExecutor} from "src/services/CommandExecutor";
import {DeleteTabsetDescriptionCommand} from "src/domain/tabsets/DeleteTabsetDescriptionCommand";
import {useUiStore} from "stores/uiStore";

const props = defineProps({
  tabsetId: {type: String, required: true},
  tabsetDesc: {type: Object, required: true}
})

const showDescription = ref(false)
const showTabsetPageEdit = ref(false)
const scrollAreaHeight = ref(50)

onMounted(() => {
  showDescription.value = useUiStore().showTabsetDescription(props.tabsetId) as boolean
})

const thumbStyle = {
  right: '4px',
  borderRadius: '5px',
  backgroundColor: '#027be3',
  width: '5px',
  opacity: 0.75
}

const barStyle = {
  right: '2px',
  borderRadius: '9px',
  backgroundColor: '#027be3',
  width: '9px',
  opacity: 0.2
}

let editorJS2: EditorJS = undefined as unknown as EditorJS

onMounted(() => {
  if (!editorJS2) {
    // @ts-ignore
    editorJS2 = new EditorJS({
      holder: "editorjs_" + props.tabsetId,
      autofocus: true,
      readOnly: false,
      minHeight: 1,
      data: (props.tabsetDesc || {}) as OutputData,
      tools: EditorJsConfig.toolsconfig
    });
    // if the editor is readonly from the start, I cannot update it when tabset.page changes
    setTimeout(() => {
      if (editorJS2 && editorJS2.readOnly) {
        editorJS2.readOnly.toggle(true)
      }
    }, 1000)
  }
})

watchEffect(async () => {
  console.debug("updating", props.tabsetDesc !== undefined) // log seems necessary here !?!
  if (editorJS2) {
    await editorJS2.readOnly.toggle(false)
    await editorJS2.blocks.clear()
    await editorJS2.blocks.render((props.tabsetDesc || {}) as OutputData)
    await editorJS2.readOnly.toggle(true)
  }
})

watchEffect(() => {
  //const blocksCount = props.tabsetDesc ? props.tabsetDesc['blocks' as keyof object].length : 0
  //let minHeight = Math.min(20 + blocksCount * 30, 110)
  const fromStore = useUiStore().getTabsetDescriptionHeight(props.tabsetId)
  if (fromStore === undefined) {
    const blocksCount = props.tabsetDesc ? props.tabsetDesc['blocks' as keyof object]?.length : 0
    let minHeight = Math.min(20 + blocksCount * 30, 110)
    scrollAreaHeight.value = minHeight
    useUiStore().setTabsetDescriptionHeight(props.tabsetId, minHeight)
  } else {
    scrollAreaHeight.value = fromStore
  }
})

const openTabsetPage = () => openURL(chrome.runtime.getURL("/www/index.html#/tabsets/" + props.tabsetId + "?tab=page"))

// function calcExpandedHeight() {
//   const valExists = useUiStore().getTabsetDescriptionHeight(props.tabsetId)
//   if (valExists === undefined) {
//     const blocksCount = props.tabsetDesc ? props.tabsetDesc['blocks' as keyof object].length : 0
//     let minHeight = Math.min(20 + blocksCount * 30, 110)
//     return minHeight
//   } else {
//     scrollAreaHeight.value = valExists
//     useUiStore().setTabsetDescriptionHeight(props.tabsetId, valExists)
//   }
// }

const toggleDesc = () => {
  showDescription.value = !showDescription.value
  useUiStore().setShowTabsetDescription(props.tabsetId, showDescription.value)
}

const changeSize = (diff: number) => {
  const current = useUiStore().getTabsetDescriptionHeight(props.tabsetId)
  if (current !== undefined) {
    useUiStore().setTabsetDescriptionHeight(props.tabsetId, Math.max(0, current + diff))
  }
}

const deleteTabsetDescription = () =>
  useCommandExecutor().executeFromUi(new DeleteTabsetDescriptionCommand(props.tabsetId, props.tabsetDesc))


</script>

<style>
.editorx_body {
  max-width: 1000px;
  margin: 0px auto;
  box-sizing: border-box;
  border: 0 solid #eee;
  border-radius: 5px;
  padding: 10px;
  box-shadow: 0 6px 18px #e8edfa80;
}

.ce-block__content,
.ce-toolbar__content {
  max-width: none;
}

.ce-paragraph {
  font-size: 12px;
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
  max-width: calc(100% - 50px);
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
