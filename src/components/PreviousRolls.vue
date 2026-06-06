<!-- Display list of previous roll results, as a string. -->
<script lang="ts">
import { defineComponent, computed, PropType } from 'vue';
import { rollHistoryType } from 'components/models';
import { MODE } from 'src/lib/modes';

export default defineComponent({
  name: 'PreviousRolls',
  props: {
    label: { type: String, default: 'Previous rolls' },
    rolls: { type: Object as PropType<rollHistoryType[]>, required: true },
    limit: { type: Number, default: 50 },
    skip: { type: Number, default: 1 },
  },
  setup(props) {
    const previousRollsString = computed((): string => {
      const result: string[] = [];
      for (const r of props.rolls.slice(
        props.skip,
        props.limit + 1 + props.skip
      )) {
          result.push(MODE[r.mode].displayMulti(r.die));
      }
      return result.join('&hellip; ');
    });

    return { previousRollsString };
  },
});
</script>

<template>
  <div v-if="previousRollsString" class="rr-fade-right overflow-hidden">
    <div style="overflow-x: auto; white-space: nowrap; padding-bottom: 4px; scrollbar-width: none">
      <span class="rr-pr-label text-body1">{{ label }}</span>
      <span class="grad" v-html="previousRollsString"></span>
    </div>
  </div>
  <div v-else class="text-center text-italic text-body2" style="color: var(--rr-text-muted)">
    No rolls yet
  </div>
</template>
