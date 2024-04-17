<template>

  <q-page padding style="padding-top: 45px">

    <div class="q-ma-none">
      <div class="q-ma-none">
        <div class="row q-ma-none q-pa-none cursor-pointer" v-for="e in apis">
          <div class="col-12 q-ma-none q-pa-none q-pt-lg">
            {{ e.name }}
            [<span @click="openEndpointInMainPanel(e.id ,'')">Add Endpoint</span>]
            [<span @click="openApiInMainPanel(e.id)">Manage</span>]
          </div>
          <div class="col-12">
            <ul>
              <li v-for="i in e.endpoints"
                  @click="openEndpointInMainPanel(e.id,i.id)">{{ i.path }}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <!-- place QPageSticky at end of page -->
    <q-page-sticky expand position="top" class="darkInDarkMode brightInBrightMode">
      <FirstToolbarHelper title="APIs Manager">

        <template v-slot:iconsRight>

          <q-btn outline
                 label="New API"
                 color="primary"
                 size="sm"
                 @click="openNewApiDialog()"
                 class="q-ma-none q-px-sm q-py-none"
                 name="o_apps"/>

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
import {Entity} from "src/models/Entity";
import NavigationService from "src/services/NavigationService";
import _ from "lodash"
import NewApiDialog from "components/dialogues/NewApiDialog.vue";
import {Api} from "src/models/Api";
import {useApisStore} from "stores/apisStore";

onMounted(() => {
  Analytics.firePageViewEvent('SidePanelApisManager', document.location.href);
})

const $q = useQuasar()

const apis = ref<Api[]>([])

watch(() => {
}, (oldValue: any, newValue: any) => {
  console.log("old->new", oldValue, newValue)
})

watchEffect(() => {
  if (useApisStore().updated) {
    apis.value = useApisStore().apis
  }
})

chrome.runtime.onMessage.addListener((m: any, s: any, response: any) => {
  if (m.name === 'api-changed') {
    return useApisStore().save(m.data)
      .then(() => {
        apis.value = useApisStore().apis
        console.log("onMessage: hier", m, apis.value)
        return true
      })
  }
  return true
})

const openApiInMainPanel = (path: string) =>
  NavigationService.openOrCreateTab([chrome.runtime.getURL("/www/index.html#/mainpanel/apis/" + path)], undefined, [], true, true)

const openEndpointInMainPanel = (apiId: string, endpointId: string) =>
  NavigationService.openOrCreateTab([chrome.runtime.getURL("/www/index.html#/mainpanel/apis/" + apiId + "/endpoints/" + endpointId)], undefined, [], true, true)

const openNewApiDialog = () => {
  $q.dialog({
    component: NewApiDialog,
    componentProps: {}
  })
}

const getLineFor = (item: object, e: Entity) => {
  console.log("item, e", item, e)
  if (e.labelField) {
    return item[e.labelField as keyof object]
  }
  return e.name ? item[e.name as keyof object] : item[e.id as keyof object]
}

</script>
