<template>

  <q-toolbar>
    <div class="row fit">
      <q-toolbar-title>
        <div class="row justify-start items-baseline">
          <div class="col-10">Entity Management</div>
          <div class="col-2 text-right">
            <q-btn label="delete entity" @click="deleteEntity()"/>
          </div>
        </div>
      </q-toolbar-title>
    </div>
  </q-toolbar>

  <div class="q-ma-md">

    <fieldset style="border:1px dotted grey; border-radius:5px;background-color:#efefef">
      <legend style="background-color:#efefef">{{ entity?.name }}: Definition</legend>
      <div class="row items-center">

        <div class="col-2 q-pa-md">
          Description
        </div>
        <div class="col-5">
          <q-input v-model="description" label="Description"/>
        </div>
        <div class="col-5 q-pa-md text-grey">
          Provide a description for this entity
        </div>

        <div class="col-2 q-pa-md">
          Source
        </div>
        <div class="col-5">
          <q-select v-model="source" :options="sourceOptions"/>
        </div>
        <div class="col-5 q-pa-md text-grey">
          The source for this entity could be an API
        </div>

        <div class="col-2 q-pa-md">
          JsonPath
        </div>
        <div class="col-5">
          <q-input v-model="jsonPath" label="jsonPath"/>
        </div>
        <div class="col-5 q-pa-md text-grey">
          Select part of the result to be assigned to an entity
        </div>

        <div class="col-2 q-pa-md">
          App(s)
        </div>
        <div class="col-5">
          <q-select
            label=""
            filled
            v-model="apps"
            use-input
            use-chips
            multiple
            hide-dropdown-icon
            input-debounce="0"
            new-value-mode="add-unique"/>
        </div>
        <div class="col-5 q-pa-md text-grey">
          Entities can be part of apps
        </div>

      </div>
      <br>
    </fieldset>

    <div class="col-3 q-my-sm"></div>
    <div class="col-9 q-my-sm">
      <q-btn label="Update / Submit" @click="saveEntity()"/>
    </div>

    <br><br>

    <fieldset style="border:1px dotted grey; border-radius:5px">
      <legend>{{ entity?.name }}: Defined Fields</legend>

      <q-list class="q-my-md" bordered separator>
        <q-item clickable v-ripple v-for="(f,idx) in entity?.fields" :key="idx">
          <q-item-section>
            <q-item-label>{{ f.label }}</q-item-label>
            <q-item-label caption>{{ f.id }}</q-item-label>
          </q-item-section>
          <q-item-section>
            <q-item-label>{{ f.type }}</q-item-label>
          </q-item-section>
          <q-item-section>
            <q-item-label>
              <span class="q-mr-md text-right">
<!--                <q-checkbox v-model="showInList[idx]" @update:modelValue="(val) => updateShowInList(idx)"/>-->
                <q-radio v-model="labelField" :val="f.name" label=""/>
              </span>
              <span class="q-mr-md text-right">
                <q-icon name="edit" color="primary" @click="editField(f)"/>
              </span>
              <span class="q-mr-md text-right">
                <q-icon name="delete" color="negative" @click="deleteField(f)"/>
              </span>
            </q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </fieldset>

    <br><br>


    <form @submit.prevent.stop="addField">
      <fieldset style="border:1px dotted grey; border-radius:5px">

        <legend>{{ entity?.name }}: Add Field</legend>

        <div class="row q-my-md">

          <div class="col-2 q-pa-md">Type</div>
          <div class="col-5">
            <q-select v-model="typeModel" :options="[
                          {value: FieldType.TEXT,label: 'Text'},
                          {value: FieldType.TEXTAREA,label: 'Textarea'},
                          {value: FieldType.EDITOR,label: 'Editor'},
                          {value: FieldType.NUMBER,label: 'Number'},
                          {value: FieldType.URL,label: 'URL'},
                          {value: FieldType.DATE,label: 'Date'},
                          {value: FieldType.REFERENCE,label: 'Reference'},
                          {value: FieldType.FORMULA,label: 'Formula'},
                          {value: FieldType.SUBSTITUTION,label: 'Text Substitution'}
                        ]" emit-value map-options label="Type"/>
          </div>
          <div class="col-5 q-pa-md text-grey">
            Choose a type for this field
          </div>

          <template v-if="typeModel === FieldType.REFERENCE">
            <div class="col-2 q-pa-md">Reference</div>
            <div class="col-5 q-my-sm">
              <q-input v-model="name" label="Name"/>
            </div>
            <div class="col-5 q-pa-md text-grey">
              Provide a name for this field
            </div>
          </template>

          <div class="col-2 q-pa-md">Name (*)</div>
          <div class="col-5">
            <q-input v-model="name" label="Name" :rules="[
              val => !!val || 'Name is required',
              val => /^[a-zA-Z]+[a-zA-Z0-9]*$/.test(val) || 'please use a valid variable name',
              val => val !== 'id' && val !== 'created' && val !== 'updated' || 'id, created and updated are reserved fields and will be added automatically'
            ]"/>
          </div>
          <div class="col-5 q-pa-md text-grey">
            Provide a single word name for this field
          </div>

          <div class="col-2 q-pa-md">Label</div>
          <div class="col-5">
            <q-input v-model="label" label="Label"/>
          </div>
          <div class="col-5 q-pa-md text-grey">
            Provide a name for this field
          </div>

          <div class="col-2 q-pa-md">Info</div>
          <div class="col-5">
            <q-input v-model="info" label="Info"/>
          </div>
          <div class="col-5 q-pa-md text-grey">
            Provide a name for this field
          </div>
        </div>
      </fieldset>

      <div class="row q-my-md">
        <div class="col-3 items-center"></div>
        <div class="col-9">
          <q-btn :label="submitButtonLabel" type="submit"/>
        </div>
      </div>
    </form>

    <!--        <SelectElement name="type" :native="false" label="Type" :can-deselect="false" :can-clear="false"-->
    <!--                       :default="'text'"-->
    <!--                       :items="[-->
    <!--                          {value: 'substitute',label: 'Text Substitution'}-->
    <!--                        ]"/>-->
    <!--        <SelectElement name="reference" :native="false" label="Referenced Entity"-->
    <!--                       :conditions="[['type','in',['reference']]]"-->
    <!--                       :items="entitiesAsReference"/>-->
    <!--        <TextElement name="formula" label="Formula" placeholder="e.g. {a} * {b}"-->
    <!--                     :conditions="[['type','in',['formula']]]"/>-->
    <!--        <TextElement name="substitution" label="Text Substitution" placeholder="{a} ({b})"-->
    <!--                     :conditions="[['type','in',['substitute']]]"/>-->
    <!--        <TextElement name="name" label="Name" placeholder="the internal name" :rules="['required']"/>-->
    <!--        <TextElement name="label" label="Label" placeholder="The label shown in the UI" :rules="['required']"/>-->

  </div>
</template>

<script lang="ts" setup>

import {onMounted, ref, watch, watchEffect} from "vue";
import Analytics from "src/utils/google-analytics";
import {useRoute} from "vue-router";
import {useEntitiesStore} from "stores/entitiesStore";
import {Entity, Field, FieldType} from "src/models/Entity";
import _ from "lodash"
import {uid} from "quasar";
import {useUtils} from "src/services/Utils";
import {useApisStore} from "stores/apisStore";

const {sendMsg} = useUtils()
const route = useRoute()

const apps = ref<string[]>([])
const entityId = ref<string | undefined>(undefined)
const entity = ref<Entity | undefined>(undefined)
const entitiesAsReference = ref<object[]>([])
const labelField = ref<string | undefined>(undefined)
const submitButtonLabel = ref('Add')
const description = ref('')
const name = ref('')
const label = ref('')
const info = ref('')
const jsonPath = ref<string | undefined>('$')
const source = ref<string>('manual')

const sourceOptions = ref<object[]>([])

const typeModel = ref<FieldType>(FieldType.TEXT)

onMounted(() => {
  Analytics.firePageViewEvent('MainPanelEntitiesPage', document.location.href);
})

watch(() => labelField.value, async (currentValue, oldValue) => {
  console.log("changed labelField", currentValue, oldValue)
  if (entity.value) {
    entity.value.labelField = currentValue
    await useEntitiesStore().save(entity.value)
  }
})

watchEffect(() => {
  sourceOptions.value = [{label: 'Manual', value: 'manual'}]
  const apis = useApisStore().apis
  for (const a of apis) {
    for (const e of a.endpoints) {
      sourceOptions.value.push({
        label: a.name + " -> " + e.path,
        value: e.id
      })
    }
  }

})

watchEffect(async () => {
  entityId.value = route.params.entityId.toString() || ''
  if (entityId.value && useEntitiesStore().updated) {
    entity.value = await useEntitiesStore().findById(entityId.value)
    labelField.value = entity.value?.labelField
    description.value = entity.value?.description || ''
    jsonPath.value = entity.value?.jsonPath || ''
    apps.value = entity.value?.apps || []
    source.value = entity.value?.source || 'manual'
  }
})

watchEffect(() => {
  entitiesAsReference.value = _.map(useEntitiesStore().entities, (e: Entity) => {
    return {
      value: e.id,
      label: e.name
    }
  })
})

watchEffect(() => {
  console.log ("==>", name.value, label.value)
  if (name.value && (label.value === '' || name.value.toLowerCase().startsWith(label.value.toLowerCase()))) {
    label.value = name.value.substring(0,1).toUpperCase() + name.value.substring(1)
  }
})

const addField = () => {
  console.log("adding field", entity.value)
  if (entity.value) {
    entity.value.fields.push(new Field(uid(), name.value, typeModel.value, label.value, info.value))
    sendMsg('entity-changed', entity.value)
  }
}

const deleteField = async (f: Field) => {
  console.log("deleting", f)
  if (entity.value) {
    entity.value.fields = _.filter(entity.value.fields, (field: Field) => field.id !== f.id)
    await useEntitiesStore().save(entity.value)
  }
}

const saveEntity = async () => {
  if (entity.value) {
    console.log("apps.value", apps.value)
    entity.value.description = description.value
    entity.value.source = "api|" + source.value['value' as keyof object]
    entity.value.jsonPath = jsonPath.value
    entity.value.apps = apps.value
    console.log("saving", entity.value, source.value)
    await useEntitiesStore().save(entity.value)
  }
}

const deleteEntity = () => {
  if (entity.value) {
    useEntitiesStore().deleteEntity(entity.value.id)
    sendMsg('reload-entities')
    window.close()
  }
}

</script>

<style>

legend {
  border: 1px solid grey;
  border-radius: 3px;
  padding: 2px 5px 2px 5px;
}

</style>
