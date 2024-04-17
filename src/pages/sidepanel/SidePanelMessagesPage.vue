<template>

  <q-page padding style="padding-top: 45px">

    <div class="q-ma-none">
      <div class="row q-ma-none q-pa-none">
        <div class="col-12 q-ma-none q-pa-none q-pt-lg">
          {{ messages }}
        </div>
      </div>
    </div>

    <!-- place QPageSticky at end of page -->
    <q-page-sticky expand position="top" class="darkInDarkMode brightInBrightMode">
      <FirstToolbarHelper title="Messages">

        <template v-slot:iconsRight>

          <SidePanelToolbarTabNavigationHelper/>

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
import {onMounted, ref, watchEffect} from "vue";
import Analytics from "src/utils/google-analytics";
import SidePanelToolbarTabNavigationHelper from "pages/sidepanel/helper/SidePanelToolbarTabNavigationHelper.vue";
import SidePanelToolbarButton from "components/buttons/SidePanelToolbarButton.vue";
import {useMessagesStore} from "stores/messagesStore";
import {Message} from "src/models/Message";

const messages = ref<Message[]>([])

onMounted(() => {
  Analytics.firePageViewEvent('SidePanelMessagesPage', document.location.href);
})

watchEffect(() => {
  useMessagesStore().getMessages()
    .then(r => {
      console.log("setting to ", r)
      messages.value = r
    })
})

</script>
