<script lang="ts">
import { defineComponent, ref, watch } from 'vue';
import { Die } from 'src/lib/die';
import AdvancedForm from 'components/AdvancedForm.vue';

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

    watch(() => props.modelValue, (v) => { localOpen.value = v; });
    watch(localOpen, (v) => { ctx.emit('update:modelValue', v); });

    return { localOpen };
  },
});
</script>

<template>
  <q-dialog v-model="localOpen">
    <q-card style="min-width: 320px; max-width: 90vw">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">Generator Settings</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup aria-label="Close settings dialog" />
      </q-card-section>
      <q-card-section>
        <AdvancedForm
          :die="die"
          :watchmin="die.min"
          :watchmax="die.max"
          :mode="mode"
          @advanced-update="(v:number[]) => $emit('advanced-update', v)"
          @base-toggle="$emit('base-toggle')"
          @exclusive-toggle="$emit('exclusive-toggle')"
          @mode-change="(m:number) => $emit('mode-change', m)"
          @mod-update="(v:number) => $emit('mod-update', v)"
        ></AdvancedForm>
      </q-card-section>
      <q-card-actions align="center" class="q-px-md q-pb-md q-gutter-sm">
        <q-btn label="Clear history" color="primary" outline @click="$emit('clear-history')" />
        <q-btn label="Close" color="primary" style="min-width: 120px" @click="$emit('close'); localOpen = false" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>
