import {defineStore} from 'pinia';
import _ from 'lodash'
import {computed, ref, watch} from "vue";
import {LocalStorage, useQuasar} from "quasar";

export const useSettingsStore = defineStore('settings', () => {

  const localStorage= useQuasar().localStorage
  //let localStorage: LocalStorage = null as unknown as LocalStorage

  const activeToggles = ref<string[]>([])
  const thresholds = ref( {
    min: 0,
    max: 40
  })
  const thumbnailQuality = ref( 25)

  const isEnabled = computed(() => (ident: string) =>
    _.findIndex(activeToggles.value, (e: string) => e === ident) >= 0)

  watch(
    thresholds,
    (thresholdsVal: Object) => {
      localStorage.set("thresholds", thresholdsVal)
      //console.log("thresholds set to ", thresholdsVal)
    }, {deep: true}
  )

  watch(thumbnailQuality, (val: Object) => localStorage.set("thumbnailQuality", val))

  function initialize(localStorage: any) {
    console.debug(" ...initializing settingsStore")
    //this.localStorage = localStorage
    const fts: string | undefined = localStorage.getItem("settings")
    if (fts) {
      console.log("determining activeToggles from", fts)
      activeToggles.value = _.map(fts.split(","), e => e.trim())
    }
    const ths = localStorage.getItem('thresholds')
    if (ths) {
      thresholds.value = ths
    }
    const tnq = localStorage.getItem('thumbnailQuality')
    if (tnq) {
      thumbnailQuality.value = tnq
    }
  }

  function setFeatureToggle(ident: string, setActive: boolean) {
    console.log("setting activeToggles", ident, setActive)
    const index = activeToggles.value.indexOf(ident)
    if (index >= 0 && !setActive) {
      activeToggles.value.splice(index, 1)
    } else if (index < 0 && setActive) {
      activeToggles.value.push(ident)
    }
    localStorage.set("settings", _.join(activeToggles.value, ","))
  }

  return {initialize, activeToggles, setFeatureToggle, isEnabled,thresholds, thumbnailQuality}
})
