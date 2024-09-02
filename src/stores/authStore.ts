import {defineStore} from 'pinia';
import PersistenceService from "src/services/PersistenceService";
import {computed, ref} from "vue";

export enum AccessItem {
  SYNC = "SYNC",
  SHARE = "SHARE",
  FEATURE_TOGGLES = "FEATURE_TOGGLES"
}

/**
 * dummy auth Store
 */
export const useAuthStore = defineStore('auth', () => {

  const products = ref<string[]>([])

  // --- init ---
  async function initialize(ps: PersistenceService) {

  }

  // --- getters ---
  const isAuthenticated = computed(() => {
    return (): boolean => {
      return false
    }
  })

  const getUsername = computed(() => {
    return "anonymous"
  })

  const userMayAccess = computed(() => {
    return (item: AccessItem): boolean => {
      return false
    }
  })

  // --- actions ---


  function setProducts(ps: string[]) {
    products.value = ps
  }

  return {
    initialize,
    isAuthenticated,
    getUsername,
    userMayAccess
  }
})
