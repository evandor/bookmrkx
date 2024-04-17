<template>

  <q-page padding style="padding-top: 45px">

    <div class="q-ma-none">

      <InfoMessageWidget
        :probability="1"
        ident="groupByDomain_atLeastTwo"
        hint="In this view, you will see your tabs grouped by Domain"/>


      <div class="q-ma-none">
        <div class="row q-ma-none q-pa-none">
          <div class="col-12 q-ma-none q-pa-none q-pt-lg">

          </div>
        </div>

      </div>

    </div>

    <!-- place QPageSticky at end of page -->
    <q-page-sticky expand position="top" class="darkInDarkMode brightInBrightMode">
      <FirstToolbarHelper title="Domain List">

        <template v-slot:iconsRight>
          <SidePanelToolbarTabNavigationHelper/>
          <CloseSidePanelViewButton />
        </template>

      </FirstToolbarHelper>
    </q-page-sticky>

  </q-page>

</template>

<script lang="ts" setup>

import {onMounted} from "vue";
import {useRouter} from "vue-router";
import InfoMessageWidget from "components/widgets/InfoMessageWidget.vue";
import FirstToolbarHelper from "pages/sidepanel/helper/FirstToolbarHelper.vue";
import Analytics from "src/utils/google-analytics";
import SidePanelToolbarTabNavigationHelper from "pages/sidepanel/helper/SidePanelToolbarTabNavigationHelper.vue";
import CloseSidePanelViewButton from "components/buttons/CloseSidePanelViewButton.vue";

const router = useRouter()

onMounted(() => {
  Analytics.firePageViewEvent('SidePanelByDomainList', document.location.href);
})

const showByDomainPage = (host: string) => {
  console.log("clicked", host)
  router.push("/sidepanel/bydomain/" + btoa(host))
}

</script>
