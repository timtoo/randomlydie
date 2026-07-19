<!-- Display list of previous roll results, as a string. -->
<script lang="ts">
import {
  defineComponent,
  computed,
  PropType,
  ref,
  onMounted,
  watch,
  nextTick,
} from 'vue';
import { useQuasar, copyToClipboard } from 'quasar';
import { rollHistoryType } from 'src/lib/models';
import { MODE } from 'src/lib/modes';
import { Die } from 'src/lib/die';

const MULTI_VALUE_SEPARATOR = '·';

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
    const scrollRef = ref<HTMLDivElement | null>(null);
    const canScrollLeft = ref(false);
    const canScrollRight = ref(false);

    function formatMultiRepeat(die: Die, mode: number): string {
      const modeObj = MODE[mode];
      const repeatCount = die.repeat || 1;
      if (repeatCount <= 1) {
        return modeObj.displayMulti(die as never);
      }
      const separator = modeObj.number_base ? '+' : MULTI_VALUE_SEPARATOR;
      const displays: string[] = [];
      for (let r = 1; r <= repeatCount; r++) {
        const throwValues = die.getThrow(r);
        displays.push(
          throwValues
            .map((v) => modeObj.historyValue(v, die.max, die.mod))
            .join(separator),
        );
      }
      let result = displays.join(',');
      if (modeObj.number_base && die.mult !== 1) {
        result =
          '(' +
          result +
          ')' +
          die.get_mult_operator() +
          modeObj.formatValue(die.get_mult_value());
      }
      if (modeObj.number_base && die.mod !== 0) {
        if (die.mult !== 1) {
          result += die.get_mod_operator() + modeObj.formatValue(die.mod);
        } else {
          result =
            '(' +
            result +
            ')' +
            die.get_mod_operator() +
            modeObj.formatValue(die.mod);
        }
      }
      return result;
    }

    function formatMultiRoll(roll: rollHistoryType): string {
      if (!roll.isMulti) {
        return formatMultiRepeat(roll.die, roll.mode);
      }

      const numericEntries = roll.dice.filter(
        ({ die, mode }) => MODE[mode].number_base !== 0,
      );
      if (numericEntries.length > 0) {
        const grandTotal = numericEntries.reduce(
          (sum, { die }) => sum + die.getResult(),
          0,
        );
        const subtotals = numericEntries.map(({ die, mode }) =>
          MODE[mode].historyValue(die.getResult(), die.max, die.mod),
        );
        return `${grandTotal.toLocaleString()} (${subtotals.join(' + ')})`;
      }

      // Non-numeric multi-roll: concatenate individual values
      const values: string[] = [];
      for (const { die, mode } of roll.dice) {
        const modeObj = MODE[mode];
        const repeatCount = die.repeat || 1;
        for (let r = 1; r <= repeatCount; r++) {
          const throwValues = die.getThrow(r);
          for (const v of throwValues) {
            values.push(modeObj.historyValue(v, die.max, die.mod));
          }
        }
      }
      return values.join(MULTI_VALUE_SEPARATOR);
    }

    const previousRolls = computed((): { text: string; html: string }[] => {
      const result: { text: string; html: string }[] = [];
      for (const r of props.rolls.slice(
        props.skip,
        props.limit + 1 + props.skip,
      )) {
        const display = formatMultiRoll(r);
        result.push({
          text: display,
          html: display,
        });
      }
      return result;
    });

    const fullString = computed(() =>
      previousRolls.value.map((r) => r.text).join(' … '),
    );

    function updateScrollState() {
      const el = scrollRef.value;
      if (!el) return;
      canScrollLeft.value = el.scrollLeft > 0;
      canScrollRight.value =
        el.scrollLeft < el.scrollWidth - el.clientWidth - 1;
    }

    function scrollLeft() {
      scrollRef.value?.scrollBy({ left: -100, behavior: 'smooth' });
    }

    function scrollRight() {
      scrollRef.value?.scrollBy({ left: 100, behavior: 'smooth' });
    }

    function scrollToStart() {
      scrollRef.value?.scrollTo({ left: 0, behavior: 'smooth' });
    }

    function scrollToEnd() {
      const el = scrollRef.value;
      if (el) el.scrollTo({ left: el.scrollWidth, behavior: 'smooth' });
    }

    onMounted(() => {
      updateScrollState();
      scrollRef.value?.addEventListener('scroll', updateScrollState, {
        passive: true,
      });
    });

    watch(previousRolls, () => {
      nextTick(updateScrollState);
    });

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

    return {
      previousRolls,
      fullString,
      copySingle,
      copyAll,
      scrollRef,
      canScrollLeft,
      canScrollRight,
      scrollLeft,
      scrollRight,
      scrollToStart,
      scrollToEnd,
    };
  },
});
</script>

<template>
  <div v-if="previousRolls.length" class="row items-center no-wrap">
    <q-btn
      v-if="canScrollLeft"
      flat
      dense
      round
      icon="skip_previous"
      color="primary"
      @click="scrollToStart"
      class="q-mr-xs"
      aria-label="Skip to start of previous rolls"
    />
    <q-btn
      v-if="canScrollLeft"
      flat
      dense
      round
      icon="chevron_left"
      color="primary"
      @click="scrollLeft"
      class="q-mr-xs"
      aria-label="Scroll previous rolls left"
    />
    <div ref="scrollRef" class="col rr-pr-scroll">
      <span
        class="rr-pr-label text-body1 cursor-pointer"
        tabindex="0"
        role="button"
        :aria-label="'Copy all ' + label + ' to clipboard'"
        @click="copyAll"
        @keydown.enter="copyAll"
        @keydown.space.prevent="copyAll"
        >{{ label }}</span
      >
      <span class="rr-pr-text">
        <template v-for="(r, idx) in previousRolls" :key="idx">
          <span
            class="cursor-pointer"
            tabindex="0"
            role="button"
            :aria-label="'Copy ' + r.text + ' to clipboard'"
            @click="copySingle(r.text)"
            @keydown.enter="copySingle(r.text)"
            @keydown.space.prevent="copySingle(r.text)"
            >{{ r.text }}</span
          >
          <span v-if="idx < previousRolls.length - 1" class="rr-pr-sep">
            …
          </span>
        </template>
      </span>
    </div>
    <q-btn
      v-if="canScrollRight"
      flat
      dense
      round
      icon="chevron_right"
      color="primary"
      @click="scrollRight"
      class="q-ml-xs"
      aria-label="Scroll previous rolls right"
    />
    <q-btn
      v-if="canScrollRight"
      flat
      dense
      round
      icon="skip_next"
      color="primary"
      @click="scrollToEnd"
      class="q-ml-xs"
      aria-label="Skip to end of previous rolls"
    />
  </div>
  <div
    v-else
    class="text-center text-italic text-body2"
    style="color: var(--rr-text-muted)"
  >
    No rolls yet
  </div>
</template>
