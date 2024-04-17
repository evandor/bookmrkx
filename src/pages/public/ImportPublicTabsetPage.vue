<template>

  <div class="wrap" v-if="state === 'runImport'">
    <div class="text-h4">Shared Tabset</div>

    <div class="text-body1  q-mx-none q-my-lg">
      <i>{{ author }}</i> wants to share a tabset named <i>{{ name }}</i> with you.<br>
      Click on "show" (or "update") to proceed.
    </div>

    <div class="text-body1  q-mx-none q-my-lg" v-if="maybeTabset">
      You already imported this tabset {{ maybeTabset.importedAt }}, updated at {{ date }}
    </div>

    <div class="justify-center items-center q-gutter-md">
      <q-btn label="Close Window" color="accent" @click="closeWindow()"/>
      <q-btn :label="maybeTabset ? 'Update':'Show'" color="warning" @click="start()"/>
    </div>
  </div>

  <div class="wrap" v-else-if="state === 'importing'">
    <div class="loading">
      <div class="bounceball q-mr-lg"></div>
      <div class="text">please wait, loading tabset...</div>
    </div>
  </div>

  <div class="wrap" v-else>
    <div class="text-h4">Shared Tabset</div>

    <div class="text-body1  q-mx-none q-my-lg">
      <i>{{ author }}</i> wants to share a tabset named <i>{{ name }}</i> with you.<br>
      Click on "show" (or "update") to proceed.
    </div>

    <div class="text-body1  q-mx-none q-my-lg">
      Sorry, this tabset is not available any more.
    </div>

    <div class="justify-center items-center q-gutter-md">
      <q-btn label="Close Window" color="accent" @click="closeWindow()"/>
    </div>
  </div>

</template>


<script setup lang="ts">
import {onMounted, ref} from 'vue'
import {useRoute, useRouter} from "vue-router";
import {uid, useMeta} from "quasar";
import {Tabset} from "src/models/Tabset";
import {FirebaseCall} from "src/services/firebase/FirebaseCall";
import {useTabsetService} from "src/services/TabsetService2";
import _ from "lodash"
import {useTabsStore} from "stores/tabsStore";
import {doc, getDoc, collectionGroup, query, where, getDocs} from "firebase/firestore";
import FirebaseServices from "src/services/firebase/FirebaseServices";
import {useAuthStore} from "stores/authStore";

const route = useRoute();
const router = useRouter();

const shareId = ref(null as unknown as string)
const tabset = ref<Tabset>(new Tabset(uid(), "empty", []))
const state = ref('runImport')
const maybeTabset = ref<Tabset | undefined>(undefined)

const author = ref<string>(atob(route.query['a'] as string || btoa('unknown user')))
const name = ref<string>(atob(route.query['n'] as string || btoa('unknown')))
const date = ref<number>(route.query['d'] as unknown as number)
//const img = atob(route.query['i'] as string || btoa('https://tabsets.web.app/favicon.ico'))

let waitCounter = 0

async function setupTabset(importedTS: Tabset) {
  console.log("setup Tabset", waitCounter)

  try {
    console.log("useTabsetService()", useTabsetService())
    const res = await useTabsetService().saveTabset(importedTS)
    console.log("res", res)
    useTabsetService().selectTabset(importedTS.id)
    useTabsetService().reloadTabset(importedTS.id)
    router.push("/pwa/tabsets/" + tabset.value.id)
  } catch (err) {
    if (waitCounter++ < 5) {
      setTimeout(() => {
        setupTabset(importedTS as Tabset)
      }, 1000)
    } else {
      router.push("/pwa/tabsets")
    }
  }
}

function paramNotSet(ident: string) {
  return !route.query[ident] || (route.query[ident] as string).trim().length === 0
}

onMounted(() => {
  if (!route || !route.params) {
    return
  }
  shareId.value = route?.params.sharedId as string
  if (shareId.value) {
    console.log("searching for tabset with shareId", shareId.value)
    maybeTabset.value = _.first(
      _.filter([...useTabsStore().tabsets.values()] as Tabset[], (ts: Tabset) => ts.sharedId === shareId.value)
    )
    // skip intro ?
    if (paramNotSet('a') && paramNotSet('n')) {
      start()
    }
    //console.log("%cfound", "color:green", maybeTabset.value)
  }
})

// useMeta(() => {
//   return {
//     // whenever "title" from above changes, your meta will automatically update
//     title: tabset.value.tabs.length > 0 ? tabset.value.tabs[0].title : '???',
//     meta: {
//       //description: {name: 'og:title', content: 'Page 1'},
//       ogTitle: {
//         property: 'og:title',
//         content: 'sharing with tabsets'
//       }
//       // ogImage: {
//       //   property: 'og:image',
//       //   content: tabset.value.tabs.length > 0 ? tabset.value.tabs[0].image : ''
//       // }
//     }
//   }
// })

const start = async () => {
  state.value = 'importing'
  console.log("shareId", shareId.value, name.value)
  //MqttService.subscribe(shareId.value)
  //const museums = query(collectionGroup(FirebaseServices.getFirestore(), 'publictabsets'), where('type', '==', 'museum'));

  const ts = await getDoc(doc(FirebaseServices.getFirestore(), "publictabsets", shareId.value))
  console.log("found", ts.data())


  // cb = cache buster, do not cache
  // FirebaseCall.get("/share/public/" + shareId.value + "?cb=" + new Date().getTime(), false)
  //   .then((res: any) => {
  tabset.value = ts.data() as unknown as Tabset
  // if (!tabset.value.sharedId) {
  //   console.log("backend answer", res)
  //   state.value='notFound'
  //   return
  // }

  //const exists = useTabsetService().getTabset(tabset.value.id)
  if (!maybeTabset.value) {
    console.log("shared tabset does not exist yet, creating...")
    const importedTS = tabset.value //new Tabset(tabset.value.id, tabset.value.name, tabset.value.tabs as Tab[])
    importedTS.sharedId = shareId.value
    importedTS.importedAt = new Date().getTime()
    importedTS.sharedPath = route.fullPath
    console.log("importedTS", importedTS)
    setupTabset(importedTS as Tabset)
  } else if (maybeTabset.value) {
    console.log("...", maybeTabset.value?.sharedAt, tabset.value.sharedAt, (maybeTabset.value?.sharedAt || 0) - (tabset.value?.sharedAt || 0))
    //if (maybeTabset.value?.sharedAt && (maybeTabset.value.sharedAt < (tabset.value.sharedAt || 0))) {
    const updatedTS = tabset.value
    updatedTS.sharedId = shareId.value
    updatedTS.importedAt = new Date().getTime()
    console.log("updatedTS", updatedTS)
    setupTabset(updatedTS as Tabset)
    // } else {
    //   router.push("/pwa/tabsets/" + tabset.value.id)
    // }
  } else {
    router.push("/pwa/tabsets/" + tabset.value.id)
  }
  // })
  // .catch((err:any) => {
  //   console.log("got error", err)
  // })
}

const closeWindow = () => window.close()


</script>

<style lang="scss">
@import url(https://fonts.googleapis.com/css?family=Montserrat);

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

.text {
  color: #000066;
  font-size: 24px;
  display: inline-block;
  margin-left: 5px;
  font-family: Montserrat;
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
