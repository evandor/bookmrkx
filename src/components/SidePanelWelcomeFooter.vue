<template>

  <!-- obsolete ?! -->
  <q-footer class="bg-white q-pa-xs q-mt-sm" style="border-top: 1px solid lightgrey">


    <div class="row fit">
      <div class="col-6">

        <div class="q-my-sm q-mx-xs">
          Do more with an account
        </div>

        <Transition name="fade" appear>

        </Transition>

      </div>

      <div class="col text-right">

        <Transition name="fade" appear>
          <q-btn label="sign in or up"
                 @click="openPlansPage()"
                 style="font-size: smaller;text-align: center" class="q-ma-none q-mr-xs bg-grey-3" />
        </Transition>

<!--        <span class="q-my-xs q-ml-xs q-mr-none cursor-pointer" v-if="authStore.authenticated">-->
<!--          <q-avatar size="19px">-->
<!--            <q-img :src="authStore.user.photoURL"/>-->
<!--          </q-avatar>-->

<!--          <q-menu :offset="[0, 7]" fit>-->
<!--            <q-list dense style="min-width: 150px;min-height:50px">-->
<!--&lt;!&ndash;              <q-item clickable v-close-popup>&ndash;&gt;-->
<!--              &lt;!&ndash;                <q-item-section @click="subscribe()">Subscribe</q-item-section>&ndash;&gt;-->
<!--              &lt;!&ndash;              </q-item>&ndash;&gt;-->
<!--              <q-item clickable v-close-popup>-->
<!--                <q-item-section @click="logout()">Logout {{ authStore.user?.email }}</q-item-section>-->
<!--              </q-item>-->
<!--            </q-list>-->

<!--          </q-menu>-->
<!--        </span>-->
<!--        <q-btn v-else-->
<!--               icon="login"-->
<!--               :class="rightButtonClass()"-->
<!--               flat-->
<!--               color="black"-->
<!--               :size="getButtonSize()"-->
<!--               @click="toggleShowLogin()">-->
<!--        </q-btn>-->

      </div>
    </div>

  </q-footer>
</template>
<script setup lang="ts">

import NavigationService from "src/services/NavigationService";

const openPlansPage = () => NavigationService.openOrCreateTab(["https://tabsets.web.app/#/pricing?wcp=1"]) // "from WelComePage = true"

</script>

<style>
.fade-enter-active {
  transition: opacity 0.5s ease;
}

.fade-leave-active {
  transition: opacity 1.0s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
