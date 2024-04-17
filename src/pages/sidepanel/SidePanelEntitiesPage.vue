<template>

  <q-page padding style="padding-top: 45px">

    <div class="q-ma-none">
      <div class="q-ma-none">
        <div class="row q-ma-none q-pa-none cursor-pointer" v-for="e in entities">
          <div class="col-12 q-ma-none q-pa-none q-pt-lg">
            {{ e.name }}
            [<span @click="openEntityInMainPanel(e.id + '/items')">Add</span>]
            [<span @click="openEntityInMainPanel(e.id)">Manage</span>]
          </div>
          <div class="col-12">
            <ul>
              <li v-for="i in e.items"
                  @click="openItemInMainPanel(e.id,i.id)">{{ getLineFor(i, e) }}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <!-- place QPageSticky at end of page -->
    <q-page-sticky expand position="top" class="darkInDarkMode brightInBrightMode">
      <FirstToolbarHelper title="Entity Manager">

        <template v-slot:iconsRight>

          <q-btn outline
                 label="New Entity"
                 color="primary"
                 size="sm"
                 @click="openNewEntityDialog()"
                 class="q-ma-none q-px-sm q-py-none"
                 name="o_apps"/>

          <!--          <q-btn outline-->
          <!--                 label="New Formula"-->
          <!--                 color="primary"-->
          <!--                 size="sm"-->
          <!--                 @click="openNewFormulaDialog()"-->
          <!--                 class="q-ma-none q-px-sm q-py-none"-->
          <!--                 name="o_apps"/>-->

          <SidePanelToolbarButton
            icon="close"
            tooltip="Close this view"
            @click="useUiStore().sidePanelSetActiveView(SidePanelView.MAIN)"
            color="black"/>
        </template>

      </FirstToolbarHelper>
    </q-page-sticky>

  </q-page>

</template>

<script lang="ts" setup>

import FirstToolbarHelper from "pages/sidepanel/helper/FirstToolbarHelper.vue";
import {SidePanelView, useUiStore} from "stores/uiStore";
import {onMounted, ref, watch, watchEffect} from "vue";
import Analytics from "src/utils/google-analytics";
import SidePanelToolbarButton from "components/buttons/SidePanelToolbarButton.vue";
import {openURL, useQuasar} from "quasar";
import NewEntityDialog from "components/dialogues/NewEntityDialog.vue";
import {Entity} from "src/models/Entity";
import {useEntitiesStore} from "stores/entitiesStore";
import NavigationService from "src/services/NavigationService";
import NewFormulaDialog from "components/dialogues/NewFormulaDialog.vue";
import _ from "lodash"

onMounted(() => {
  Analytics.firePageViewEvent('SidePanelEntityManager', document.location.href);
})

const $q = useQuasar()

const entities = ref<Entity[]>([])

watch(() => {
}, (oldValue: any, newValue: any) => {
  console.log("old->new", oldValue, newValue)
})

watchEffect(() => {
  if (useEntitiesStore().updated) {
    entities.value = useEntitiesStore().entities
    console.log("***got entites", entities.value)
  }
})

chrome.runtime.onMessage.addListener((m: any, s: any, response: any) => {
  if (m.name === 'entity-changed') {
    useEntitiesStore().save(m.data)
      .then(() => {
        entities.value = useEntitiesStore().entities
        console.log("onMessage: hier", m, entities.value)
        return true
      })
  } else if (m.name === 'reload-entities') {
    entities.value = useEntitiesStore().entities
    console.log("reloaded entities", entities.value)
    return true
  }
  return true
})

const openEntityInMainPanel = (path: string) =>
  NavigationService.openOrCreateTab([chrome.runtime.getURL("/www/index.html#/mainpanel/entities/" + path)], undefined, [], true, true)

const openItemInMainPanel = (entityId: string, itemId: string) =>
  NavigationService.openOrCreateTab([chrome.runtime.getURL("/www/index.html#/mainpanel/entities/" + entityId + "/items/" + itemId)], undefined, [], true, true)

const openNewEntityDialog = () => {
  $q.dialog({
    component: NewEntityDialog,
    componentProps: {}
  })
}

const getLineFor = (item: object, e: Entity) => {
  console.log("item, e", item, e)
  if (e.labelField) {
    // const field = _.find(e.fields, f => f.name === e.labelField)
    // if (field) {
    //   switch (field.type) {
    //     case 'substitute':
    //
    //     default:
    //   }
    // }
    return item[e.labelField as keyof object]
  }
  return e.name ? item[e.name as keyof object] : item[e.id as keyof object]
}

const openNewFormulaDialog = () => {
  $q.dialog({
    component: NewFormulaDialog,
    componentProps: {}
  })
}
</script>
