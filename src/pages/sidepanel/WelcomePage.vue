<template>
  <q-page-container>
    <q-page>

      <div class="q-ma-none q-pa-md fit">
        <div class="row q-mt-lg">
          <div class="row">
            <div class="col-12 text-caption">
              The Art Of Linking
            </div>
          </div>
          <div class="col-12 text-h6 q-mb-md">
            {{ t('welcome_to_tabsets') }} {{ stageIdentifier() }}
          </div>
<!--          <div class="col-12 text-caption text-primary q-mx-sm q-my-sm">-->
<!--            {{ t('one_line_about_tabsets1') }}<br>-->
<!--            {{ t('one_line_about_tabsets2') }}-->
<!--          </div>-->
        </div>

        <div class="q-pa-sm q-mb-none row items-start q-gutter-md" @click.stop="selected()">
          <q-card class="my-card fit">
            <q-card-section>
              <span class="text-subtitle2">{{ t('create_your_first_ts') }}</span>
              <br>
              {{ t('provide_name_add_later')}}
            </q-card-section>
            <q-card-section class="q-pb-none">
              <q-input v-model="tabsetName"
                       class="input-box"
                       dense
                       autofocus
                       ref="tabsetNameRef"
                       :error-message="t('no_special_chars_and_length')"
                       :error="!newTabsetNameIsValid()"
                       data-testid="newTabsetName"
                       @keydown.enter="addFirstTabset()"
                       :label="t('tabset_name')"/>
            </q-card-section>
            <q-card-actions align="right" class="q-pr-md q-pb-md q-ma-none">
              <DialogButton
                :label="t('add_tabset')"
                @was-clicked="addFirstTabset"
                :disable="tabsetName.trim().length === 0 || !newTabsetNameIsValid()"/>
            </q-card-actions>
            <q-card-actions align="right" class="q-pr-md q-pb-md q-ma-none">
              <span class="q-mx-none cursor-pointer text-primary" style="font-size:smaller"
                    @click.stop="openBookmarksView">or open Bookmark Manager</span>
            </q-card-actions>
          </q-card>
        </div>
        <div class="row q-mr-sm">
          <div class="col-12 text-right">
            <span class="text-grey q-mx-none cursor-pointer" style="font-size:smaller"
                  @click.stop="clicked('https://tabsets.web.app/#/privacy')">Privacy</span>
            <span class="q-ma-none q-pa-none q-mx-xs text-grey-5">|</span>
            <span class="text-grey q-mx-none cursor-pointer" style="font-size:smaller"
                  @click.stop="clicked('https://tabsets.web.app/#/tos')">Terms of Service</span>
            <span class="q-ma-none q-pa-none q-mx-xs text-grey-5">|</span>
            <span class="text-grey q-mx-none cursor-pointer" style="font-size:smaller"
                  @click.stop="clicked('https://docs.tabsets.net')">{{ t('documentation') }}</span>
          </div>
        </div>

        <br><br>

        <div class="row q-mt-lg q-ml-md">
          <div class="col-12 text-caption q-mb-sm">
            {{ t('optionally') }}
          </div>
          <div class="col-12 q-mb-md">
<!--            <q-checkbox size="xs" v-model="activateBookmarks" class="text-grey" :label="t('activate_bookmarks_integration')"/>-->
<!--            <q-icon class="q-ml-sm cursor-pointer" name="o_help" color="grey">-->
<!--              <q-tooltip class="tooltip">Allow access to your bookmarks. Can be added later, too</q-tooltip>-->
<!--            </q-icon>-->
            <q-checkbox size="xs" v-model="activateNotifications" class="text-grey"
                        :label="t('activate_browser_notifications')"/>
            <q-icon class="q-ml-sm cursor-pointer" name="o_help" color="grey">
              <q-tooltip class="tooltip">Allow browser notifications for better integration. Can be added later, too
              </q-tooltip>
            </q-icon>

            <q-checkbox size="xs" v-model="activateFullPageApp" class="text-grey"
                        :label="t('activate_fullpage_application')"/>
            <q-icon class="q-ml-sm cursor-pointer" name="o_help" color="grey">
              <q-tooltip class="tooltip">Tabsets can be additionally run as fullpage app</q-tooltip>
            </q-icon>

            <template v-if="firebaseActive()">
              <q-checkbox
                size="xs" v-model="login" class="text-grey" label="Login or create Account"/>
              <q-icon class="q-ml-sm cursor-pointer" name="o_help" color="grey">
                <q-tooltip class="tooltip">With an Account, you can sync your tabsets across browsers and computers</q-tooltip>
              </q-icon>
            </template>
          </div>
        </div>

      </div>
    </q-page>
  </q-page-container>
</template>

<script lang="ts" setup>

import {SidePanelView, useUiStore} from "src/stores/uiStore";
import {onMounted, ref, UnwrapRef, watchEffect} from "vue";
import {useRouter} from "vue-router";
import {useCommandExecutor} from "src/services/CommandExecutor";
import {STRIP_CHARS_IN_USER_INPUT, TITLE_IDENT} from "boot/constants";
import Analytics from "src/utils/google-analytics";
import DialogButton from "components/buttons/DialogButton.vue";
import {LocalStorage, openURL} from "quasar";
import {FeatureIdent} from "src/models/AppFeature";
import {AppFeatures} from "src/models/AppFeatures";
import {GrantPermissionCommand} from "src/domain/commands/GrantPermissionCommand";
import {usePermissionsStore} from "stores/permissionsStore";
import {useI18n} from 'vue-i18n'

const {t} = useI18n()
const router = useRouter()

const tabsetName = ref('')
const tabsetNameRef = ref<HTMLElement>(null as unknown as HTMLInputElement)
const windowLocation = ref('---')
const activateBookmarks = ref(false)
const activateNotifications = ref(false)
const activateFullPageApp = ref(false)
const login = ref(false)


onMounted(() => {
  Analytics.firePageViewEvent('WelcomePage', document.location.href);
  windowLocation.value = window.location.href
  LocalStorage.set(TITLE_IDENT, 'Tabsets' + stageIdentifier())
})

watchEffect(async () => {
  const feature = new AppFeatures().getFeature(FeatureIdent.NOTIFICATIONS)
  if (activateNotifications.value && feature) {
    const res = await useCommandExecutor().execute(new GrantPermissionCommand('notifications'))
    if (!res.result) {
      activateNotifications.value = false
    }
  } else if (!activateNotifications.value && feature) {
    usePermissionsStore().deactivateFeature('notifications')
  }
})

function setFeature(featureIdent: FeatureIdent, val: UnwrapRef<boolean>) {
  const feature = new AppFeatures().getFeature(featureIdent)
  console.log("feeature", feature)
  if (val && feature) {
    console.log("activating", featureIdent)
    usePermissionsStore().activateFeature(featureIdent.toLowerCase())
  } else if (!val && feature) {
    console.log("deactivateing", featureIdent)
    usePermissionsStore().deactivateFeature(featureIdent.toLowerCase())
  }
}

watchEffect(async () => {
  setFeature(FeatureIdent.STANDALONE_APP, activateFullPageApp.value)
})

watchEffect(() => {
  useUiStore().showLoginTable = login.value
})


const addFirstTabset = () => {
  useCommandExecutor()
    .executeFromUi(new CreateTabsetCommand(tabsetName.value, []))
    .then((res) => {
      useUiStore().sidePanelSetActiveView(SidePanelView.MAIN)
      router.push("/sidepanel?first=true")
    })
}

const newTabsetNameIsValid = () =>
  tabsetName.value.length <= 32 && !STRIP_CHARS_IN_USER_INPUT.test(tabsetName.value)

//https://groups.google.com/a/chromium.org/g/chromium-extensions/c/nb058-YrrWc
const selected = () => tabsetNameRef.value.focus()

const stageIdentifier = () => process.env.TABSETS_STAGE !== 'PRD' ? ' (' + process.env.TABSETS_STAGE + ')' : ''

const clicked = (url: string) => openURL(url)

const firebaseActive = () => {
  return process.env.USE_FIREBASE && process.env.USE_FIREBASE == "true"
}

const openBookmarksView = () => {
  useUiStore().sidePanelSetActiveView(SidePanelView.BOOKMARKS)
  router.push("/sidepanel/" + SidePanelView.BOOKMARKS)
}

</script>

<style scoped>
:deep(.input-box .q-field__control),
:deep(.input-box .q-field__marginal) {
  height: 52px;
  font-size: 18px;
}
</style>
