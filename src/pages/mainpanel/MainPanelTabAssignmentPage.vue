<template>

  <!-- toolbar -->
  <q-toolbar class="text-primary">

    <q-toolbar-title>
      Tab Assignment
    </q-toolbar-title>

  </q-toolbar>

  <q-form @submit.prevent="setMatcher()" ref="theForm">

    <div class="q-pa-md q-gutter-sm">
      <q-banner rounded >
        Sometimes you want to open a page in an existing tab which does not have the exact same URL. Here you can define
        an ant-style matcher to decide about the tab to open the page in.
      </q-banner>

      <div class="row items-baseline q-ma-md">
        <div class="col-3 text-bold">
          Original URL
        </div>
        <div class="col-9">
          {{ tab?.url }}
        </div>
      </div>

      <div class="row items-baseline q-ma-md">
        <div class="col-3 text-bold">
          Match when: starts with
        </div>
        <div class="col-9">
          <q-input v-model="matcher"
                   @update:model-value="val => checkIsValid()"
                   :rules="[
                       val => validUrl(val) || 'Please provide a valid URL',
                       val => startsWithOriginalUrl(val) || originalHostWarning || 'xxx'
                       ]"
          />
        </div>
      </div>

<!--      <div class="row items-baseline q-ma-md">-->
<!--        <div class="col-3 text-bold">-->
<!--          Example-->
<!--        </div>-->
<!--        <div class="col-9">-->
<!--          <q-input v-model="example" @update:model-value="val => checkIsValid()"/>-->
<!--          {{ matchResult }}-->
<!--        </div>-->
<!--      </div>-->

      <div class="row items-baseline q-ma-md">
        <div class="col-3 text-bold">

        </div>
        <div class="col-9">
          <q-btn label="Cancel" class="q-mr-md" size="sm" color="accent" @click="closeWindow()"/>

          <q-btn class="q-mr-md" size="sm" color="accent" @click="removeMatcher()"
                 :disable="!tab?.matcher"
                 label="Remove Matcher"/>

          <q-btn type="submit" class="q-mr-md" size="sm" color="warning"
                 :disable="!isValid"
                 label="Set Matcher"/>
        </div>
      </div>


    </div>

  </q-form>
</template>

<script lang="ts" setup>

import {onMounted, ref, watchEffect} from "vue";
import Analytics from "src/utils/google-analytics";
import {useRoute} from "vue-router";
import {useTabsStore} from "stores/tabsStore";
import {Tab} from "src/models/Tab";
import {Notify, QForm} from "quasar";
import {useCommandExecutor} from "src/services/CommandExecutor";
import {TabAssignmentCommand} from "src/domain/tabs/TabAssignmentCommand";
import JsUtils from "src/utils/JsUtils";
import {TabAndTabsetId} from "src/models/TabAndTabsetId";

const route = useRoute()

const tabId = ref<string | undefined>(undefined)
const tab = ref<Tab | undefined>(undefined)
const tabsetId = ref<string | undefined>(undefined)

const theForm = ref<QForm>(null as unknown as QForm)
const matcher = ref<string | undefined>(undefined)
const example = ref<string | undefined>(undefined)
const originalHost = ref<string | undefined>(undefined)
const originalHostWarning = ref<string | undefined>(undefined)
const isValid = ref(false)
const matchResult = ref(true)

onMounted(() => {
  Analytics.firePageViewEvent('MainPanelTabAssignmentPage', document.location.href);
})

watchEffect(() => {
  tabId.value = route.params.id as string
  if (tabId.value) {
    const t = useTabsStore().getTabAndTabsetId(tabId.value)
        //.then((t: TabAndTabsetId | undefined) => {
      if (t) {
        tab.value = t.tab
        tabsetId.value = t.tabsetId
        matcher.value = tab.value.matcher ? tab.value.matcher.split('|')[1] : tab.value.url
        // let queryOptions = {active: true, lastFocusedWindow: true};
        // chrome.tabs.query(queryOptions, (result: chrome.tabs.Tab[]) => {
        //   if (result.length > 0) {
        //     example.value = result[0].url
        //   } else {
        //     example.value = tab.value?.url
        //   }
        // });
        example.value = tab.value?.url

        try {
          const url = new URL(tab.value?.url || '')
          originalHost.value = url.protocol + '//' + url.host
          originalHostWarning.value = 'The Expression should start with "' + originalHost.value + '"'
        } catch (e) {
        }
      }
   // })
  }
})


const checkIsValid = () => {
  if (theForm.value) {
    theForm.value.validate()
        .then((res) => {
          isValid.value = res && tab?.value?.url !== matcher.value
        })
  }
  matchResult.value = JsUtils.match(matcher.value || '', example.value || '')
}

const startsWithOriginalUrl = (url: string) => {
  return tab.value?.url?.startsWith(originalHost.value || '')
}

const validUrl = (url: string) => {
  try {
    new URL(url)
    return true
  } catch (e) {
    return false
  }
}

const setMatcher = () => {
  console.log("matcher is ", matcher.value)
  if (tab.value && matcher.value) {
    useCommandExecutor().execute(new TabAssignmentCommand(tab.value as Tab, tabsetId.value || '', "sw|" + matcher.value))
        .then((res) => {
          setTimeout(() => window.close(), 500)
        })
        .catch((err) => {
          Notify.create({
            position: 'bottom',
            color: 'red-5',
            textColor: 'white',
            icon: 'error',
            message: "There was an error"
          })
        })
  }
}

const removeMatcher = () => {
  console.log("removing matcher")
  if (tab.value) {
    useCommandExecutor().execute(new TabAssignmentCommand(tab.value, tabsetId.value || '', undefined))
        .then((res) => {
          setTimeout(() => window.close(), 500)
        })
        .catch((err) => {
          Notify.create({
            position: 'bottom',
            color: 'red-5',
            textColor: 'white',
            icon: 'error',
            message: "There was an error"
          })
        })
  }
}

const closeWindow = () => window.close()

</script>
