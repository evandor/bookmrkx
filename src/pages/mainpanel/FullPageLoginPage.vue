<template>
  <div class="q-ma-xl row justify-center items-center">
    <div class="col-12 text-right" style="max-width:500px;margin-top:200px;">
      <template v-if="!mailSent">
        <div class="row q-ma-xs">
          <div class="col-7">
            <q-input outlined type="email" v-model="email" label="Your email address" dense/>
          </div>
          <div class="col-5">
            <q-btn :label="(!email || email.length === 0) ? 'Sign in' : (password.length > 0 ? 'Sign in':'Send Link')"
                   color="primary"
                   style="width:110px"
                   :loading="password.length === 0 && loading"
                   :disable="mailSent"
                   @click="signin(false)"/>
          </div>
        </div>
        <div class="row q-ma-xs">
          <div class="col-7">
            <q-input outlined type="password" v-model="password" label="Password" dense/>
          </div>
          <div class="col-5">
            <q-btn label="Sign Up"
                   style="width:110px"
                   :loading="password.length > 0 && loading"
                   :disable="mailSent || password.length === 0"
                   @click="signin(true)"/>
          </div>
        </div>
        <div class="row q-ma-xs q-ml-none">
          <div class="col-7 q-ml-xs text-body2 text-grey-7 text-left" style="font-size:smaller">
          <span
            v-if="(!email || email.trim().length === 0) && password.length === 0">Or keep using tabsets w/o account...</span>
            <span v-else-if="password.length === 0">We'll send a link to sign in/up</span>
            <span v-else></span>
          </div>
          <div class="col" style="font-size:smaller">
          <span class="q-mr-md cursor-pointer text-blue-5"
                @click="NavigationService.openSingleTab('')">What's that?</span>
          </div>
        </div>

        <div class="row q-ma-xs">
          <q-btn flat label="Home" @click="goto('/tabsets')"/>
        </div>
      </template>
      <Transition name="bounceInLeft" appear v-else>
        <div class="text-caption text-left">
          please check your mail... (and maybe spam folder)<br>
          <span class="text-warning">Make sure to open the link in <b>this</b> window</span>
        </div>

      </Transition>
    </div>
  </div>
</template>

<script lang="ts" setup>

import NavigationService from "src/services/NavigationService";
import {ref} from "vue";
import {LocalStorage} from "quasar";
import {CURRENT_USER_EMAIL, EMAIL_LINK_REDIRECT_DOMAIN} from "boot/constants";
import {
  createUserWithEmailAndPassword,
  getAuth,
  sendSignInLinkToEmail,
  signInWithEmailAndPassword,
  UserCredential
} from "firebase/auth";
import {useAuthStore} from "stores/authStore";
import {NotificationType, useNotificationHandler} from "src/services/ErrorHandler";
import {useUtils} from "src/services/Utils";
import {useRouter} from "vue-router";

const {handleError} = useNotificationHandler()
const {sendMsg} = useUtils()

const emits = defineEmits(['hideLogin'])

const router = useRouter()

const email = ref(LocalStorage.getItem(CURRENT_USER_EMAIL) as string)
const password = ref('')
const loading = ref<boolean>(false)
const mailSent = ref<boolean>(false)

const actionCodeSettings = {
  // URL must be in the authorized domains list in the Firebase Console.
  //url: 'http://localhost:9000',
  url: EMAIL_LINK_REDIRECT_DOMAIN,
  handleCodeInApp: true,
};


const signin = async (newUser: boolean) => {
  loading.value = true
  const auth = getAuth();
  if (email.value && password.value) {
    try {
      let userCredential: UserCredential = null as unknown as UserCredential
      if (newUser) {
        userCredential = await createUserWithEmailAndPassword(auth, email.value, password.value)
      } else {
        userCredential = await signInWithEmailAndPassword(auth, email.value, password.value)
      }
      const user = userCredential.user;
      LocalStorage.set(CURRENT_USER_EMAIL, email.value);
      //console.log("user!!!", user)
      useAuthStore().setUser(user)
      loading.value = false
      emits('hideLogin')
    } catch (error) {
      //console.error("error", error)
      handleError(error, NotificationType.TOAST)
      loading.value = false
    }
  } else {

    console.log("actionCodeSettings", actionCodeSettings)
    sendSignInLinkToEmail(auth, email.value, actionCodeSettings)
      .then(() => {
        loading.value = false
        mailSent.value = true
        setTimeout(() => {
            mailSent.value = false
            emits('hideLogin')
          }, 5000
        )
        window.localStorage.setItem(CURRENT_USER_EMAIL, email.value);
        sendMsg('SET_EMAIL_FOR_SIGN_IN', {"email": email.value})
      })
      .catch((error) => {
        //console.error("error", error)
        handleError(error, NotificationType.TOAST)
        loading.value = false
        mailSent.value = false
      });
  }
}

const goto = (where: string) => router.push(where)

</script>
