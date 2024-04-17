// Hooks added here have a bridge allowing communication between the Web Page and the BEX Content Script.
// More info: https://quasar.dev/quasar-cli/developing-browser-extensions/dom-hooks
import {bexDom} from 'quasar/wrappers'
import detectQuasar from "app/src-bex/dom/detect-quasar";

export default bexDom((bridge) => {
    //console.log("bexDom", bridge)
    //if (!usePermissionsStore().hasFeature(FeatureIdent.ANALYSE_TABS)) {
    // bridge.on('initDomScripts', ({ data, respond }) => {
    //   console.log("tabsets: got event initDomScripts")
    // })
   // detectQuasar(bridge)
})
