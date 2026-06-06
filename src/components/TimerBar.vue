<script setup lang='ts'>
import { defineProps, defineEmits, watch, ref } from 'vue';
import { QAjaxBar } from 'quasar';

interface PropsInterface {
  active: boolean;
  duration: number; // milliseconds
}

const props = defineProps<PropsInterface>();
const emit = defineEmits({
  timeout: null,
});

const bar = ref<QAjaxBar | null>(null);
let delay = props.duration / 100.0;
let interval_id: ReturnType<typeof setInterval>;
let timeout_id: ReturnType<typeof setTimeout>;

watch(
  () => props.active,
  () => activeChange()
);

function updateProgress() {
  bar.value?.increment(1);
}

function timeoutReached() {
  clearInterval(interval_id);
  bar.value?.stop();
  emit('timeout');
  activeChange();
}

function activeChange() {
  if (bar.value) {
    if (props.active) {
      bar.value.start(0);
      delay = props.duration / 100.0;
      interval_id = setInterval(updateProgress, delay);
      timeout_id = setTimeout(timeoutReached, props.duration);
    } else {
      clearInterval(interval_id);
      clearTimeout(timeout_id);
      bar.value.stop();
      console.log('timer stopping')
    }
  }
}
</script>

<template>
  <q-ajax-bar
    ref='bar'
    position='top'
    color='primary'
    size='5px'
    skip-hijack
  />
</template>
