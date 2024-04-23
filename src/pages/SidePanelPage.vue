<template>

  <q-page style="padding-top: 50px">

    <div class="wrap" v-if="useUiStore().appLoading">
      <div class="loading">
        <div class="bounceball q-mr-lg"></div>
        <div class="text">{{ useUiStore().appLoading }}</div>
      </div>
    </div>

    <transition
      appear
      enter-active-class="animated fadeIn slower delay-5s"
      leave-active-class="animated fadeOut">
      <div class="wrap2"
           v-if="!useUiStore().appLoading">
        <div class="row items-center text-grey-5">how to start?</div>
        <div style="min-width:300px;border:1px solid #efefef;border-radius:5px">
          <q-list>
            <q-item clickable @click="useUiStore().startButtonAnimation('newTabset')">
              <q-item-section avatar>
                <q-btn outline label="..." color="primary" size="sm"/>
              </q-item-section>

              <q-item-section>
                <q-item-label>New Tabset</q-item-label>
                <q-item-label caption>Click to create a new tabset</q-item-label>
              </q-item-section>
            </q-item>

            <q-item clickable @click="useUiStore().startButtonAnimation('settings')">
              <q-item-section avatar>
                <SidePanelToolbarButton
                  icon="o_settings"/>
              </q-item-section>

              <q-item-section>
                <q-item-label>Settings</q-item-label>
                <q-item-label caption>Click here to activate more features</q-item-label>
              </q-item-section>
            </q-item>

            <q-item clickable @click="useUiStore().startButtonAnimation('bookmarks')">
              <q-item-section avatar>
                <SidePanelToolbarButton
                  icon="bookmark"
                  color="primary"/>
              </q-item-section>

              <q-item-section>
                <q-item-label>Bookmarks Manager</q-item-label>
                <q-item-label caption>Click to open the Bookmarks Manager</q-item-label>
              </q-item-section>
            </q-item>

          </q-list>
        </div>
      </div>
    </Transition>

    <!-- list of tabs, assuming here we have at least one tabset -->
    <div class="q-ma-none q-pa-none">

      <div class="q-mx-md q-mx-sm text-primary text-caption"></div>

      <div class="q-pa-md q-gutter-sm" v-if="showSwitchedToLocalInfo()">
        <q-banner inline-actions rounded class="text-primary" style="border: 1px solid grey">
          <div class="row q-pa-xs">
            <div class="2">
              <q-icon name="o_lightbulb" color="warning" size="1.3em"/>
            </div>
            <div class="col text-right cursor-pointer" @click="ackSwitchToLocal()">x
              <q-tooltip>close this info message</q-tooltip>
            </div>
          </div>
          <div class="row q-pa-xs">
            <div class="2"></div>
            <div class="col text-caption">
              Showing local tabsets
              <slot></slot>
            </div>
          </div>
        </q-banner>
      </div>

    </div>

    <!-- place QPageSticky at end of page -->
    <q-page-sticky expand position="top" class="darkInDarkMode brightInBrightMode">

      <FirstToolbarHelper
        :showSearchBox="showSearchBox">


        <div class="text-subtitle1">
         xxx
        </div>

      </FirstToolbarHelper>

    </q-page-sticky>
  </q-page>

</template>

<script lang="ts" setup>

import {onMounted, onUnmounted, ref, watchEffect} from "vue";
import {useRouter} from "vue-router";
import {useUtils} from "src/services/Utils";
import {LocalStorage, scroll} from "quasar";
import {useUiStore} from "src/stores/uiStore";
import {usePermissionsStore} from "src/stores/permissionsStore";
import FirstToolbarHelper from "pages/sidepanel/helper/FirstToolbarHelper.vue";
import Analytics from "src/utils/google-analytics";
import {useBookmarksStore} from "src/bookmarks/stores/bookmarksStore";
import {TITLE_IDENT} from "boot/constants";
import AppService from "src/services/AppService";
import SidePanelToolbarButton from "components/buttons/SidePanelToolbarButton.vue";
import {useI18n} from 'vue-i18n'

const {t} = useI18n({locale: navigator.language, useScope: "global"})

const {inBexMode} = useUtils()

const router = useRouter()
const permissionsStore = usePermissionsStore()
const uiStore = useUiStore()

const showSearchBox = ref(false)

function updateOnlineStatus(e: any) {
  const {type} = e
  useUiStore().networkOnline = type === 'online'
}

onMounted(() => {
  window.addEventListener('keypress', checkKeystroke);

  window.addEventListener("offline", (e) => updateOnlineStatus(e));
  window.addEventListener("online", (e) => updateOnlineStatus(e));

  Analytics.firePageViewEvent('SidePanelPage', document.location.href);
})

onUnmounted(() => {
  window.removeEventListener('keypress', checkKeystroke);
})


watchEffect(() => {
  if (useUiStore().tabsFilter) {
    console.log("filtering:::", useUiStore().tabsFilter)
  }
})

function inIgnoredMessages(message: any) {
  return message.msg === "html2text" ||
    message.msg === "captureThumbnail" ||
    message.msg === "capture-annotation" ||
    message.name === "reload-spaces" ||
    // message.name === "window-updated" ||
    message.msg === "html2links"
}

if (inBexMode()) {
  // seems we need to define these listeners here to get the matching messages reliably
  // these messages are created by triggering events in the mainpanel
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log(" <<< received message", message)
    if (inIgnoredMessages(message)) {
      return true
    }
    if (message.name === 'current-tabset-id-change') {
      if (message.ignore) {
        return true
      }
      const tsId = message.data.tabsetId
    } else if (message.name === 'feature-activated') {
      usePermissionsStore().addActivateFeature(message.data.feature)
      if (message.data.feature === 'help') {
      } else if (message.data.feature === 'bookmarks') {
        usePermissionsStore().load()
          .then(() => {
            useBookmarksStore().init()
            useBookmarksStore().loadBookmarks()
          })
      }
    } else if (message.name === "feature-deactivated") {
      usePermissionsStore().removeActivateFeature(message.data.feature)
    } else if (message.name === "tabsets-imported") {
      // TODO reload
    } else if (message.name === "tab-being-dragged") {
      useUiStore().draggingTab(message.data.tabId, null as unknown as any)
    } else if (message.name === "note-changed") {
      if (message.data.noteId) {
        console.log("updating note", message.data.noteId)
        //.then((res: TabAndTabsetId | undefined) => {
        if (res) {
          const note = res.tab
          note.title = message.data.tab.title
          note.description = message.data.tab.description
          note.longDescription = message.data.tab.longDescription
        }
        //    })
      } else {
        console.log("adding tab", message.data.tab)
      }
    } else if (message.name === "tab-added") {
      // hmm - getting this twice...
      console.log(" > got message '" + message.name + "'", message)
      //updateSelectedTabset(message.data.tabsetId, true)
    } else if (message.name === "tab-deleted") {
    } else if (message.name === "tabset-added") {
    } else if (message.name === "mark-tabset-deleted") {
    } else if (message.name === "tabset-renamed") {
    } else if (message.name === "reload-tabset") {
      console.log("reload-tabset message received")
    } else if (message.name === 'reload-application') {
      AppService.restart("restarted=true")
    } else {
      console.log("got unmatched message", message)
    }
    return true
  })
}

function checkKeystroke(e: KeyboardEvent) {
  if (useUiStore().ignoreKeypressListener()) {
    return
  }
  if (e.key === '/') {
    // TODO does not work properly yet
    //showSearchBox.value = true
    // e.preventDefault()
    // // @ts-ignore
    // searchBox.value.focus()
    // search.value = ''
  }
}

const stageIdentifier = () => process.env.TABSETS_STAGE !== 'PRD' ? ' (' + process.env.TABSETS_STAGE + ')' : ''

const showSwitchedToLocalInfo = () => useUiStore().showSwitchedToLocalInfo
const ackSwitchToLocal = () => useUiStore().showSwitchedToLocalInfo = false

</script>

<style lang="scss">

.v-enter-active,
.v-leave-active {
  transition: opacity 0.5s ease;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
}

.q-item__section--avatar {
  min-width: 46px !important;
  padding-right: 12px !important;
  margin-bottom: 14px;
}

.welcome-tooltip-container {
  position: absolute;
  top: 30px;
  right: -50px;
  width: 140px;
  display: inline-block
}

.welcome-tooltip-container .tooltip {
  z-index: 10000;
  padding: 0 8px;
  background: white;
  color: #333;
  position: absolute;
  top: -17px;
  right: 0;
  border: 2px solid #FFBF46;
  border-radius: 8px;
  font-size: 16px;
  box-shadow: 3px 3px 3px #ddd;
  animation: welcome-tooltip-pulse 1s ease-in-out infinite alternate
}

.welcome-tooltip-container .tooltip p {
  margin: 15px 0;
  line-height: 1.5
}

.welcome-tooltip-container .tooltip * {
  vertical-align: middle
}

.welcome-tooltip-container .tooltip::after {
  content: " ";
  width: 0;
  height: 0;
  border-style: solid;
  border-width: 10px 12.5px 0 12.5px;
  border-color: #FFBF46 transparent transparent transparent;
  position: absolute;
  top: -10px;
  right: 35px;
  transform: rotate(180deg)
}

$width: 25px;
$height: 25px;

$bounce_height: 30px;

body {
  position: relative;
  width: 100%;
  height: 100vh;
}

.wrap {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.wrap2 {
  position: absolute;
  top: 30%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.text {
  //color: #000066;
  font-size: 24px;
  display: inline-block;
  margin-left: 5px;
}

.bounceball {
  position: relative;
  display: inline-block;
  height: 37px;
  width: $width;

  &:before {
    position: absolute;
    content: '';
    display: block;
    top: 0;
    width: $width;
    height: $height;
    border-radius: 50%;
    background-color: #fbae17;
    transform-origin: 50%;
    animation: bounce 500ms alternate infinite ease;
  }
}

@keyframes bounce {
  0% {
    top: $bounce_height;
    height: 5px;
    border-radius: 60px 60px 20px 20px;
    transform: scaleX(2);
  }
  35% {
    height: $height;
    border-radius: 50%;
    transform: scaleX(1);
  }
  100% {
    top: 0;
  }
}

</style>
