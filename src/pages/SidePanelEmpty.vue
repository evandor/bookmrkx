<template>
  <q-page>

      <q-splitter class="window-height" style="position:absolute"
        v-model="splitterModel"
        horizontal
        unit="px"
        reverse>

        <template v-slot:before>
          <div class="q-pa-md">
            <div class="text-h4 q-mb-md">Before</div>
            <div v-for="n in 13" :key="n" class="q-my-md">{{ n }}. Lorem ipsum dolor sit, amet consectetur adipisicing elit. Quis praesentium cumque magnam odio iure quidem, quod illum numquam possimus obcaecati commodi minima assumenda consectetur culpa fuga nulla ullam. In, libero.</div>
          </div>
        </template>

        <template v-slot:after>
          <div class="q-pa-md">
            <div class="text-h4 q-mb-md">After</div>
            <div v-for="n in 1" :key="n" class="q-my-md">{{ n }}. Lorem ipsum dolor sit, amet consectetur adipisicing elit. Quis praesentium cumque magnam odio iure quidem, quod illum numquam possimus obcaecati commodi minima assumenda consectetur culpa fuga nulla ullam. In, libero.</div>
          </div>
        </template>

      </q-splitter>

  </q-page>
</template>

<script lang="ts" setup>

import {ref} from "vue";

const splitterModel = ref(300)

</script>
<!--<script>-->
<!--const maxSize = 10-->
<!--const heavyList = []-->

<!--for (let i = 0; i < maxSize; i++) {-->
<!--  heavyList.push({-->
<!--    label: 'Option ' + (i + 1)-->
<!--  })-->
<!--}-->

<!--export default {-->
<!--  setup() {-->
<!--    return {-->
<!--      heavyList-->
<!--    }-->
<!--  }-->
<!--}-->
<!--</script>-->
