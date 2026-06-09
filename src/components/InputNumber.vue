<script lang="ts">
import { watch, defineComponent, ref } from 'vue';

function toNumber(v: string): number {
  let result = parseInt(v) || 0;
  return result;
}

export default defineComponent({
  name: 'InputNumber',
  props: {
    dense: {
      type: Boolean,
      default: false,
    },
    modelValue: {
      type: Number,
      required: false,
    },
    min: {
      type: Number,
    },
    max: {
      type: Number,
    },
  },
  emits: ['update:modelValue'],
  setup(props, ctx) {
    // the converting string/int all over the place is a mess....
    // just can't be bothered to stort it out.
    const localValue = ref((props.modelValue || 0).toString());

    // doing anything?
    watch(
      () => props.modelValue,
      (n) => {
        if (n === undefined) {
          localValue.value = '0';
        } else {
          localValue.value = n.toString();
        }
        console.log('InputNumber watched');
      }
    );

    function onDecrement() {
      let v = toNumber(localValue.value);
      if (props.min === undefined || v > props.min) {
        v--;
        emitUpdate(v.toString());
      }
    }

    function onIncrement() {
      let v = toNumber(localValue.value);
      if (props.max === undefined || v < props.max) {
        v++;
        emitUpdate(v.toString());
      }
    }

    function emitUpdate(v?: string) {
      if (v !== undefined) {
        let n = toNumber(v);
        if (props.min !== undefined && n < props.min) n = props.min;
        if (props.max !== undefined && n > props.max) n = props.max;
        localValue.value = n.toString();
      }
      ctx.emit('update:modelValue', toNumber(localValue.value));
    }

    return { localValue, onIncrement, onDecrement, emitUpdate };
  },
});
</script>

<template>
  <q-input
    outlined
    style="max-width: 10em"
    :model-value="localValue"
    :min="min"
    :max="max"
    @update:model-value="(v) => emitUpdate(v as string)"
    :dense="dense"
    inputmode="numeric"
    aria-live="polite"
  >
    <template v-slot:prepend>
      <q-btn
        round
        flat
        color="primary"
        icon="remove"
        :dense="dense"
        @click="onDecrement"
        aria-label="Decrease"
      />
    </template>
    <template v-slot:append>
      <q-btn
        round
        flat
        color="primary"
        icon="add"
        :dense="dense"
        @click="onIncrement"
        aria-label="Increase"
      />
    </template>
  </q-input>
</template>
