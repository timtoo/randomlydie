<!-- Display list of previous roll results, as a string. -->
<script lang="ts">
import { defineComponent, computed, PropType } from 'vue';
import { useQuasar, copyToClipboard } from 'quasar';
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
    const $q = useQuasar();

    const previousRolls = computed((): { text: string; html: string }[] => {
      const result: { text: string; html: string }[] = [];
      for (const r of props.rolls.slice(
        props.skip,
        props.limit + 1 + props.skip
      )) {
        result.push({
          text: MODE[r.mode].displayMulti(r.die),
          html: MODE[r.mode].displayMulti(r.die),
        });
      }
      return result;
    });

    const fullString = computed(() =>
      previousRolls.value.map((r) => r.text).join(' … ')
    );

    function copySingle(text: string) {
      copyToClipboard(text)
        .then(() => {
          $q.notify({
            message: 'Copied "' + text + '" to clipboard!',
            icon: 'announcement',
            color: 'primary',
            position: 'top',
            textColor: 'background',
          });
        })
        .catch(() => {
          $q.notify({
            message: 'Clipboard failed',
            icon: 'warning',
            color: 'warn',
            position: 'top',
            textColor: 'background',
          });
        });
    }

    function copyAll() {
      if (!fullString.value) return;
      copySingle(fullString.value);
    }

    return { previousRolls, fullString, copySingle, copyAll };
  },
});
</script>

<template>
  <div v-if="previousRolls.length" class="rr-fade-right overflow-hidden">
    <div style="overflow-x: auto; white-space: nowrap; padding-bottom: 4px; scrollbar-width: none">
      <span
        class="rr-pr-label text-body1 cursor-pointer"
        tabindex="0"
        role="button"
        :aria-label="'Copy all ' + label + ' to clipboard'"
        @click="copyAll"
        @keydown.enter="copyAll"
        @keydown.space.prevent="copyAll"
      >{{ label }}</span>
      <span class="grad">
        <template v-for="(r, idx) in previousRolls" :key="idx">
          <span
            class="cursor-pointer"
            tabindex="0"
            role="button"
            :aria-label="'Copy ' + r.text + ' to clipboard'"
            @click="copySingle(r.text)"
            @keydown.enter="copySingle(r.text)"
            @keydown.space.prevent="copySingle(r.text)"
          >{{ r.text }}</span>
          <span v-if="idx < previousRolls.length - 1" style="opacity: 0.6"> … </span>
        </template>
      </span>
    </div>
  </div>
  <div v-else class="text-center text-italic text-body2" style="color: var(--rr-text-muted)">
    No rolls yet
  </div>
</template>
