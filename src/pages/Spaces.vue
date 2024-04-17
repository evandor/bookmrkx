<template>
  <q-page padding>

    <div class="text-h5 q-ma-md">
      Spaces Settings
    </div>

    <div class="row q-pa-md" style="border-bottom: 1px solid grey">
      <div class="col-2"></div>
      <div class="col q-ml-lg" >
        <b>Spaces</b>
      </div>
    </div>
    <div class="row q-pa-md">
      <div class="col-2" style="border-right: 1px solid grey"><b>Tabset</b></div>
      <div class="col q-ml-lg" v-for="space in spacesStore.spaces.values()">
        {{ space.label }}
      </div>
    </div>
    <div class="row q-pa-none" style="border-bottom: 1px solid grey">
      <div class="col-12"></div>
    </div>
    <div class="row q-px-md" v-for="(ts,tsIndex) in tabsStore.tabsets.values()" >
      <div class="col-2" style="border-right: 1px solid grey">{{ ts.name }}</div>
      <div class="col q-ml-lg" v-for="(space, spaceIndex) in spacesStore.spaces.values()">
        <q-checkbox v-model="checked[spaceIndex][tsIndex]"/>
      </div>
    </div>
    <div class="row q-pa-none" style="border-bottom: 1px solid grey">
      <div class="col-12"></div>
    </div>
    <div class="row q-px-md">
      <div class="col-2" style="border-right: 1px solid grey">Delete Space<br>(will not delete the tabsets)</div>
      <div class="col q-ml-lg" v-for="(space, spaceIndex) in [...spacesStore.spaces.values()]">
        <q-checkbox color="negative" v-model="deleteSpace[spaceIndex]"/>
      </div>
    </div>
    <div class="row q-pa-none" style="border-bottom: 1px solid grey">
      <div class="col-12"></div>
    </div>
    <div class="row q-pa-md">
      <div class="col">
        <q-btn flat
               class="bg-positive"
               data-testid="spaceEditedSubmit"
               label="Update Spaces"
               @click="updateSpaces()"/>
      </div>
    </div>

  </q-page>

</template>

<script lang="ts" setup>

import {useTabsStore} from "src/stores/tabsStore";
import {useSpacesStore} from "src/stores/spacesStore";
import {ref, watchEffect} from "vue"
import _ from "lodash"
import {Space} from "src/models/Space"
import {Tabset} from "src/models/Tabset";
import TabsetService from "src/services/TabsetService";
import {useRouter} from "vue-router";
import {useTabsetService} from "src/services/TabsetService2";

const spacesStore = useSpacesStore()
const tabsStore = useTabsStore()
const checked = ref<boolean[][]>([[]])
const deleteSpace = ref<boolean[]>([])
const router = useRouter()

watchEffect(() => {
  const spaceArray: boolean[][] = []
  deleteSpace.value = []
  _.forEach([...spacesStore.spaces.values()], (space: Space) => {
    deleteSpace.value.push(false)
    const tsArray: Array<boolean> = []
    _.forEach([...tabsStore.tabsets.values()], (ts: Tabset) => {
      //console.log("checking", space.id, ts.id)
      tsArray.push(ts.spaces.indexOf(space.id) >= 0)
    })
    spaceArray.push(tsArray)
  })
  console.log("spaceArray", spaceArray)
  console.log("deleteSpace", deleteSpace.value)

  checked.value = spaceArray
})

const updateSpaces = () => {
 // console.log("updated", checked.value)

  _.forEach([...tabsStore.tabsets.values()], (ts: Tabset, tabsetIndex: number) => {
    const spaces: Array<string> = []
    _.forEach([...spacesStore.spaces.values()], (space: Space, spaceIndex: number) => {
      if (checked.value[spaceIndex][tabsetIndex]) {
        spaces.push(space.id)
      }
    })
    console.log("result", ts.id, spaces)
    ts.spaces = spaces

    useTabsetService().saveTabset(ts)
  })

  _.forEach([...spacesStore.spaces.values()], (space: Space, spaceIndex: number) => {
    if (deleteSpace.value[spaceIndex]) {
      console.log("deleting space", space)
      useSpacesStore().deleteById(space.id)
    }
  })

  router.push("/tabsets/" + tabsStore.currentTabsetId)

}


</script>
