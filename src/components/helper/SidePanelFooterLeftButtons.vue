<template>

  <q-btn v-if="props.showSuggestionIcon"
         @click.stop="emits('wasClicked')"
         icon="o_lightbulb"
         class="q-my-xs q-ml-xs q-px-xs"
         flat
         color="warning"
         :size="props.size">
    <q-tooltip class="tooltip">{{ suggestionsLabel() }}</q-tooltip>
  </q-btn>

  <SidePanelFooterLeftButton
    :side-panel-view="SidePanelView.TABS_LIST"
    :size="props.size"
    icon="o_playlist_add"
    tooltip="All your browser's open tabs"/>

  <SidePanelFooterLeftButton v-if="unreadMessagesCount > 0"
                             :side-panel-view="SidePanelView.MESSAGES"
                             icon="o_chat"
                             :size="props.size"
                             tooltip="Your messages">
    <q-badge color="red" floating v-if="unreadMessagesCount > 0">{{ unreadMessagesCount }}</q-badge>
  </SidePanelFooterLeftButton>

  <SidePanelFooterLeftButton :side-panel-view="SidePanelView.BOOKMARKS"
                             icon="o_bookmark"
                             :class="{ shake: animateBookmarksButton }"
                             :size="props.size"
                             tooltip="Show the Bookmarks Browser"/>

  <SidePanelFooterLeftButton :side-panel-view="SidePanelView.RSS_LIST"
                             icon="o_rss_feed"
                             :size="props.size"
                             tooltip="List all your RSS feeds"/>

</template>
<script setup lang="ts">
import {SidePanel, SidePanelView, useUiStore} from "stores/uiStore";
import {FeatureIdent} from "src/models/AppFeature";
import SidePanelFooterLeftButton from "components/helper/SidePanelFooterLeftButton.vue";
import OpenTabsThresholdWidget from "components/widgets/OpenTabsThresholdWidget.vue";
import {usePermissionsStore} from "stores/permissionsStore";
import {useSuggestionsStore} from "stores/suggestionsStore";
import {ref, watchEffect} from "vue";
import {SuggestionState} from "src/models/Suggestion";
import {useMessagesStore} from "stores/messagesStore";

const props = defineProps({
  showSuggestionIcon: {type: Boolean, required: true},
  size: {type: String, default: "10px"}
})

const emits = defineEmits(['wasClicked'])

const permissionsStore = usePermissionsStore()

const buttonSize = ref('15px')
const unreadMessagesCount = ref(0)
const animateBookmarksButton = ref(false)

watchEffect(() => {
  buttonSize.value = useUiStore().getButtonSize('sidePanelFooter')
})

watchEffect(() => {
  useMessagesStore().getMessages().then((msgs) => unreadMessagesCount.value = msgs.length)
})

watchEffect(() => {
  animateBookmarksButton.value = useUiStore().animateBookmarksButton
})

const suggestionsLabel = () => {
  const suggestions = useSuggestionsStore().getSuggestions([SuggestionState.NEW, SuggestionState.DECISION_DELAYED])
  return suggestions.length === 1 ?
    suggestions.length + " New Suggestion" :
    suggestions.length + " New Suggestions"

}

</script>

<script setup lang="ts">
</script>
