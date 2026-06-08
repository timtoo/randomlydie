<script lang="ts">
import { defineComponent, ref, watch, computed } from 'vue';
import { Die } from 'src/lib/die';
import { MODE, MODE_ID } from 'src/lib/modes';
import InputNumber from 'src/components/InputNumber.vue';
import { onKeyStroke } from '@vueuse/core';

export default defineComponent({
  props: {
    die: {
      type: Die,
      required: true,
    },
    mode: {
      type: Number,
      required: true,
    },
    watchmin: Number,
    watchmax: Number,
    ignore_hotkeys: { type: Boolean, default: true },
    afrender: Number,
  },
  emits: [
    'advanced-update',
    'input',
    'base-toggle',
    'exclusive-toggle',
    'mode-change',
  ],
  components: { InputNumber },
  setup(props, ctx) {
    const min = ref(props.die.min);
    const max = ref(props.die.max);
    const dice = ref(props.die.dice);
    const modeDropdownOpen = ref(false);

    const isSetBasedMode = computed(() => {
      return props.mode === MODE_ID.emoji || props.mode === MODE_ID.games;
    });

    const notationDisplay = computed(() => {
      return props.die.toString();
    });

    watch(
      () => props.die,
      () => {
        min.value = props.die.min;
        max.value = props.die.max;
        dice.value = props.die.dice;
      }
    );

    function handleMinMaxDice(v: string) {
      if (v === 'min') {
        if (min.value < 0) min.value = 0;
        if (min.value >= max.value) min.value = max.value - 1;
        ctx.emit('input', min.value, v);
      } else if (v === 'max') {
        if (max.value <= min.value) max.value = min.value + 1;
        ctx.emit('input', max.value, v);
      } else if (v === 'dice') {
        if (dice.value < 1) dice.value = 1;
        if (dice.value > 10) dice.value = 10;
        ctx.emit('input', dice.value, v);
      }
      ctx.emit('advanced-update', [min.value, max.value, dice.value]);
    }

    onKeyStroke('d', () => {
      if (!props.ignore_hotkeys) {
        dice.value = dice.value + 1;
        handleMinMaxDice('dice');
      }
    });
    onKeyStroke('D', () => {
      if (!props.ignore_hotkeys) {
        dice.value = dice.value - 1;
        handleMinMaxDice('dice');
      }
    });
    onKeyStroke('x', () => {
      if (!props.ignore_hotkeys && !isSetBasedMode.value) {
        max.value = max.value + 1;
        handleMinMaxDice('max');
      }
    });
    onKeyStroke('X', () => {
      if (!props.ignore_hotkeys && !isSetBasedMode.value) {
        max.value = max.value - 1;
        handleMinMaxDice('max');
      }
    });
    onKeyStroke('n', () => {
      if (!props.ignore_hotkeys && !isSetBasedMode.value) {
        min.value = min.value + 1;
        handleMinMaxDice('min');
      }
    });
    onKeyStroke('N', () => {
      if (!props.ignore_hotkeys && !isSetBasedMode.value) {
        min.value = min.value - 1;
        handleMinMaxDice('min');
      }
    });

    return { min, max, dice, MODE, MODE_ID, handleMinMaxDice, modeDropdownOpen, isSetBasedMode, notationDisplay };
  },
});
</script>

<template>
  <div class="q-gutter-y-md">
    <div class="text-center text-caption text-grey-7" style="font-family: monospace; letter-spacing: 0.05em;">
      {{ notationDisplay }}
    </div>
    <div class="row q-col-gutter-sm">
      <div class="col-6">
        <label id="min-label" class="sr-only">Minimum value</label>
        <InputNumber
          dense
          v-model="min"
          input-class="text-rrinput text-rrinput-center"
          class="bg-rrinput"
          label-color="primary"
          @update:model-value="handleMinMaxDice('min')"
          :min="0"
          :max="max - 1"
          :disable="isSetBasedMode"
          aria-labelledby="min-label"
        ></InputNumber>
      </div>
      <div class="col-6">
        <label id="max-label" class="sr-only">Maximum value</label>
        <InputNumber
          dense
          v-model="max"
          input-class="text-rrinput text-rrinput-center"
          class="bg-rrinput"
          label-color="primary"
          @update:model-value="handleMinMaxDice('max')"
          :min="min + 1"
          :disable="isSetBasedMode"
          aria-labelledby="max-label"
        ></InputNumber>
      </div>
    </div>
    <div>
      <label id="dice-label" class="sr-only">Number of dice</label>
      <InputNumber
        dense
        v-model="dice"
        input-class="text-rrinput text-rrinput-center"
        class="bg-rrinput full-width"
        label-color="primary"
        @update:model-value="handleMinMaxDice('dice')"
        :min="1"
        :max="10"
        aria-labelledby="dice-label"
      ></InputNumber>
    </div>
    <div>
      <label id="mode-label" class="sr-only">Generator mode</label>
      <q-btn-dropdown
        v-model="modeDropdownOpen"
        class="full-width"
        dense
        outline
        no-caps
        color="primary"
        :label="MODE[mode].name"
        :icon="MODE[mode].material_icon"
        aria-haspopup="listbox"
        :aria-expanded="modeDropdownOpen"
        aria-labelledby="mode-label"
      >
        <q-list bordered dense class="bg-rrinput" role="listbox" aria-label="Select generator mode">
          <template
            v-for="m of Object.values(MODE)
              .sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0))
              .map((m) => m.id)"
            :key="m"
          >
            <q-item clickable @click="modeDropdownOpen = false; $emit('mode-change', m)" role="option" :aria-selected="mode === m">
              <q-item-section>
                <q-item-label>
                  <q-icon :name="MODE[m].material_icon"></q-icon>&nbsp;&nbsp;{{ MODE[m].name }}
                </q-item-label>
              </q-item-section>
            </q-item>
          </template>
        </q-list>
      </q-btn-dropdown>
    </div>
    <div class="row q-col-gutter-sm">
      <div class="col-6">
        <q-btn
          dense
          outline
          no-caps
          class="full-width"
          color="primary"
          :class="die.zerobase ? 'rr-active-button' : ''"
          @click="$emit('base-toggle')"
          :aria-pressed="die.zerobase"
          :disable="isSetBasedMode"
        >
          {{ die.zerobase ? 'Zero-based' : 'One-based' }}
        </q-btn>
      </div>
      <div class="col-6">
        <q-btn
          dense
          outline
          no-caps
          class="full-width"
          color="primary"
          :class="die.exclusive ? 'rr-active-button' : ''"
          @click="$emit('exclusive-toggle')"
          :aria-pressed="die.exclusive"
          :disable="isSetBasedMode"
        >
          {{ die.exclusive ? 'Exclusive' : 'Inclusive' }}
        </q-btn>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.rr-active-button {
  color: $text-default !important;
}

body.body--light .rr-active-button {
  color: var(--rr-text) !important;
  background: rgba($primary, 0.12);
}

.q-field__label {
  text-align: center;
  width: 100%;
}
</style>
