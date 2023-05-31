<template>
  <VueJsonPretty
      :class="{'fixed':fixed}"
      class="bottom-0 right-0 left-0 overflow-auto max-h-150 whitespace-pre bg-dark-500 z-100 text-white"
      :data="data"
      :deep="2"
      :showLength="true"
      :showLineNumber="true"
      :showIcon="true"
      :virtual="false"
  />
</template>

<script setup>
defineProps({
  data: {
    type: [Number, Object, Array, String, Boolean],
    default: 'none'
  },
  fixed: {
    type: Boolean,
    default: true
  }
})
</script>