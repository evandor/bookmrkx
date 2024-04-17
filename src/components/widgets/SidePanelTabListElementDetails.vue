<template>

  <q-item-section v-if="useUiStore().listDetailLevelGreaterEqual(ListDetailLevel.SOME, undefined)"
                  @mouseover="hoveredTab = tab.id"
                  @mouseleave="hoveredTab = undefined"
                  class="q-mr-sm text-right" style="justify-content:start;width:40px;max-width:40px">
    <q-img v-if="props.tab?.image && props.tab.image.startsWith('blob://')"
           style="border:3px dotted white;border-radius:3px"
           :src="imgFromBlob" width="40px"/>
    <q-img v-else-if="props.tab.image"
           style="border:1px dotted white;border-radius:3px"
           :src="props.tab.image" width="40px"/>
    <q-img v-else-if="thumbnail" style="border:1px dotted white;border-radius:3px"
           :src="thumbnail" width="40px"/>
    <TabFaviconWidget v-else
                      :tab="props.tab" width="40px" height="40px"/>
  </q-item-section>

  <!-- name, title, description, url && note -->
  <q-item-section class="q-mb-sm" :style="itemStyle()">

    <!-- name or title -->
    <q-item-label>
      <div>
        <div class="q-pr-lg cursor-pointer ellipsis">
          {{ nameOrTitle(props.tab) }}
        </div>
      </div>
    </q-item-label>

    <!-- meta -->
    <q-item-label caption>
      <div class="row q-mx-sm q-mt-none">
        <div class="col-4 text-caption text-bold">created</div>
        <div class="col-8 text-right text-caption">{{ formatDate(props.tab.created) }}</div>
      </div>
      <div class="row q-mx-sm q-mt-none">
        <div class="col-4 text-caption text-bold">last active</div>
        <div class="col-8 text-right text-caption">{{ formatDate(props.tab.lastActive) }}</div>
      </div>
      <div class="row q-mx-sm q-mt-none">
        <div class="col-4 text-caption text-bold">#opened</div>
        <div class="col-8 text-right text-caption">{{ props.tab.activatedCount }}x</div>
      </div>
    </q-item-label>
  </q-item-section>

</template>

<script setup lang="ts">
import {Tab} from "src/models/Tab";
import TabsetService from "src/services/TabsetService";
import {onMounted, PropType, ref, watchEffect} from "vue";
import {ListDetailLevel, useUiStore} from "src/stores/uiStore";
import TabFaviconWidget from "components/widgets/TabFaviconWidget.vue";
import {useTabsetService} from "src/services/TabsetService2";
import {formatDistance} from "date-fns";

const props = defineProps({
  tab: {type: Object as PropType<Tab>, required: true}
})

const thumbnail = ref<string | undefined>(undefined)
const imgFromBlob = ref<string>("")
const hoveredTab = ref<string | undefined>(undefined)

onMounted(() => {
  const blobImgPath = props.tab.image
  if (blobImgPath && blobImgPath.startsWith('blob://')) {
    useTabsetService().getBlob(blobImgPath.replace("blob://", ""))
      .then((res) => {
        const reader = new FileReader();
        reader.readAsDataURL(res.content);
        reader.onloadend = function () {
          let base64data = reader.result;
          if (base64data) {
            imgFromBlob.value = base64data.toString()
          }
        }
      })
      .catch((err) => console.error(err))
  }
})

const itemStyle = () => {
  let border = ""
  let background = ''
  return `${border};${background}`
}

const nameOrTitle = (tab: Tab) => tab.name ? tab.name : tab.title

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
      .catch(() => {
        //console.log("could not get thumbnail for ", props.tab)
      })
  }
})

const formatDate = (timestamp: number | undefined) =>
  timestamp ? formatDistance(timestamp, new Date(), {addSuffix: true}) : ""


</script>
