<template>

  <q-toolbar>
    <div class="row fit">
      <q-toolbar-title>
        <div class="row justify-start items-baseline">
          <div class="col-12">API</div>
        </div>
      </q-toolbar-title>
    </div>
  </q-toolbar>

  <div class="q-ma-md">

    <div class="row">
      <div class="col-3 q-my-md">Base URL</div>
      <div class="col-9 q-my-md">
        <q-input v-model="baseUrl" label="Base URL"/>
      </div>

      <div class="col-3 q-my-md">
        Common Headers<br>
        <q-btn icon="o_add" size="xs" @click="showAddLine = true"/>
      </div>

      <div class="col-9 q-my-md">

        <div class="row" v-for="h in headers">
          <div class="col-4">
            <q-input v-model="h.name" label="Key"/>
          </div>
          <div class="col-4">
            <q-input v-model="h.value" label="Value"/>
          </div>
          <div class="col-4">
            <q-btn label="delete"/>
          </div>
        </div>

        <div class="row" v-if="showAddLine">
          <div class="col-4">
            <q-select v-model="typeModel" :options="typeModelOptions" label="Type"/>
          </div>
          <div class="col-4">
            <q-input v-model="paramKey" label="Key"/>
          </div>
          <div class="col-4">
            <q-btn label="add" @click="addHeader()"/>
          </div>
        </div>

      </div>

      <div class="col-3"></div>
      <div class="col-9">
        <q-btn label="submit" @click="updateApi()"/>
      </div>

    </div>


  </div>

</template>

<script lang="ts" setup>

import {onMounted, ref, watch, watchEffect} from "vue";
import Analytics from "src/utils/google-analytics";
import {useRoute} from "vue-router";
import {useApisStore} from "stores/apisStore";
import _ from "lodash"
import {uid} from "quasar";
import {useUtils} from "src/services/Utils";
import {Api, ApiSetup, HeaderDefinition, ParamDefinition} from "src/models/Api";
import {axios} from "boot/axios";

const {sendMsg} = useUtils()
const route = useRoute()

const form = ref(null)
const call = ref(false)
const apiId = ref<string | undefined>(undefined)
const api = ref<Api | undefined>(undefined)
const labelField = ref<string | undefined>(undefined)
const result = ref(null)
const headers = ref<object[]>([])
const params = ref<object[]>([])
const baseUrl = ref('https://...')
const showAddLine = ref(false)
const typeModel = ref('Text')
const typeModelOptions = ref([
  {value: 'text', label: 'Text'},
  {value: 'number', label: 'Number'},
  {value: 'url', label: 'URL'},
  {value: 'date', label: 'Date'},
  {value: 'reference', label: 'Reference'},
  {value: 'formula', label: 'Formula'},
  {value: 'substitute', label: 'Text Substitution'}
])
const paramKey = ref('')

onMounted(() => {
  Analytics.firePageViewEvent('MainPanelApiPage', document.location.href);
})

watch(() => labelField.value, async (currentValue, oldValue) => {
  console.log("changed labelField", currentValue, oldValue)
  if (api.value) {
    api.value.labelField = currentValue
    await useApisStore().save(api.value)
  }
})

watchEffect(async () => {
  apiId.value = route.params.apiId.toString() || ''
  console.log("got apiId", apiId.value, useApisStore().updated)
  if (apiId.value && useApisStore().updated) {
    api.value = await useApisStore().findById(apiId.value)
    baseUrl.value = api.value?.setup?.url || 'https://'
    labelField.value = api.value?.labelField
    console.log("hier", form?.value, api.value)
    if (form && form.value && api.value) {

    }
    if (api.value?.setup?.headers) {
      headers.value = _.map(api.value.setup.headers, (h: object) => {
        return {
          id: h.id,
          name: h.name,
          default: h.default
        }
      })
    }
  }
})


const updateApi = async () => {

  if (api.value) {
    // if (!data.id) {
    //   data.id = uid()
    // }
    // delete data['newHeaderKey']
    // delete data['newHeaderType']
    // delete data['newParamsKey']
    // delete data['newParamsType']

    const headerDefinitions: HeaderDefinition[] = []
    for (const h of headers.value) {
      headerDefinitions.push(new HeaderDefinition(uid(), h.name, h.default))
    }

    const paramDefinitions: ParamDefinition[] = []
    for (const h of params.value) {
      paramDefinitions.push(new ParamDefinition(uid(), h.name, h.default))
    }

    api.value.setup = new ApiSetup(uid(), baseUrl.value, headerDefinitions, paramDefinitions)

    // api.value.setup.headers = []
    // for (const h of headers.value) {
    //   console.log("header", h)
    //   h['default' as keyof object] = data[h.id]
    //   api.value.setup.headers.push(h)
    //   delete data[h.id]
    // }
    //
    // api.value.setup.headers = headers.value
    // api.value.setup.params = params.value

    sendMsg('api-changed', api.value)
  }
}

const addHeader = () => {
  headers.value.push({
    id: uid(),
    name: paramKey.value,
    default: '',
  })
  showAddLine.value = false
}
const addParam = () => {
  if (form.value) {
    params.value.push({
      id: uid(),
      name: form.value.data.newParamsKey,
      default: '',
    })
  }
  //
}

const deleteHeader = (headerId: string) => {
  _.remove(headers.value, {id: headerId})
}

</script>

