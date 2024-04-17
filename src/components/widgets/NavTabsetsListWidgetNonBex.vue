<template>
  <div class="q-ma-none q-pa-none" style="max-width:300px">
    <q-list dense>

      <q-item v-for="(tabset,index) in tabsets" class="darken-on-hover">
        <q-item-section class="cursor-pointer q-ma-none q-pa-none"
                        @drop="onDrop($event, tabset.id)"
                        @dragover.prevent
                        @dragenter.prevent
                        :class="activeTabset === tabset.id ? 'active-list-element' : ''"
                        @click="selectTS(tabset)">
          <q-item-label>
            <template v-slot>

              <div class="row">
                <div class="col-10 ellipsis">
                  <q-icon name="stars" color="warning" class="q-ml-none q-mr-sm"
                          v-if="tabset.status === TabsetStatus.FAVORITE">
                    <q-tooltip class="tooltip">This tabset is marked as 'favorite'</q-tooltip>
                  </q-icon>
                  <q-icon name="explore" color="primary" class="q-ml-none q-mr-sm"
                          v-if="tabset.type === TabsetType.SESSION">
                    <q-tooltip>This is a 'session' tabset, keeping track of your tabs automatically</q-tooltip>
                  </q-icon>
                  <q-icon name="share" color="primary" class="q-ml-none q-mr-sm"
                          v-if="tabset.sharedBy">
                    <q-tooltip>This tabset is shared by {{ tabset.sharedBy }}</q-tooltip>
                  </q-icon>
                  <q-icon name="build_circle" color="primary" class="q-ml-none q-mr-sm"
                          v-if="tabset.type === TabsetType.DYNAMIC">
                    <q-tooltip class="tooltip">The tabs of this tabset have been generated automatically</q-tooltip>
                  </q-icon>
                  {{ tabset.name }}
                </div>
              </div>

            </template>
          </q-item-label>

        </q-item-section>
        <q-item-section class="text-right q-mx-sm cursor-pointer"
                        @mouseover="hoveredTab = tabset.id"
                        @mouseleave="hoveredTab = undefined"
                        style="max-width:25px;font-size: 12px;color:#bfbfbf">
            <span v-if="hoveredOver(tabset.id)">
              <q-icon name="more_horiz" color="primary" size="16px"/>
            </span>
          <span v-else-if="tabset.type === TabsetType.DYNAMIC">
              -
            </span>
          <span v-else>
                {{ tabset.tabs.length }}
            </span>

        </q-item-section>
      </q-item>
    </q-list>
  </div>

</template>

<script lang="ts" setup>

import {PropType, ref, watchEffect} from "vue";
import {Tabset, TabsetStatus, TabsetType} from "src/models/Tabset";
import {useRouter} from "vue-router";
import {openURL, useQuasar} from "quasar";
import {useCommandExecutor} from "src/services/CommandExecutor";
import {SelectTabsetCommand} from "src/domain/tabsets/SelectTabset";
import {useUiStore} from "src/stores/uiStore";

const router = useRouter()

const $q = useQuasar();
const hoveredTab = ref<string | undefined>(undefined)

const props = defineProps({
  tabsets: {type: Array as PropType<Array<Tabset>>, required: true},
  spaceId: {type: String, required: false},
  fromPanel: {type: Boolean, default: false}
})

const selectTS = (tabset: Tabset) => {
  console.log("selecting tabset/space", tabset.id, props.spaceId)
  useCommandExecutor()
    .execute(new SelectTabsetCommand(tabset.id, props.spaceId))
    .then(() => {
      console.log("tabset was selected", tabset.id, tabset.type, props.fromPanel)
      if (!props.fromPanel) {
        tabset.type === TabsetType.DYNAMIC ?
          router.push("/dynamicTs/" + tabset.id) :
          router.push("/tabsets/" + tabset.id)
      } else {
        tabset.type === TabsetType.DYNAMIC ?
          router.push("/sidepanel/dynamicTs/" + tabset.id) :
          router.push("/sidepanel")
      }
    })
}

const onDrop = (evt: DragEvent, tabsetId: string) => {
  const tabId = useUiStore().droppingTab()
  if (evt.dataTransfer && tabId) {
  }
}

const hoveredOver = (tabsetId: string) => hoveredTab.value === tabsetId

</script>

<style>
.q-expansion-item__content {
  border: 1px solid #f5f5f5
}

.darken-on-hover:hover {
  background-color: #efefef !important;
}

</style>
