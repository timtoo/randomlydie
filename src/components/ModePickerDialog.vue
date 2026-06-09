<script lang="ts">
import { defineComponent, ref, watch, computed } from 'vue';
import { MODE } from 'src/lib/modes';

export default defineComponent({
  name: 'ModePickerDialog',
  props: {
    modelValue: { type: Boolean, default: false },
    mode: { type: Number, required: true },
  },
  emits: ['update:modelValue', 'mode-change'],
  setup(props, ctx) {
    const localOpen = ref(props.modelValue);

    watch(() => props.modelValue, (v) => { localOpen.value = v; });
    watch(localOpen, (v) => { ctx.emit('update:modelValue', v); });

    const sortedModes = computed(() =>
      Object.values(MODE).sort((a, b) =>
        a.name < b.name ? -1 : a.name > b.name ? 1 : 0
      )
    );

    function select(id: number) {
      ctx.emit('mode-change', id);
      localOpen.value = false;
    }

    return { localOpen, sortedModes, select };
  },
});
</script>

<template>
  <q-dialog v-model="localOpen" aria-label="Choose generator mode">
    <q-card style="min-width: 280px; max-width: 90vw">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">Choose Mode</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup aria-label="Close mode picker" />
      </q-card-section>
      <q-card-section>
        <div class="row q-col-gutter-sm">
          <div
            v-for="m in sortedModes"
            :key="m.id"
            class="col-6"
          >
            <q-btn
              outline
              no-caps
              stack
              class="full-width"
              style="min-height: 5rem; border-radius: 0.5rem"
              :color="mode === m.id ? 'secondary' : 'primary'"
              @click="select(m.id)"
              :aria-label="m.name"
              :aria-pressed="mode === m.id"
            >
              <q-icon :name="m.material_icon" size="sm" />
              <div class="text-caption q-mt-xs">{{ m.name }}</div>
            </q-btn>
          </div>
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>
