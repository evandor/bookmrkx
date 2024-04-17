<template>
  <q-btn
    :type="props.type"
    padding="xs lg"
    :disable="props.disable"
    @click="emits('wasClicked')"
    align="around"
    size="0.9rem"
    data-testid="addTabsetSubmitBtn"
    :color="props.color"
    :label="props.label"/>
</template>

<script lang="ts" setup>

const emits = defineEmits(['wasClicked'])

const props = defineProps({
  label: {type: String, required: true},
  color: {type: String, default: 'warning'},
  type: {type: String, default: 'button'},
  disable: {type: Boolean, default: false}
})

</script>
