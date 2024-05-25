import {defineStore} from 'pinia';
import {computed, ref} from "vue";
import {AppFeatures} from "src/models/AppFeatures";
import {useUtils} from "src/core/services/Utils";
import PersistenceService from "src/services/PersistenceService";
import {LocalStorage} from "quasar";
import {FeatureIdent} from "src/models/FeatureIdent";

export const usePermissionsStore = defineStore('permissions', () => {

  const {sendMsg} = useUtils()

  let storage = null as unknown as PersistenceService

  // related to chrome permissions
  const grantedOptionalPermissions = ref<string[] | undefined>([])
  const grantedOptionalOrigins = ref<string[] | undefined>([])
  const permissions = ref<chrome.permissions.Permissions | undefined>(undefined)

  // related to tabsets permissions
  const activeFeatures = ref<string[]>(LocalStorage.getItem('ui.activeFeatures') as string[] || [])

  async function initialize(ps: PersistenceService) {
    console.debug(" ...initializing PermissionsStore")
    storage = ps
    await load()
  }

  async function load() {
    activeFeatures.value = await storage.getActiveFeatures()
    if (process.env.MODE !== 'bex') {
      return
    }
    if (chrome) { // issues in vitest where chrome is not defined
      // @ts-ignore
      permissions.value = await chrome.permissions.getAll()
      if (permissions.value) {
        grantedOptionalPermissions.value = permissions.value.permissions ? permissions.value.permissions : []
        grantedOptionalOrigins.value = permissions.value.origins ? permissions.value.origins : []
      }
    }
  }

  const hasPermission = computed(() => {
    return (permission: string): boolean | undefined => {
      console.log("query for permission", permission, grantedOptionalPermissions.value)
      return grantedOptionalPermissions.value ? grantedOptionalPermissions.value.indexOf(permission) >= 0 : undefined
    }
  })

  const hasAllOrigins = computed(() => {
    return (): boolean | undefined => {
      return grantedOptionalOrigins.value ?
        grantedOptionalOrigins.value.indexOf("*://*/*") >= 0
        : undefined
    }
  })

  async function grantPermission(permission: string): Promise<boolean> {
    // @ts-ignore
    const granted: boolean = await chrome.permissions.request({permissions: [permission]})
    return load()
      .then(() => Promise.resolve(granted))
  }

  async function grantAllOrigins(): Promise<boolean> {
    // @ts-ignore
    const granted: boolean = await chrome.permissions.request({origins: ["*://*/*", "<all_urls>"]})
    return load()
      .then(() => Promise.resolve(granted))
  }

  async function revokePermission(permission: string): Promise<void> {
    // @ts-ignore
    await chrome.permissions.remove({permissions: [permission]})
    await load()
    return Promise.resolve()
  }

  async function revokeAllOrigins(): Promise<void> {
    // @ts-ignore
    await chrome.permissions.remove({origins: ["*://*/*", "<all_urls>"]})
    await load()
    return Promise.resolve()
  }

  function addActivateFeature(feature: string): boolean {
    if (activeFeatures.value.indexOf(feature) < 0) {
      activeFeatures.value.push(feature)
      return true
    }
    return false
  }

  function removeActivateFeature(feature: string) {
    const index = activeFeatures.value.indexOf(feature)
    if (index >= 0) {
      activeFeatures.value.splice(index, 1)
      return true
    }
    return false
  }

  return {
    initialize,
    load,
    hasPermission,
    grantPermission,
    revokePermission,
    hasAllOrigins,
    grantAllOrigins,
    revokeAllOrigins,
    permissions,
   // hasFeature,
   // activateFeature,
   // deactivateFeature,
   // featuresCount,
    addActivateFeature,
    removeActivateFeature
  }
})
