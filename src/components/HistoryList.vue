<script lang="ts">
import { defineComponent, computed, PropType } from 'vue';
import { rollHistoryType } from 'src/lib/models';
import { MODE } from 'src/lib/modes';

const MULTI_ROLL_ICON = 'layers';
const MULTI_ROLL_MODE_NAME = 'Multi';

export default defineComponent({
  name: 'HistoryList',
  props: {
    label: { type: String, default: 'Roll history' },
    rolls: { type: Object as PropType<rollHistoryType[]>, required: true },
    limit: { type: Number, default: 50 },
  },
  emits: ['onDieChip'],
  setup(props) {
    function makeKey(roll: rollHistoryType): string {
      return (roll.isMulti ? 'multi:' : '') + roll.chipLabel + ':' + roll.mode;
    }

    function chipIcon(roll: rollHistoryType): string {
      return roll.isMulti ? MODE[roll.mode].material_icon : MODE[roll.mode].material_icon;
    }

    function chipLabel(roll: rollHistoryType): string {
      return roll.isMulti ? roll.chipLabel : roll.chipLabel;
    }

    function chipAriaLabel(roll: rollHistoryType): string {
      const modeName = roll.isMulti
        ? MULTI_ROLL_MODE_NAME
        : MODE[roll.mode].name;
      return 'Roll ' + roll.chipLabel + ' in ' + modeName + ' mode';
    }

    const filteredRolls = computed((): rollHistoryType[] => {
      const history: rollHistoryType[] = [];
      const seen = new Set();

      for (const r of props.rolls) {
        const key = makeKey(r);
        if (!seen.has(key)) {
          seen.add(key);
          history.push(r);
          if (history.length === props.limit) break;
        }
      }
      return history;
    });

    const currentKey = computed(() =>
      props.rolls.length > 0 ? makeKey(props.rolls[0]) : '',
    );

    return {
      filteredRolls,
      makeKey,
      chipIcon,
      chipLabel,
      chipAriaLabel,
      currentKey,
      MODE,
    };
  },
});
</script>

<template>
  <div v-if="filteredRolls.length > 0" class="q-gutter-xs row items-center">
    <template v-for="r of filteredRolls" :key="makeKey(r)">
      <q-chip
        dense
        :color="currentKey === makeKey(r) ? 'secondary' : 'primary'"
        clickable
        tabindex="0"
        role="button"
        :aria-label="chipAriaLabel(r)"
        @click="$emit('onDieChip', r)"
        @keydown.enter="$emit('onDieChip', r)"
        @keydown.space.prevent="$emit('onDieChip', r)"
        :icon="chipIcon(r)"
        text-color="white"
        >{{ chipLabel(r) }}</q-chip
      >
    </template>
  </div>
  <div
    v-else
    class="text-center text-italic text-body2"
    style="color: var(--rr-text-muted)"
  >
    No history yet
  </div>
</template>
