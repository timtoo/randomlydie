<script lang="ts">
import { defineComponent, computed, PropType } from 'vue';
import { rollHistoryType } from 'components/models';
import { MODE } from 'src/lib/modes'

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
      return roll.label + ':' + roll.mode;
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
      props.rolls.length > 0 ? makeKey(props.rolls[0]) : ''
    );

    return { filteredRolls, makeKey, currentKey, MODE };
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
        @click="$emit('onDieChip', r)"
        :icon="MODE[r.mode].material_icon"
        text-color="white"
      >{{ r.label }}</q-chip>
    </template>
  </div>
  <div v-else class="text-center text-italic text-body2" style="color: var(--rr-text-muted)">
    No history yet
  </div>
</template>
