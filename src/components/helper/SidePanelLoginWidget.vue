<template>
  <div class="col-12 text-right">
    <template v-if="!mailSent">
      <form>
        <div class="row q-ma-xs">
          <div class="col-7">
            <q-input id="username" outlined type="email" v-model="email" label="Your email address" dense tabindex="1" autofocus/>
          </div>
          <div class="col-5">
            <!--          <q-btn :label="(!email || email.length === 0) ? 'Sign in' : (password.length > 0 ? 'Sign in':'Send Link')"-->
            <q-btn label="Sign in"
                   tabindex="3"
                   style="width:110px"
                   :loading="password.length === 0 && loading"
                   :disable="mailSent"
                   @click="signin(false)"/>
          </div>
        </div>
        <div class="row q-ma-xs">
          <div class="col-7">
            <q-input id="password" outlined type="password" v-model="password" label="Password" dense tabindex="2"/>
          </div>
          <div class="col-5">
            <q-btn label="Sign Up"
                   tabindex="4"
                   style="width:110px"
                   :loading="password.length > 0 && loading"
                   :disable="mailSent || password.length === 0"
                   @click="signin(true)"/>
          </div>
        </div>
        <div class="row q-ma-xs q-ml-none">
          <div class="col-7 q-ml-xs text-body2 text-grey-7 text-left" style="font-size:smaller">
          <span
            v-if="(!email || email.trim().length === 0) && password.length === 0">Or keep using tabsets w/o account</span>
            <span v-else-if="password.length === 0">We'll send a link to sign in/up</span>
            <span v-else></span>
          </div>
          <div class="col" style="font-size:smaller">
          <span class="q-mr-md cursor-pointer text-blue-5"
                @click="NavigationService.openSingleTab('https://tabsets.web.app/#/pricing')">What's that?</span>
          </div>
        </div>
      </form>
    </template>
    <Transition name="bounceInLeft" appear v-else>
      <div class="text-caption text-left">
        please check your mail... (and maybe spam folder)<br>
        <span class="text-warning">Make sure to open the link in <b>this</b> window</span>
      </div>

    </Transition>
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
import {NotificationType, useNotificationHandler} from "src/services/ErrorHandler";
import {useUtils} from "src/services/Utils";

const {handleError} = useNotificationHandler()
const {sendMsg} = useUtils()

const emits = defineEmits(['hideLogin'])

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
      loading.value = false
      emits('hideLogin')
    } catch (error:any) {
      const errorCode = error.code;
      const errorMessage = error.message;
      console.error("error", error, typeof error, errorCode, errorMessage)
      switch (errorCode) {
        case "auth/invalid-credential":
          handleError("Invalid Credentials or No Account", NotificationType.TOAST)
          break
        default:
          handleError(error, NotificationType.TOAST)
      }
      loading.value = false
    }
  } else {

    // KEEP for now; this is for login with email link
    // console.log("actionCodeSettings", actionCodeSettings)
    // sendSignInLinkToEmail(auth, email.value, actionCodeSettings)
    //   .then(() => {
    //     loading.value = false
    //     mailSent.value = true
    //     setTimeout(() => {
    //         mailSent.value = false
    //         emits('hideLogin')
    //       }, 5000
    //     )
    //     window.localStorage.setItem(CURRENT_USER_EMAIL, email.value);
    //     sendMsg('SET_EMAIL_FOR_SIGN_IN', {"email": email.value})
    //   })
    //   .catch((error) => {
    //     //console.error("error", error)
    //     handleError(error, NotificationType.TOAST)
    //     loading.value = false
    //     mailSent.value = false
    //   });
  }
}

</script>
