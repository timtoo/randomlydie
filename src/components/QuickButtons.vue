<script lang="ts">
import { defineComponent, computed } from 'vue';

import { MODE_ID, MODE } from 'src/lib/modes';

export default defineComponent({
  name: 'QuickButtons',
  props: {
    label: {
      type: String,
      default: '',
    },
    mode: {
      type: Number,
      required: true,
    },
    current: {
      type: Number,
      default: 0,
    },
  },
  emits: ['onQuickButton'],
  setup(props) {
    const button_set = computed(() =>
      MODE[props.mode].quick.map((v, i) => [v, MODE[props.mode].quick_label[i]])
    );
    return { button_set, MODE: MODE_ID };
  },
});
</script>

<template>
  <template v-if="button_set">
    <div class="row justify-center q-py-sm" style="flex-wrap: wrap">
      <template v-for="v in button_set" :key="v[0]">
        <q-btn
          unelevated
          rounded
          no-caps
          @click="$emit('onQuickButton', v[0])"
          class="rr-qb text-body1"
          :class="{ 'rr-qb-selected': current === v[0] }"
        >
          {{ v[1] }}
        </q-btn>
      </template>
    </div>
  </template>
</template>
