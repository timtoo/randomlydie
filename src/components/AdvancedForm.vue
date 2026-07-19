<script lang="ts">
import { defineComponent, ref, watch, computed } from 'vue';
import { Die } from 'src/lib/die';
import { MODE, MODE_ID } from 'src/lib/modes';
import InputNumber from 'src/components/InputNumber.vue';
import { onKeyStroke, useClipboard } from '@vueuse/core';

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
    'mod-update',
  ],
  components: { InputNumber },
  setup(props, ctx) {
    const min = ref(props.die.min);
    const max = ref(props.die.max);
    const dice = ref(props.die.dice);
    const repeat = ref(props.die.repeat);
    const mult = ref(props.die.mult);
    const modeDropdownOpen = ref(false);
    const modDropdownOpen = ref(false);

    const isSetBasedMode = computed(() => {
      return (
        props.mode === MODE_ID.emoji ||
        props.mode === MODE_ID.games ||
        props.mode === MODE_ID.note
      );
    });

    const hasModDropdown = computed(() => {
      return (
        props.mode === MODE_ID.emoji ||
        props.mode === MODE_ID.games ||
        props.mode === MODE_ID.note
      );
    });

    const showRawModInput = computed(() => {
      // Only show raw modifier for numerical modes where mod is an arithmetic modifier
      return MODE[props.mode].number_base !== 0 && !hasModDropdown.value;
    });

    const modOptions = computed(() => {
      const mode = MODE[props.mode];
      if (props.mode === MODE_ID.note) {
        // For Note mode, show keys based on current scale size
        const scaleSize = props.die.max;
        return [
          { label: 'C', value: 0 },
          { label: 'D', value: 2 },
          { label: 'E', value: 4 },
          { label: 'F', value: 5 },
          { label: 'G', value: 7 },
          { label: 'A', value: 9 },
          { label: 'B', value: 11 },
          { label: 'C♯/D♭', value: 1 },
          { label: 'D♯/E♭', value: 3 },
          { label: 'F♯/G♭', value: 6 },
          { label: 'G♯/A♭', value: 8 },
          { label: 'A♯/B♭', value: 10 },
        ].map((opt) => ({
          ...opt,
          label:
            scaleSize === 12
              ? opt.label
              : `${opt.label} ${scaleSize === 5 ? 'Pentatonic' : 'Scale'}`,
        }));
      }
      // Emoji / Games: use quick buttons (skip Unicode -2 for emoji dropdown? include it)
      return mode.quick.map((qv, idx) => ({
        label: mode.quick_label[idx],
        value: qv,
      }));
    });

    const currentModLabel = computed(() => {
      const mode = MODE[props.mode];
      if (props.mode === MODE_ID.note) {
        const found = modOptions.value.find((o) => o.value === props.die.mod);
        return found?.label ?? `Key ${props.die.mod}`;
      }
      const qv = mode.getQuickValue(props.die);
      const idx = mode.quick.indexOf(qv);
      return mode.quick_label[idx] ?? `Set ${props.die.mod}`;
    });

    watch(
      () => props.die,
      () => {
        min.value = props.die.min;
        max.value = props.die.max;
        dice.value = props.die.dice;
        repeat.value = props.die.repeat;
        mult.value = props.die.mult;
      },
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
      ctx.emit('advanced-update', [
        min.value,
        max.value,
        dice.value,
        repeat.value,
        mult.value,
      ]);
    }

    function handleRepeatMult(v: string) {
      if (v === 'repeat') {
        if (repeat.value < 1) repeat.value = 1;
        if (repeat.value > 10) repeat.value = 10;
      } else if (v === 'mult') {
        if (mult.value < 1) mult.value = 1;
        if (mult.value > 100) mult.value = 100;
      }
      ctx.emit('advanced-update', [
        min.value,
        max.value,
        dice.value,
        repeat.value,
        mult.value,
      ]);
    }

    function handleModChange(newMod: number) {
      modDropdownOpen.value = false;
      ctx.emit('mod-update', newMod);
    }

    function handleRawModChange(rawMod: number | string | null) {
      const val = typeof rawMod === 'string' ? parseInt(rawMod, 10) : rawMod;
      if (val !== null && !isNaN(val)) {
        ctx.emit('mod-update', val);
      }
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

    return {
      min,
      max,
      dice,
      repeat,
      mult,
      MODE,
      MODE_ID,
      handleMinMaxDice,
      handleRepeatMult,
      modeDropdownOpen,
      modDropdownOpen,
      isSetBasedMode,
      hasModDropdown,
      showRawModInput,
      modOptions,
      currentModLabel,
      handleModChange,
      handleRawModChange,
    };
  },
});
</script>

<template>
  <div class="q-gutter-y-md">
    <div>
      <label id="mode-label" class="sr-only">Generator mode</label>
      <q-btn-dropdown v-model="modeDropdownOpen" class="full-width" dense outline no-caps color="primary"
        :label="MODE[mode].name" :icon="MODE[mode].material_icon" aria-haspopup="listbox"
        :aria-expanded="modeDropdownOpen" aria-labelledby="mode-label">
        <q-list bordered dense class="bg-rrinput" role="listbox" aria-label="Select generator mode">
          <template v-for="m of Object.values(MODE)
            .sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0))
            .map((m) => m.id)" :key="m">
            <q-item clickable @click="
              modeDropdownOpen = false;
            $emit('mode-change', m);
            " role="option" :aria-selected="mode === m">
              <q-item-section>
                <q-item-label>
                  <q-icon :name="MODE[m].material_icon"></q-icon>&nbsp;&nbsp;{{
                    MODE[m].name
                  }}
                </q-item-label>
              </q-item-section>
            </q-item>
          </template>
        </q-list>
      </q-btn-dropdown>
    </div>
    <div v-if="hasModDropdown" class="full-width">
      <label id="mod-select-label" class="sr-only">Set or key selection</label>
      <q-btn-dropdown v-model="modDropdownOpen" class="full-width" dense outline no-caps color="primary"
        :label="currentModLabel" aria-haspopup="listbox" :aria-expanded="modDropdownOpen"
        aria-labelledby="mod-select-label">
        <q-list bordered dense class="bg-rrinput" role="listbox" aria-label="Select set or key">
          <template v-for="opt of modOptions" :key="opt.value">
            <q-item clickable @click="handleModChange(opt.value)" role="option">
              <q-item-section>
                <q-item-label>{{ opt.label }}</q-item-label>
              </q-item-section>
            </q-item>
          </template>
        </q-list>
      </q-btn-dropdown>
    </div>
    <div v-if="!isSetBasedMode" class="row q-col-gutter-sm">
      <div class="col-6">
        <label id="min-label" class="sr-only">Minimum value</label>
        <InputNumber dense v-model="min" input-class="text-rrinput text-rrinput-center" class="bg-rrinput"
          label-color="primary" @update:model-value="handleMinMaxDice('min')" :min="0" :max="max - 1"
          aria-labelledby="min-label"></InputNumber>
      </div>
      <div class="col-6">
        <label id="max-label" class="sr-only">Maximum value</label>
        <InputNumber dense v-model="max" input-class="text-rrinput text-rrinput-center" class="bg-rrinput"
          label-color="primary" @update:model-value="handleMinMaxDice('max')" :min="min + 1"
          aria-labelledby="max-label">
        </InputNumber>
      </div>
    </div>
    <div class="row q-col-gutter-sm">
      <div class="col-6">
        <label id="dice-label" class="sr-only">Number of dice</label>
        <InputNumber dense v-model="dice" input-class="text-rrinput text-rrinput-center" class="bg-rrinput full-width"
          label-color="primary" @update:model-value="handleMinMaxDice('dice')" :min="1" :max="10"
          aria-labelledby="dice-label"></InputNumber>
      </div>
      <div v-if="showRawModInput" class="col-6">
        <label id="mod-label" class="sr-only">Minus/Plus Modifier</label>
        <InputNumber dense :model-value="die.mod" input-class="text-rrinput text-rrinput-center"
          class="bg-rrinput full-width" label-color="primary" @update:model-value="handleRawModChange"
          aria-labelledby="mod-label"></InputNumber>
      </div>
    </div>
    <div v-if="!isSetBasedMode" class="row q-col-gutter-sm">
      <div class="col-6">
        <label id="repeat-label" class="sr-only">Repeats</label>
        <InputNumber dense v-model="repeat" input-class="text-rrinput text-rrinput-center" class="bg-rrinput full-width"
          label-color="primary" @update:model-value="handleRepeatMult('repeat')" :min="1" :max="10"
          aria-labelledby="repeat-label"></InputNumber>
        <div class="text-center text-caption" style="color: var(--rr-text-muted)">
          Repeats
        </div>
      </div>
      <div class="col-6">
        <label id="mult-label" class="sr-only">Multiplier</label>
        <InputNumber dense v-model="mult" input-class="text-rrinput text-rrinput-center" class="bg-rrinput full-width"
          label-color="primary" @update:model-value="handleRepeatMult('mult')" :min="1" :max="100"
          aria-labelledby="mult-label"></InputNumber>
        <div class="text-center text-caption" style="color: var(--rr-text-muted)">
          Multiplier
        </div>
      </div>
    </div>
    <div v-if="!isSetBasedMode" class="row q-col-gutter-sm">
      <div class="col-6">
        <q-btn dense outline no-caps class="full-width" color="primary" :class="die.zerobase ? 'rr-active-button' : ''"
          @click="$emit('base-toggle')" :aria-pressed="die.zerobase">
          {{ die.zerobase ? 'Zero-based' : 'One-based' }}
        </q-btn>
      </div>
      <div class="col-6">
        <q-btn dense outline no-caps class="full-width" color="primary" :class="die.exclusive ? 'rr-active-button' : ''"
          @click="$emit('exclusive-toggle')" :aria-pressed="die.exclusive">
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
