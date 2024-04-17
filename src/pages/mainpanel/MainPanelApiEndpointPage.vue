#
<template>

  <q-toolbar>
    <div class="row fit">
      <q-toolbar-title>
        <div class="row justify-start items-baseline">
          <div class="col-10">API Endpoint</div>
          <div class="col-2 text-right">

          </div>
        </div>
      </q-toolbar-title>
    </div>
  </q-toolbar>

  <div class="q-ma-md">

    <div class="justify-start items-start greyBorderTop">
      <q-tabs align="left"
              inline-label
              active-bg-color="grey-3"
              v-model="tab"
              no-caps>
        <q-tab name="definition" label="Endpoint Definition"/>
        <q-tab name="execute" label="Execute"/>
        <q-tab name="results" label="Results"/>
      </q-tabs>
    </div>

    <div v-if="tab === 'definition'">

      <br><br>
      EndpointID {{ endpointId }}
      <q-btn v-if="endpointId" class="q-ml-md" size="xs" label="Delete" @click="deleteEndpoint()"/>

      <div class="row">
        <div class="col-3 q-my-md">Base URL from API Definition</div>
        <div class="col-9 q-my-md">
          {{ api?.setup?.url }}
        </div>
        <div class="col-3 q-my-md">Endpoint</div>
        <div class="col-9 q-my-md">
          <q-input v-model="endpointUrl" label="Endpoint Path"
                   :hint="'Endpoint URL set to \'' + api?.setup?.url + endpointUrl + '\''"/>
        </div>
        <div class="col-3 q-my-md">
          Parameter<br>
          <q-btn icon="o_add" size="xs" @click="showAddLine = true"/>
        </div>
        <div class="col-9 q-my-md">

          <div class="row" v-for="p in params">
            <div class="col-4">
              <q-select v-model="typeModel" :options="typeModelOptions" label="Type"/>
            </div>
            <div class="col-4">
              <q-input v-model="p.name" label="Key"/>
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
              <q-btn label="add" @click="addParam()"/>
            </div>
          </div>

        </div>
        <div class="col-3"></div>
        <div class="col-9">
          <q-btn label="submit" @click="createOrUpdateEndpoint()"/>
        </div>
      </div>

    </div>

    <div v-if="tab === 'execute'">

      <br><br>
      EndpointID {{ endpointId }}
      <q-btn v-if="endpointId" class="q-ml-md" size="xs" label="Delete" @click="deleteEndpoint()"/>

      <div class="row">

        <div class="col-3 q-my-md">Base URL from API Definition</div>
        <div class="col-9 q-my-md">
          {{ api?.setup?.url }}
        </div>
        <div class="col-3 q-my-md">Endpoint</div>
        <div class="col-9 q-my-md">
          <q-input v-model="endpointUrl" label="Endpoint Path"
                   :hint="'Endpoint URL set to \'' + api?.setup?.url + endpointUrl + '\''"/>
        </div>
        <div class="col-3 q-my-md">
          Parameter
        </div>
        <div class="col-9 q-my-md">

          <div class="row" v-for="p in params">
            <div class="col-4">
              <q-input v-model="p.name" label="Key"/>
            </div>
            <div class="col-4">
              <q-input v-model="p.value" label="Value"/>
            </div>
            <div class="col-4">

            </div>
          </div>


        </div>
        <div class="col-3"></div>
        <div class="col-9">
          <q-btn label="execute" @click="execute()"/>
        </div>
      </div>

      <div v-if="errorMsg">{{ errorMsg }}</div>


      <vue-json-pretty v-if="result" style="font-size: 80%" :show-length="true"
                       v-model:data="state.data"
                       :show-double-quotes="true"
      />
    </div>

    <div v-if="tab === 'results'">
      {{ endpoint?.results }}

        <div>
          <label><b>JSONPath:</b>
            <q-input v-model="jsonPath"/>
          </label>
        </div>

        <div id="resultContainer" class="container">
          <label><b>Results:</b>
            {{ jsonPathApplied }}
          </label>
        </div>

        <vue-json-pretty v-if="jsonPathApplied" style="font-size: 80%" :show-length="true"
                         v-model:data="jsonPathState.data"
                         :show-double-quotes="true"/>

      <div class="row">
        <div class="col-8">
          <q-input v-model="newEntityName" />
        </div>
        <div class="col-4">
          <q-btn label="save as entity" @click="saveAsEntity()"/>
        </div>
      </div>

    </div>
  </div>

</template>

<script lang="ts" setup>

import {onMounted, reactive, ref, watchEffect} from "vue";
import Analytics from "src/utils/google-analytics";
import {useRoute} from "vue-router";
import _ from "lodash"
import {uid} from "quasar";
import {useUtils} from "src/services/Utils";
import {Api, ApiResponse, Endpoint, ParamDefinition} from "src/models/Api";
import {useApisStore} from "stores/apisStore";
import {axios} from "boot/axios";
import VueJsonPretty from "vue-json-pretty";
// TODO check approach for vueform
import 'vue-json-pretty/lib/styles.css';
// @ts-ignore
import {JSONPath} from '../../../node_modules/jsonpath-plus/dist/index-browser-esm.js';
import {useCommandExecutor} from "src/services/CommandExecutor";
import {ExecuteApiCommand} from "src/domain/apis/ExecuteApiCommand";
import {AddEntityCommand} from "src/domain/entites/AddEntityCommand";
import {useEntitiesStore} from "stores/entitiesStore";
import {Field} from "src/models/Entity";

const config = {}

const {sendMsg} = useUtils()

const route = useRoute()

const apiId = ref<string | undefined>(undefined)
const endpointId = ref<string | undefined>(undefined)
const api = ref<Api | undefined>(undefined)
const endpoint = ref<Endpoint | undefined>(undefined)
const params = ref<ParamDefinition[]>([])
const endpointUrl = ref('/')
const errorMsg = ref('')
const paramKey = ref('')
const newEntityName = ref('')
const showAddLine = ref(false)
const call = ref(false)
const result = ref(null)
const tab = ref('definition')
const typeModel = ref('Text')
const typeModelOptions = ['Text']
const jsonPath = ref('$')
const jsonPathApplied = ref('')

const state = reactive({val: JSON.stringify(result), data: result})
const jsonPathState = reactive({val: JSON.stringify(jsonPathApplied), data: jsonPathApplied})


onMounted(() => {
  Analytics.firePageViewEvent('MainPanelApiEndpointsPage', document.location.href);
})

watchEffect(() => {
  if (jsonPath.value) {
    console.log("jsonpath", jsonPath.value)
    try {
      if (endpoint.value && endpoint.value.results) {
        const json = endpoint.value.results[0].data
        console.log("json", endpoint.value.results)
        console.log("json", json)
        //jsonSample.setCustomValidity('');
        //reportValidity();
        jsonPathApplied.value = JSONPath({path: jsonPath.value, json});
      }
    } catch (err) {
      //jsonSample.setCustomValidity('Error parsing JSON: ' + err.toString());
      //reportValidity();
      console.log("err", err)
      return;
    }

  }
})

watchEffect(() => {
  // if (useEntitiesStore().updated) {
  //   const entities = useEntitiesStore().entities
  //   console.log("got entities", entities)
  //   for (const entity of entities) {
  //     const items = entity.items
  //     const valueMap = _.map(items, i => {
  //       console.log("chcking", i)
  //       return {
  //         value: i.id,
  //         label: i[entity.labelField as keyof object] || i.name || i.id
  //       }
  //     })
  //     console.log("setting referencesItems", entity.id, valueMap)
  //     referencedItems.value.set(entity.id, valueMap)
  //   }
  //   console.log("refrenceItems", referencedItems.value)
  // }
})

apiId.value = route.params.apiId.toString() || undefined
endpointId.value = route.params.endpointId?.toString() || undefined

watchEffect(async () => {
  if (apiId.value && useApisStore().updated) {
    api.value = await useApisStore().findById(apiId.value)
    if (api.value) {
      if (endpointId.value) {
        endpoint.value = _.find(api.value.endpoints, {id: endpointId.value})
        endpointUrl.value = endpoint.value!.path || '?'
        params.value = endpoint.value!.params || []
      }
    }
  }
})

const deleteEndpoint = () => {
  if (api.value) {
    console.log("deleting endpoint id", endpointId.value)
    _.remove(api.value.endpoints, {
      id: endpointId.value
    });
    console.log("got", api.value)
    sendMsg('api-changed', api.value)
    window.close()
  }
}

const addParam = () => params.value.push(new ParamDefinition(uid(), paramKey.value, ''))

const createOrUpdateEndpoint = async () => {
  if (api.value) {
    const data: { id: string; endpoint: string | undefined, params: object } = {
      id: uid(),
      endpoint: undefined,
      params: {}
    };
    data.endpoint = endpointUrl.value
    data.params = params.value
    // if (!data.id) {
    //   data.id = uid()
    // } else {
    //   _.remove(api.value.endpoints, {
    //     id: endpointId.value
    //   });
    // }
    if (!api.value.endpoints) {
      api.value.endpoints = []
    }
    const newEndpoint = new Endpoint(uid(), endpointUrl.value, [], params.value)
    api.value.endpoints.push(newEndpoint)
    sendMsg('api-changed', api.value)
    //await useEntitiesStore().save(entity.value)
    //window.close()
  }
}

const saveAsEntity = async () => {
  //useCommandExecutor().executeFromUi(new AddEntityCommand(newEntityName.value))
  const newEntity = await useEntitiesStore().createEntity(newEntityName.value)
  for (const [key, value] of Object.entries(jsonPathApplied.value[0])) {
    console.log("checking", key, value, typeof value)
    let type = 'text'
    switch(typeof value) {
      case 'number':
        type = 'number'
        break
      default:
        type  = 'text'
    }
    const f = new Field(uid(), key, type, key)
    newEntity.fields.push(f)
    newEntity.description = "created from api"
    newEntity.source = "api|" + api.value?.id + "|" + endpoint.value?.id
    newEntity.jsonPath = jsonPath.value
  }
  sendMsg('entity-changed', newEntity)
}

const execute = async () => {
  if (api.value && endpoint.value) {
    const res = await useCommandExecutor().executeFromUi(new ExecuteApiCommand(api.value, endpoint.value))
    if (res) {
      endpoint.value.results.push(new ApiResponse(uid(), [], [], res.result.data))
      result.value = res.result.data
      sendMsg('api-changed', api.value)
    }
    // try {
    //   const headers = {}
    //   for (const h of api.value.setup!.headers) {
    //     headers[h.name as keyof object] = h['default' as keyof object]
    //   }
    //   const params = {}
    //   for (const p of endpoint.value!.params) {
    //     params[p.name as keyof object] = p.value
    //   }
    //   const options = {
    //     method: 'GET',
    //     url: api.value!.setup!.url + endpoint.value!.path,
    //     params: params,
    //     headers: headers
    //   };
    //   console.log("calling axios with options", options)
    //   const response = await axios.request(options);
    //   console.log(response.data);
    //   if (endpoint.value) {
    //
    //   }
    // } catch (error: any) {
    //   errorMsg.value = error.toString()
    //   console.error(error);
    // }
  }

}

</script>

