<script lang="ts">
import { computed, defineComponent, ref, watch } from 'vue';
import { Die } from 'src/lib/die';
import AdvancedForm from 'components/AdvancedForm.vue';
import { useClipboard } from '@vueuse/core';

export default defineComponent({
  name: 'GeneratorSettingsDialog',
  props: {
    modelValue: { type: Boolean, default: false },
    die: { type: Die, required: true },
    mode: { type: Number, required: true },
  },
  emits: ['update:modelValue', 'advanced-update', 'base-toggle', 'exclusive-toggle', 'mode-change', 'mod-update', 'close', 'clear-history'],
  components: { AdvancedForm },
  setup(props, ctx) {
    const localOpen = ref(props.modelValue);

    const notationDisplay = computed(() => {
      return props.die.toString();
    });

    const { copy } = useClipboard();

    function copyNotation() {
      copy(notationDisplay.value);
    }

    watch(() => props.modelValue, (v) => { localOpen.value = v; });
    watch(localOpen, (v) => { ctx.emit('update:modelValue', v); });

    return { localOpen, notationDisplay, copyNotation };

  },

});
</script>

<template>
  <q-dialog v-model="localOpen">
    <q-card style="min-width: 320px; max-width: 90vw">
      <q-card-section class="row items-center q-pb-none">
        <div class="row items-center justify-center q-gutter-x-sm">
          <q-btn dense flat size="sm" icon="content_copy" color="grey-7" @click="copyNotation"
            aria-label="Copy dice notation" />
          <div class="text-h6" style="
          font-family: monospace;
        ">
            {{ notationDisplay }}
          </div>
        </div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup aria-label="Close settings dialog" />
      </q-card-section>
      <q-card-section>
        <AdvancedForm :die="die" :watchmin="die.min" :watchmax="die.max" :mode="mode"
          @advanced-update="(v: number[]) => $emit('advanced-update', v)" @base-toggle="$emit('base-toggle')"
          @exclusive-toggle="$emit('exclusive-toggle')" @mode-change="(m: number) => $emit('mode-change', m)"
          @mod-update="(v: number) => $emit('mod-update', v)"></AdvancedForm>
      </q-card-section>
      <q-card-actions align="center" class="q-px-md q-pb-md q-gutter-sm">
        <q-btn label="Clear history" color="primary" outline @click="$emit('clear-history')" />
        <q-btn label="Close" color="primary" style="min-width: 120px" @click="$emit('close'); localOpen = false" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>
