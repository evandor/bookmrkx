<template>

  <q-toolbar>
    <div class="row fit">
      <q-toolbar-title>
        <div class="row justify-start items-baseline">
          <div class="col-12">Entity Management</div>
        </div>
      </q-toolbar-title>
    </div>
  </q-toolbar>


  <div class="q-ma-md">

    <template v-if="api?.setup">
      <fieldset style="border:1px dotted grey; border-radius:5px">
        <legend>{{ entity?.name }}: Add from API</legend>
        <div class="row q-my-md" v-for="p in inputParams">
          <div class="col-3 items-center">{{ p.name }}</div>
          <div class="col-9">
            <q-input v-model="p.default" :label="p.name"/>
          </div>
        </div>
      </fieldset>

      <div class="row q-my-md">
        <div class="col-3 items-center"></div>
        <div class="col-9">
          <q-btn label="Load" @click="loadFromApi()"/>
        </div>
      </div>
    </template>

    <fieldset style="border:1px dotted grey; border-radius:5px">
      <legend>{{ entity?.name }}: Add</legend>
      <div class="row q-my-md" v-for="f in fields">

        <template v-if="f.type === FieldType.TEXT">
          <div class="col-3 items-center">{{ f.label }}</div>
          <div class="col-9">
            <q-input v-model="f.value" :label="f.label"/>
          </div>
        </template>
        <template v-else-if="f.type === FieldType.NUMBER">
          <div class="col-3 items-center">{{ f.label }}</div>
          <div class="col-9">
            <q-input v-model="f.value" :label="f.label"/>
          </div>
        </template>
        <template v-else-if="f.type === FieldType.TEXTAREA">
          <div class="col-3 items-center">{{ f.label }}</div>
          <div class="col-9">
            <q-input type="textarea" v-model="f.value" :label="f.label"/>
          </div>
        </template>
        <template v-else>
          <div class="col-3 items-center">{{ f.label }}*</div>
          <div class="col-9">
            <q-input v-model="f.value" :label="f.label"/>
          </div>
        </template>
      </div>

    </fieldset>

    <div class="row q-my-md">
      <div class="col-3 items-center"></div>
      <div class="col-9">
        <q-btn label="Save" @click="save()"/>
      </div>
    </div>

    <div class="q-ma-md">
      <q-btn v-if="itemId" class="q-ml-md" size="xs" label="Delete" @click="deleteItem()"/>
    </div>

  </div>
</template>

<script lang="ts" setup>

import {onMounted, ref, watchEffect} from "vue";
import Analytics from "src/utils/google-analytics";
import {useRoute, useRouter} from "vue-router";
import {useEntitiesStore} from "stores/entitiesStore";
import {Entity, Field, FieldType} from "src/models/Entity";
import _ from "lodash"
import {uid} from "quasar";
import {useUtils} from "src/services/Utils";
import {create, all} from 'mathjs'
import {useCommandExecutor} from "src/services/CommandExecutor";
import {ExecuteApiCommand} from "src/domain/apis/ExecuteApiCommand";
import {useApisStore} from "stores/apisStore";
import {Api, ApiResponse, Endpoint, ParamDefinition} from "src/models/Api";
// @ts-ignore
import {JSONPath} from '../../../node_modules/jsonpath-plus/dist/index-browser-esm.js';
import {ExecutionResult} from "src/domain/ExecutionResult";

const config = {}
const math = create(all, config)

const {sendMsg} = useUtils()

const route = useRoute()
const router = useRouter()

const api = ref<Api | undefined>(undefined)
const endpoint = ref<Endpoint | undefined>(undefined)
const entityId = ref<string | undefined>(undefined)
const itemId = ref<string | undefined>(undefined)
const entity = ref<Entity | undefined>(undefined)
const referencedItems = ref<Map<string, object>>(new Map())
const fields = ref<Field[]>([])
const inputParams = ref<ParamDefinition[]>([])

onMounted(() => {
  Analytics.firePageViewEvent('MainPanelEntitiesPage', document.location.href);
})

watchEffect(() => {
  if (useEntitiesStore().updated) {
    const entities = useEntitiesStore().entities
    console.log("got entities", entities)
    for (const entity of entities) {
      const items = entity.items
      const valueMap = _.map(items, i => {
        console.log("chcking", i)
        return {
          value: i.id,
          label: i[entity.labelField as keyof object] || i.name || i.id
        }
      })
      console.log("setting referencesItems", entity.id, valueMap)
      referencedItems.value.set(entity.id, valueMap)
    }
    console.log("refrenceItems", referencedItems.value)
  }
})

entityId.value = route.params.entityId.toString() || undefined
itemId.value = route.params.itemId?.toString() || undefined

watchEffect(async () => {
  if (entityId.value && useEntitiesStore().updated) {
    entity.value = await useEntitiesStore().findById(entityId.value)

    const apiId = entity.value?.source?.split("|")[1]
    if (apiId) {
      api.value = await useApisStore().findById(apiId)
    }
    const endpointId = entity.value?.source?.split("|")[2]
    if (endpointId && api.value) {
      endpoint.value = _.find(api.value.endpoints, {id: endpointId}) as Endpoint || new Endpoint("", "", [])
    }

    if (entity.value) {
      const item: object | undefined = itemId.value ? _.find(entity.value!.items, (i: object) => i['id' as keyof object] === itemId.value) : undefined
      console.log("hier", item)
      console.log("entity", entity.value)

      fields.value = entity.value.fields
      // inputParams.value = entity.value.

    }

    if (api.value) {
      inputParams.value = api.value.setup?.params || []
    }

  }
})

const save = () => {
  if (entity.value) {
    const data: Record<string, any> = {}
    data.updated = new Date().getTime()
    if (itemId.value) {
      data.id = itemId.value
      //data.created =
      const removed = _.remove(entity.value.items as object[], {
        id: itemId.value
      });
      if (removed && removed[0]) {
        data.created = removed[0]['created']
      }
    } else {
      data.id = uid()
      data.created = new Date().getTime()
    }
    for (const f of entity.value.fields) {
      data[f.name] = f.value
    }
    entity.value.items.push(data)
    sendMsg('entity-changed', entity.value)
    if (!itemId.value) {
      router.push(`/mainpanel/entities/${entity.value.id}/items/${data.id}`)
    }
  }
}

// const submit = async (FormData, form$) => {
//   const formData = FormData // FormData instance
//   const data = form$.data // form data including conditional data
//   const requestData = form$.requestData // form data excluding conditional data
//   // console.log('xxx2', data)
//   // console.log('xxx3', requestData)
//   // console.log('xxx4', entity.value)
//   if (entity.value) {
//     if (!data.id) {
//       data.id = uid()
//       entity.value.items.push(data)
//     } else {
//       _.remove(entity.value.items, {
//         id: itemId.value
//       });
//       entity.value.items.push(data)
//     }
//     sendMsg('entity-changed', entity.value)
//     //await useEntitiesStore().save(entity.value)
//     window.close()
//   }
// }

// const calculate = (e: Entity, formula: object) => {
//   console.log("e,formula", e, formula)
//   let rawFormula: string = formula.formula || ''
//   for (const field of e.fields) {
//     if (field.type === "number") {
//       //console.log("field", field)
//       //console.log("formdata", formdata.value)
//       const fieldName = field.name
//       rawFormula = rawFormula.replaceAll("{" + fieldName + "}", formdata.value[fieldName as keyof object])
//       // console.log("rawFormula", rawFormula)
//     }
//   }
//   try {
//     return math.evaluate(rawFormula)
//   } catch (err) {
//     console.log("error", err)
//     return formula.formula
//   }
// }

// const substitute = (e: Entity, substitution: string) => {
//   console.log("e,substitution", substitution)
//   let sub: string = substitution || ''
//   let match = false
//   for (const field of e.fields) {
//
//     const fieldName = field.name
//     switch (field.type) {
//       case "reference":
//         console.log("field", field)
//         console.log("formdata", formdata.value)
//         console.log("xxx", field.reference, referencedItems.value)
//         console.log("xxx", referencedItems.value.get(field.reference)[0])
//         match = true
//         sub = sub.replaceAll("{" + fieldName + "}", referencedItems.value.get(field.reference)[0].label)
//         break
//       default:
//         if (formdata.value[fieldName as keyof object]) {
//           match = true
//           sub = sub.replaceAll("{" + fieldName + "}", formdata.value[fieldName as keyof object])
//         }
//     }
//     console.log("sub", sub)
//   }
//   // try {
//   //   return math.evaluate(rawFormula)
//   // } catch (err) {
//   //   console.log("error", err)
//   //   return formula.formula
//   // }
//   return match ? sub : substitution.substitution
// }

const deleteItem = () => {
  if (entity.value) {
    console.log("deleting item id", itemId.value)
    _.remove(entity.value.items, {
      id: itemId.value
    });
    //entity.value.items = removed
    console.log("got", entity.value)
    sendMsg('entity-changed', entity.value)
    window.close()
  }
}

const loadFromApi = async () => {
  console.log("loading from api", entity.value)
  if (entity.value?.source?.startsWith("api|")) {

    if (api.value && endpoint.value) {
      for (const p of inputParams.value) {
        console.log("setting params: ", p.name, p.default)
        endpoint.value.params.push(new ParamDefinition(uid(), p.name, p.default))
      }
      const res: ExecutionResult<ApiResponse> = await useCommandExecutor().executeFromUi(new ExecuteApiCommand(api.value, endpoint.value))
      console.log("res", res)
      let data = res.result.data
      if (entity.value.jsonPath) {
        data = JSONPath({path: entity.value.jsonPath, json: data});
      }
      console.log("data", typeof data, data)
      const fromResult = data[0]
      console.log("fromResult", fromResult)
      for (const [key, value] of Object.entries(fromResult)) {
        // console.log(`${key}: ${value}`);
        for (const f of fields.value) {
          if (f.name === key) {
            console.log("setting ", key, value)
            f.value = value
          }
        }
      }
    }
  }
}

</script>


