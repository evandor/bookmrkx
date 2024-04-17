<template>

  <div class="row q-ma-none q-pa-none" style="border:1px dotted #bfbfbf">
    <div class="col-1 bg-white">
      <div>
        <q-btn flat icon="horizontal_rule" color="grey-6" @click="addLine()"/>
      </div>
      <div>
        <q-btn flat icon="o_stop" color="grey-6" @click="addRectangle()"/>
      </div>
      <div>
        <q-btn flat icon="text_fields" color="grey-6" @click="addText()"/>
      </div>
    </div>
    <div class="col-8 q-ma-none q-pa-none">
      <div id="idraw" ref="mount" class="q-ma-none q-pa-none"></div>
    </div>
    <div class="col-3 bg-white q-pa-sm" style="border-left: 1px solid #bfbfbf">
      <div v-if="selectedFigure">
        {{ selectedFigure}}
        <q-btn icon="delete" @click="deleteFigure(selectedFigure['uuid' as keyof object])"/>
      </div>
      <PanelTabListElementWidget
          v-else-if="selectedTab"
          :key="'cft__' + selectedTab.id"
          :hideMenu="true"
          :preventDragAndDrop="true"
          :tab="selectedTab"
      />
    </div>
  </div>

</template>

<script setup lang="ts">
import iDraw from 'idraw';
import {onMounted, ref, watchEffect} from 'vue'
import {useRoute} from "vue-router";
import {useTabsetService} from "src/services/TabsetService2";
import {Tabset} from "src/models/Tabset";
import {useTabsStore} from "stores/tabsStore";
import {Tab} from "src/models/Tab";
import PanelTabListElementWidget from "components/widgets/PanelTabListElementWidget.vue";
import IDrawUtils from "src/utils/IDrawUtils";
import {uid} from "quasar";
import _ from "lodash"
import {TabAndTabsetId} from "src/models/TabAndTabsetId";

const route = useRoute()

const mount = ref();
let idraw: any = undefined;
const tabsetId = ref<string | undefined>(route.query.tsId as string)
const tabset = ref<Tabset | undefined>(undefined)
const selectedFigure = ref<object | undefined>(undefined)
const selectedTab = ref<Tab | undefined>(undefined)
const selectedTabsetId = ref<string | undefined>(undefined)

const options = {
  width: 800,
  height: 400,
  contextWidth: 800,
  contextHeight: 400,
  devicePixelRatio: 4,
  onlyRender: true
}
const config = {
  scrollWrapper: {
    use: true,
    width: 16,
    color: '#666666',
  },
  elementWrapper: {
    color: '#e91e63',
    controllerSize: 8,
    lineWidth: 1,
    lineDash: [12, 12],
  },
}

function init() {
  console.log("mount.value", mount.value)
  idraw = new iDraw(mount.value, options, config)
  if (tabset.value) {
    if (tabset.value.canvas) {
      console.log("got canvas data", tabset.value.canvas)
      idraw.setData({elements: tabset.value.canvas})
    }

    let offset = 20
    for (const t of tabset.value.tabs) {
      let y = offset
      if (t.canvasTop) {
        y = t.canvasTop
      } else {
        offset += 40
      }
      idraw.addElement(IDrawUtils.createTab(t, y))
    }
  }
}

onMounted(() => {
  console.log("mounting...")

  init()

  idraw.on('changeData', (e: any) => {
    console.log('changeData: event = ', e);
    let tabId = undefined
    if (selectedTab.value) {
      saveCanvasElements()
      for (const element of e.elements) {
        if (element.name === "tab-" + selectedTab.value?.id) {
          console.log("found", element)
          selectedTab.value.canvasTop = element.y
          selectedTab.value.canvasLeft = element.x
          selectedTab.value.canvasHeight = element.h
          selectedTab.value.canvasWidth = element.w

          // console.log("selectedTab", selectedTab)

          // assuming we are in the "current tabset"
          useTabsetService().saveCurrentTabset()
        }
      }


    }
  });

  idraw.on('screenSelectElement', (e: any) => {
    console.log('screenSelectElement: event = ', e.element);
    if (e.element.name.startsWith("tab-")) {
      const tabId = e.element.name.replace("tab-", "")
      const tabData = useTabsStore().getTabAndTabsetId(tabId)
       //   .then((tabData: TabAndTabsetId | undefined) => {
            if (tabData) {
              selectedTab.value = tabData.tab
              selectedTabsetId.value = tabData.tabsetId
            }
       //   })
      selectedFigure.value = undefined
    } else {
      selectedFigure.value = e.element
    }

  });
})

watchEffect(() => {
  tabsetId.value = route.params.tabsetId as string
  console.log("watchEffect", tabsetId.value)
  if (tabsetId.value) {
    // if (mount.value) {
    //   init()
    // }
    //console.log("got tabset id", tabsetId.value)
    tabset.value = useTabsetService().getTabset(tabsetId.value) as Tabset | undefined
    useTabsStore().selectCurrentTabset(tabsetId.value)
  }
})

function saveCanvasElements() {
  const nonTabElements = _.filter(idraw.getData().elements, e => !e.name.startsWith('tab-'))
  if (tabset.value) {
    tabset.value.canvas = nonTabElements
    console.log("saving non tab elements", nonTabElements)
    useTabsetService().saveCurrentTabset()
  }
}

const addText = () => {
  idraw.insertElementBeforeIndex(IDrawUtils.createText("text-" + uid()), 0);
  saveCanvasElements();
}

const addRectangle = () => {
  idraw.insertElementBeforeIndex(IDrawUtils.createRectangle(), 0);
  saveCanvasElements();
}
const addLine = () => {
  idraw.insertElementBeforeIndex(IDrawUtils.createLine(), 0);
  saveCanvasElements();
}

const deleteFigure = (uuid: string) => {
  idraw.deleteElement(uuid)
  saveCanvasElements()
}

</script>

<style>
#idraw {
  margin-top: 0px;
  text-align: center;
}

#idraw canvas {
  border-right: 1px solid #aaaaaa00;
  border-bottom: 1px solid #aaaaaa00;
  background-image: linear-gradient(#aaaaaa00 1px, transparent 0),
  linear-gradient(90deg, #aaaaaa00 1px, transparent 0),
  linear-gradient(#aaaaaa00 1px, transparent 0),
  linear-gradient(90deg, #aaaaaa00 1px, transparent 0);
  background-size: 10px 10px, 10px 10px, 50px 50px, 50px 50px;
}
</style>
