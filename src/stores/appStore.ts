import {defineStore} from 'pinia';
import {ref} from "vue";
import {LocalStorage, uid, useQuasar} from "quasar";
import {APP_INSTALLATION_ID} from "boot/constants";

export enum SyncType {
  NONE = "NONE",
  COUCHDB = "COUCHDB",
  FIRESTORE = "FIRESTORE"
}

export const useAppStore = defineStore('app', () => {

  const installationId = ref<string | undefined>(LocalStorage.getItem(APP_INSTALLATION_ID) as string || undefined)

  //const user = ref<object | undefined>(undefined)

  function init() {
    // make sure we have an installation id
    getInstallationId()
  }

  function getInstallationId() {
    if (installationId.value) {
      return installationId.value
    }
    const useId = uid()
    installationId.value = useId
    LocalStorage.set(APP_INSTALLATION_ID, useId)
    return useId
  }

  return {
    init,
    getInstallationId
  }
})
