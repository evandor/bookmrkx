<template>

  <q-item-section class="q-ml-sm q-mt-sm text-right" style="justify-content:start;width:150px;max-width:150px;">
    <q-img v-if="props.tab.image && props.tab.image.startsWith('blob://')"
           style="border:3px dotted white;border-radius:3px"
           :src="imgFromBlob" width="70px"/>
    <a v-else-if="props.tab.image" :href="props.tab.url" target="_blank">
      <q-img style="border:1px dotted white;border-radius:3px" :src="props.tab.image" width="140px"/>
    </a>
    <q-img v-else-if="thumbnail" style="border:1px dotted white;border-radius:3px"
           :src="thumbnail" width="140px"/>
    <TabFaviconWidget v-else
                      :tab="props.tab" width="20px" height="20px" style="position: relative;left:30px;top:5px"/>
  </q-item-section>

  <!-- name, title, description, url && note -->
  <q-item-section :style="itemStyle(props.tab as Tab)" class="q-pa-sm q-ma-none"
                  :data-testid="useUtils().createDataTestIdentifier('tabListElementWidget', props.tab.title)">

    <!-- name or title -->
    <q-item-label>
      <div>
        <div class="q-pr-lg cursor-pointer text-bold">
          <!--          <q-chip v-if="isOpen(props.tab) && props.showIsOpened"-->
          <!--                  class="q-my-none q-py-none q-ml-none q-mr-sm"-->
          <!--                  clickable-->
          <!--                  style="float:left;position: relative;top:3px"-->
          <!--                  @click="NavigationService.openOrCreateTab(props.tab?.url)"-->
          <!--                  size="xs" icon="tab">-->
          <!--            opened-->
          <!--            <q-tooltip class="tooltip">This tab is open in your browser. Click to open the corresponding tab.-->
          <!--            </q-tooltip>-->
          <!--          </q-chip>-->
          <!--          <q-chip v-if="props.tab.isDuplicate && !props.simpleUi"-->
          <!--                  class="q-my-none q-py-none q-ml-none q-mr-sm" color="warning"-->
          <!--                  clickable-->
          <!--                  style="float:left;position: relative;top:3px"-->
          <!--                  size="xs" icon="tab">-->
          <!--            duplicate-->
          <!--            <q-tooltip class="tooltip">This tab has a duplicate inside this tabset and could be deleted</q-tooltip>-->
          <!--          </q-chip>-->
          <span v-if="useTabsStore().getCurrentTabset?.sorting === 'alphabeticalTitle'">
            <q-icon name="arrow_right" size="16px"/>
          </span>
          {{ nameOrTitle(props.tab) }}
          <q-popup-edit v-if="!props.simpleUi"
                        :model-value="dynamicNameOrTitleModel(tab)" v-slot="scope"
                        @update:model-value="val => setCustomTitle( tab, val)">
            <q-input v-model="scope.value" dense autofocus counter @keyup.enter="scope.set"/>
          </q-popup-edit>
        </div>

      </div>
    </q-item-label>

    <!-- description -->
    <q-item-label class="ellipsis-2-lines text-grey-8" @click.stop="open(props.tab)">
      {{ props.tab.longDescription || props.tab.description }}
    </q-item-label>

    <!-- url -->
    <q-item-label
      v-if="props.tab.url"
      caption class="ellipsis-2-lines text-blue-10"
      @mouseover="showButtonsProp = true"
      @mouseleave="showButtonsProp = false">
      <div class="q-pr-lg cursor-pointer" style="display: inline-block;"
           @click.stop="open(props.tab)">

        <span v-if="useTabsStore().getCurrentTabset?.sorting === 'alphabeticalUrl'">
          <q-icon name="arrow_right" size="16px"/>
        </span>
        <short-url :url="props.tab?.url" :hostname-only="true"/>

        <q-icon class="q-ml-xs" name="open_in_new"/>
        <q-icon v-if="showButtonsProp"
                class="q-ml-md" name="content_copy"
                @click.stop="copyToClipboard(props.tab?.url)">
          <q-tooltip class="tooltip">Copy URL to clipboard</q-tooltip>
        </q-icon>
        <q-icon v-else class="q-ml-md"/>
      </div>
    </q-item-label>

    <!-- comments -->
    <q-item-label v-if="props.tab.comments && props.tab.comments.length > 0" class="text-grey-10 q-pa-sm"
                  text-subtitle1>
      <!--        avatar="https://2.gravatar.com/avatar/55791a126d407f184127092989137e051fe839a0fb4cdf76945f70fd2e389eeb?size=512"-->
      <q-chat-message v-for="m in props.tab.comments"
                      :name="m.author"
                      :avatar="m.avatar || 'http://www.gravatar.com/avatar'"
                      :text="[m.comment]"
                      :sent="isSender(m)"
                      :bg-color="isSender(m) ? 'blue':'grey-2'"
                      :text-color="isSender(m) ? 'white':'black'"
                      :stamp="formatDate(m.date)"/>
    </q-item-label>

    <!-- tabsets -->
    <q-item-label v-if="!props.simpleUi"
                  class="text-grey-10" text-subtitle1>
      <q-chip class="cursor-pointer q-ml-none q-mr-sm q-mt-md" size="9px" clickable icon="tab"
              v-for="badge in tsBadges">
        {{ badge['label' as keyof object] }}
        <q-tooltip class="tooltip">This tab is also contained in this tabset</q-tooltip>
      </q-chip>
    </q-item-label>

  </q-item-section>

  <!-- new tab and edit note buttons -->
  <q-item-section side v-if="!props.simpleUi">
    <div class="row" v-if="props.showButtons">
      <q-btn flat round :color="props.tab.note ? 'secondary':'primary'" size="11px" icon="edit_note"
             @click.stop="editNoteDialog(tab as Tab)">
        <q-tooltip v-if="props.tab.note">Edit note</q-tooltip>
        <q-tooltip v-else>Add a note to this tab</q-tooltip>
      </q-btn>
      <q-btn flat round color="red" size="11px" icon="delete_outline" @click.stop="deleteTab(tab as Tab)">
        <q-tooltip>Delete this tab from this list</q-tooltip>
      </q-btn>
    </div>
  </q-item-section>
  <q-item-section side v-else>
    <div class="row" v-if="props.showButtons">
      <q-btn v-if="props.tabsetMqttUrl"
             flat round :color="props.tab.note ? 'secondary':'primary'" size="11px" icon="comment"
             @click.stop="commentDialog(tab as Tab)">
        <q-tooltip class="tooltip-small">Publish a comment</q-tooltip>
      </q-btn>
    </div>
  </q-item-section>

</template>

<script setup lang="ts">
import NavigationService from "src/services/NavigationService";
import {Tab, TabComment} from "src/models/Tab";
import TabsetService from "src/services/TabsetService";
import {onMounted, PropType, ref, watchEffect} from "vue";
import {useUtils} from "src/services/Utils"
import {useCommandExecutor} from "src/services/CommandExecutor";
import {DeleteTabCommand} from "src/domain/tabs/DeleteTabCommand";
import EditNoteDialog from "components/dialogues/EditNoteDialog.vue";
import {date, LocalStorage, useQuasar} from "quasar";
import TabFaviconWidget from "components/widgets/TabFaviconWidget.vue";
import {UpdateTabNameCommand} from "src/domain/tabs/UpdateTabName";
import {CopyToClipboardCommand} from "src/domain/commands/CopyToClipboard";
import {useTabsetService} from "src/services/TabsetService2";
import ShortUrl from "components/utils/ShortUrl.vue";
import {useTabsStore} from "src/stores/tabsStore";
import {useRouter} from "vue-router";
import _ from "lodash";
import CommentDialog from "components/dialogues/CommentDialog.vue";
import {useUiStore} from "stores/uiStore";
import PwaCommentDialog from "components/dialogues/PwaCommentDialog.vue";
import {SHARING_AVATAR_IDENT} from "boot/constants";

const props = defineProps({
  tab: {type: Object as PropType<Tab>, required: true},
  showButtons: {type: Boolean, default: false},
  showIsOpened: {type: Boolean, default: true},
  highlightUrl: {type: String, required: false},
  tabsetId: {type: String, required: true},
  tabsetSharedId: {type: String, required: false},
  tabsetMqttUrl: {type: String, required: false},
  simpleUi: {type: Boolean, default: false}
})

const $q = useQuasar()

const showButtonsProp = ref<boolean>(false)
const thumbnail = ref<string | undefined>(undefined)
const imgFromBlob = ref<string>("")
const tsBadges = ref<object[]>([])
const avatar = ref<string | undefined>(LocalStorage.getItem(SHARING_AVATAR_IDENT) as string || "http://www.gravatar.com/avatar")

const router = useRouter()

watchEffect(() => {
  if (props.tab.url) {
    const url = props.tab.url
    const tabsetIds = useTabsetService().tabsetsFor(url)
    tsBadges.value = []
    //created.value = undefined
    _.forEach(tabsetIds, tsId => {
      if (tsId !== props.tabsetId) {
        tsBadges.value.push({
          label: TabsetService.nameForTabsetId(tsId),
          tabsetId: tsId,
          encodedUrl: btoa(url || '')
        })
      }
    })
  }
})

onMounted(() => {
  const blobImgPath = props.tab.image
  if (blobImgPath && blobImgPath.startsWith('blob://')) {
    useTabsetService().getBlob(blobImgPath.replace("blob://", ""))
      .then((res) => {
        var reader = new FileReader();
        reader.readAsDataURL(res.content);
        reader.onloadend = function () {
          var base64data = reader.result;
          if (base64data) {
            imgFromBlob.value = base64data.toString()
          }
        }
      })
      .catch((err) => console.error(err))
  }
})


function getShortHostname(host: string) {
  const nrOfDots = (host.match(/\./g) || []).length
  if (nrOfDots >= 2) {
    return host.substring(host.indexOf(".", nrOfDots - 2) + 1)
  }
  return host
}

const itemStyle = (tab: Tab) => {
  let border = ""
  let background = ''
  return `${border};${background}`
}

const deleteTab = (tab: Tab) => {
  const tabset = useTabsStore().getTabset(props.tabsetId)
  if (tabset) {
    return useCommandExecutor().executeFromUi(new DeleteTabCommand(tab, tabset))
  }
}

const editNoteDialog = (tab: Tab) => $q.dialog({
  component: EditNoteDialog,
  componentProps: {tabId: tab.id, note: tab.note}
})

const commentDialog = (tab: Tab) => $q.dialog({
  component: props.simpleUi ? PwaCommentDialog : CommentDialog,
  componentProps: {tabId: tab.id}
})

const nameOrTitle = (tab: Tab) => {
  // if (tab.executionResult) {
  //   return tab.executionResult[0]['email' as keyof object] + " <img src='"+tab.executionResult[0]['picture' as keyof object]['medium' as keyof object]+"' />"
  // }
  return tab.name ? tab.name : tab?.title
}

const dynamicNameOrTitleModel = (tab: Tab) => tab.name ? tab.name : tab?.title

const setCustomTitle = (tab: Tab, newValue: string) =>
  useCommandExecutor().executeFromUi(new UpdateTabNameCommand(tab, newValue))

const copyToClipboard = (text: string) =>
  useCommandExecutor().executeFromUi(new CopyToClipboardCommand(text))

const thumbnailFor = async (tab: Tab): Promise<object> => {
  return await TabsetService.getThumbnailFor(tab)
}

watchEffect(() => {
  if (props.tab) {
    // @ts-ignore
    thumbnailFor(props.tab)
      .then((tn: object) => {
        //console.log("tn", tn)
        if (tn && tn['thumbnail' as keyof object]) {
          thumbnail.value = tn['thumbnail' as keyof object]
        }
      })
      .catch((err) => {
        //console.log("could not get thumbnail for ", props.tab)
      })
  }
})

const open = (tab: Tab) => {
  if (process.env.MODE === 'electron') {
    router.push("/browser/" + tab.id)
    return Promise.resolve()
  }
  NavigationService.openOrCreateTab([props.tab?.url || ''])
}

const formatDate = (d: number) => date.formatDate(d, 'DD.MM HH:mm')
const isSender = (m: TabComment) => {
  //console.log("comparing", m.author, useUiStore().sharingAuthor)
  return m.author === useUiStore().sharingAuthor
}
</script>
