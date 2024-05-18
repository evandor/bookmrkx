<template>

  <!-- toolbar -->
  <q-toolbar class="text-primary">
    <div class="row fit">
      <div class="col-12">
        <q-toolbar-title>
          <div class="row justify-start items-baseline">
            <div class="col-1">
              <q-icon name="chevron_left" class="cursor-pointer q-mr-lg" size="24px"
                      @click="router.push('/mainpanel/settings')">
                <q-tooltip>Back</q-tooltip>
              </q-icon>
            </div>
            <div class="col-9">{{ title }}</div>
            <div class="col text-right">
              <OpenRightDrawerWidget/>
            </div>
          </div>
        </q-toolbar-title>
      </div>
    </div>
  </q-toolbar>

  <div class="row fit greyBorderTop"></div>

  <InfoMessageWidget
    :probability="1"
    ident="featuresPage_overview"
    hint="The Tabsets Extension starts simple - you can manage tabs - but it has more to offer. Check out the optional or
      experimental features described below. Some of the features may require additional browser permissions which you will have to grant."/>

  <div class="row q-ma-lg">

    <div class="col-7">
      <div class="text-h6">{{ text.get(feature)?.name }}</div>
      <div>
        Status: {{ hasFeature() ? 'active' : 'inactive' }}
      </div>
    </div>

    <div class="col text-right q-mr-xl">
      <div v-if="!text.get(feature)?.planned">
        <q-btn v-if="!hasFeature()" color="warning"
               label="Activate Feature" @click="grant(feature)" />
        <q-btn v-else
               label="Deactivate Feature" @click="revoke(feature)"/>
      </div>
    </div>

    <div class="col-12 q-my-sm">
      <div class="text-subtitle2">Type</div>
    </div>

    <div class="col-12 q-my-md">
      <div v-if="appFeature?.type === FeatureType.RECOMMENDED">
        This feature is considered stable and useful, but not activated by default. To use it, switch this feature on.
      </div>
      <div v-if="appFeature?.type === FeatureType.OPTIONAL">
        This feature is considered stable but might not be useful for everybody. To use it, switch this feature on.
      </div>
      <div v-if="appFeature?.type === FeatureType.EXPERIMENTAL">
        This feature is not considered stable and might break other parts of this extension. To use it at your
        own risk, switch this feature on.
      </div>
    </div>

    <div class="col-12 q-my-sm">
      <div class="text-subtitle2">Description</div>
    </div>

    <div class="col-12 q-my-md">
      <div v-html="text.get(feature)?.description"></div>
      <div v-if="hasFeature()" class="text-primary q-mt-md">{{ text.get(feature)?.activatedMsg }}</div>
    </div>

    <div class="col-12 q-my-sm" v-if="getDependentFeatures(feature).length > 0 && !hasFeature()">
      <div class="text-subtitle2">Dependent Features</div>
    </div>
    <div class="col-12 q-my-sm" v-if="getDependentFeatures(feature, true).length > 0 && hasFeature()">
      <div class="text-subtitle2">Dependent Features</div>
    </div>

    <div class="col-12 q-my-md" v-if="getDependentFeatures(feature).length > 0 && !hasFeature()">
      Activating this feature will make {{ getDependentFeatures(feature).length }} more feature(s) available:
      <ul>
        <li v-for="f in getDependentFeatures(feature)">{{ f.name }}</li>
      </ul>
    </div>

    <div class="col-12 q-my-md" v-if="getDependentFeatures(feature, true).length > 0 && hasFeature()">
      Deactivating this feature would deactivate {{ getDependentFeatures(feature, true).length }} more feature(s):
      <ul>
        <li v-for="f in getDependentFeatures(feature, true)">{{ f.name }} (currently active)</li>
      </ul>
    </div>

    <div class="col-12 q-my-md" v-if="text.get(feature)?.img">
      <div>
          <q-img :src="text.get(feature)?.img" :width="text.get(feature)?.img_width || '250px'"/>
      </div>
    </div>

    <template v-if="text.get(feature)?.more">
      <div class="col-12 q-my-sm">
        <div class="text-subtitle2">More Info</div>
      </div>

      <div class="col-12 q-my-md">
        <div> click <a class="cursor-pointer text-blue-6"
                       @click="NavigationService.openOrCreateTab([text.get(feature)?.more])">here</a></div>
      </div>
    </template>

    <div class="col-12 q-my-sm">
      <div class="text-subtitle2">Permissions</div>
    </div>

    <div class="col-12 q-my-md">
      <div> {{ permissionText(text.get(feature)) }}</div>
    </div>

  </div>

</template>

<script setup lang="ts">
import {onMounted, ref, watchEffect} from 'vue'
import {useRoute, useRouter} from "vue-router";
import {Notify, useQuasar} from "quasar";
import {usePermissionsStore} from "src/stores/permissionsStore";
import {useCommandExecutor} from "src/services/CommandExecutor";
import {AppFeatures} from "src/models/AppFeatures";
import InfoMessageWidget from "components/widgets/InfoMessageWidget.vue";
import {DrawerTabs, useUiStore} from "src/stores/uiStore";
import OpenRightDrawerWidget from "components/widgets/OpenRightDrawerWidget.vue";
import Analytics from "src/utils/google-analytics";
import Command from "src/domain/Command";
import NavigationService from "src/services/NavigationService";
import {useUtils} from "src/services/Utils";
import {AppFeature} from "src/models/AppFeature";
import {FeatureIdent, FeatureType} from "src/models/FeatureIdent";

const route = useRoute();
const router = useRouter();
const permissionsStore = usePermissionsStore()

const title = ref('')
const {sendMsg} = useUtils()

useUiStore().rightDrawerSetActiveTab(DrawerTabs.FEATURES)

const feature = ref(null as unknown as string)
const appFeature = ref<AppFeature | undefined>(undefined)

const text: Map<string, object> = new Map()

onMounted(() => {
  Analytics.firePageViewEvent('FeaturesPage', document.location.href);
})


text.set(FeatureIdent.WINDOWS_MANAGEMENT.toLowerCase(), {
  name: 'Windows Management',
  description: 'A convenient way to manage multiple windows of your browser',
  img: 'open_tabs_warning.png',
  permissions: []
})


watchEffect(() => {
    feature.value = route.params.feature as string
    const f = feature.value?.toUpperCase() as FeatureIdent
    if (f) {
      appFeature.value = new AppFeatures().getFeature(f)
      if (appFeature.value) {
        switch (appFeature.value.type) {
          case FeatureType.EXPERIMENTAL:
            title.value = "Experimental Feature"
            break;
          case FeatureType.RECOMMENDED:
            title.value = "Recommended Feature"
            break;
          case FeatureType.OPTIONAL:
            title.value = "Optional Feature"
            break;
          case FeatureType.PLANNED:
            title.value = "Planned Feature"
            break;
        }
      }
    }
  }
)

const hasFeature = () => {
  if (appFeature.value) {
    return permissionsStore.hasFeature(appFeature.value.ident)
  }
  return false;
}

const grant = (ident: string) => {
  if (appFeature.value) {
    try {
      appFeature.value.activateCommands.forEach((c: Command<any>) => {
        useCommandExecutor().execute(c)
      })
      if (ident === 'bookmarks') {
        sendMsg('reload-application')
      }
    } catch (err) {
      Notify.create({
        color: 'negative',
        message: "got error: " + err
      })
    }
  }
  //TODO the default activeCommand always executes "permissionStore.activateFeature" - so we do it twice
  /* if (appFeature.value && appFeature.value.activateCommand) {
     useCommandExecutor().execute(appFeature.value.activateCommand)
         .then((executionResult: ExecutionResult<any>) => {
           if (executionResult.result) {
             permissionsStore.activateFeature(ident)
           }
         })
   } else {
     permissionsStore.activateFeature(ident)
   }
 */
}

const revoke = (ident: string) => {
  if (appFeature.value && appFeature.value.deactivateCommand) {
    console.log("revoking1", ident, appFeature.value.deactivateCommand)
    useCommandExecutor().execute(appFeature.value.deactivateCommand)
        .then(() => permissionsStore.deactivateFeature(ident))
  } else {
    console.log("revoking2", ident)
    permissionsStore.deactivateFeature(ident)
  }
}


const permissionText = (f: any) => {
  if (!f) {
    return "???"
  }
  const permissions: string[] = f.permissions
  if (permissions.length === 0) {
    return "This feature does not need additional browser permissions."
  } else {
    return "This feature needs additional browser permissions: " + JSON.stringify(permissions)
  }

}

const getDependentFeatures = (rootFeature: string, onlyActive: boolean = false): AppFeature[] => {
  const featureIdent = rootFeature.toUpperCase() as FeatureIdent
  const dependentFeatures: AppFeature[] = []
  new AppFeatures().getFeatures().forEach(appFeature => {
    if (appFeature.requires.findIndex((r: FeatureIdent) => r === featureIdent && (onlyActive ? isActive(appFeature) : true)) >= 0) {
      dependentFeatures.push(appFeature)
    }
  })
  return dependentFeatures
}

const isActive = (f: AppFeature) => usePermissionsStore().hasFeature(f.ident)


</script>

