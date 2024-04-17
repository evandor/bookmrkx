<template>
  <q-banner rounded style="border:1px solid orange">On this settings page, you can
    adjust your sharing experience
  </q-banner>

  <div class="row items-baseline q-ma-md q-gutter-lg">
    <div class="col-3">
      Nickname
    </div>
    <div class="col-7">
      <q-input color="primary" filled v-model="nickname" label="">
        <template v-slot:prepend>
          <q-icon name="ios_share"/>
        </template>
      </q-input>
    </div>
    <div class="col"></div>

    <div class="col-3">
      Avatar
    </div>
    <div class="col-7">
      <q-input type="url" color="primary" filled v-model="avatar" label="">
        <template v-slot:prepend>
          <q-icon name="ios_share"/>
        </template>
      </q-input>
    </div>
    <div class="col text-right">
      <q-avatar>
        <img :src="avatar">
      </q-avatar>
    </div>


    <!--      <div class="col-3">-->
    <!--        Installation ID-->
    <!--      </div>-->
    <!--      <div class="col-7">-->
    <!--        {{ installationId }}-->
    <!--      </div>-->
    <!--      <div class="col">-->

    <!--      </div>-->

  </div>


</template>

<script lang="ts" setup>

import {ref, watchEffect} from "vue";
import {SHARING_AUTHOR_IDENT, SHARING_AVATAR_IDENT, STRIP_CHARS_IN_USER_INPUT} from "boot/constants";
import {LocalStorage} from "quasar";
import {useUtils} from "src/services/Utils";

const {sanitize} = useUtils()

const nickname = ref<string>(LocalStorage.getItem(SHARING_AUTHOR_IDENT) || '')
const avatar = ref<string>(LocalStorage.getItem(SHARING_AVATAR_IDENT) as string || '')

watchEffect(() => {
  (nickname.value && nickname.value.trim().length > 0) ?
    LocalStorage.set(SHARING_AUTHOR_IDENT, nickname.value.replace(STRIP_CHARS_IN_USER_INPUT, '')) :
    LocalStorage.remove(SHARING_AUTHOR_IDENT)
})

watchEffect(() => {
  if (avatar.value && avatar.value.trim().length > 0) {
    const sanitized = sanitize(avatar.value)
    LocalStorage.set(SHARING_AVATAR_IDENT, sanitized)
  } else {
    LocalStorage.remove(SHARING_AVATAR_IDENT)
  }
})
</script>
