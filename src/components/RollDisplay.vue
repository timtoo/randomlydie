<script lang="ts">
import { computed, defineComponent, ref, PropType } from 'vue';
import { onLongPress } from '@vueuse/core';
import { useQuasar, copyToClipboard } from 'quasar';
import { rollHistoryType } from 'components/models';
import { MODE_ID } from 'src/lib/modes';
import SvgDie6 from 'components/SvgDie6.vue';
import SvgDie10 from 'components/SvgDie10.vue';
import SvgDie12 from 'components/SvgDie12.vue';
import SvgDie20 from 'components/SvgDie20.vue';
import SvgDie100 from 'components/SvgDie100.vue';

export default defineComponent({
  name: 'RollDisplay',
  props: {
    value: { type: Number, default: 0 },
    display: String,
    roll: { type: Object as PropType<rollHistoryType | null>, default: null },
    index: { type: Number, default: 0 },
  },
  components: { SvgDie6, SvgDie10, SvgDie12, SvgDie20, SvgDie100 },
  emits: ['onRollDisplayClick'],
  setup(props) {
    const $q = useQuasar();
    const btn_ref = ref<HTMLElement | null>(null);
    const inLongPress = ref(false);
    const ttopen = ref(false);
    let padding = '1em 4em 1em 4em';

    const displayValue = computed(() => {
      if (props.roll && props.roll.mode === MODE_ID.dice)
        padding = '1em 1em 1em 1em';
      return props.display;
    });

    function handleLongPress() {
      inLongPress.value = true;
      if (props.roll) {
        const data = props.roll.display;
        copyToClipboard(data)
          .then(() => {
            $q.notify({
              message: 'Copied "' + data + '" to clipboard!',
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
    }

    onLongPress(btn_ref, handleLongPress, {
      delay: 1000,
      modifiers: { stop: true, prevent: true },
    });

    return {
      btn_ref,
      displayValue,
      handleLongPress,
      inLongPress,
      MODE_ID,
      padding,
      ttopen,
    };
  },
});
</script>

<template>
  <q-btn
    ref="btn_ref"
    unelevated
    :outline="roll?.mode !== MODE_ID.dice"
    @click="inLongPress ? (inLongPress = false) : $emit('onRollDisplayClick')"
    class="q-pa-lg rr-big-btn"
    :class="roll?.die.getThrow().length === 1 ? 'text-h2' : 'text-h3'"
    style="min-height: 9rem; border-radius: 1rem"
  >
    <template v-if="roll && roll.mode === MODE_ID.dice && roll.die.max <= 9">
      <SvgDie6
        height="6rem"
        :value="value"
        :alt="value + ' die'"
        :style="{ transform: 'rotate(' + (Math.random() * 90 - 45) + 'deg)' }"
      ></SvgDie6>
    </template>
    <template v-else-if="roll && roll.mode === MODE_ID.dice && roll.die.max === 10">
      <SvgDie10
        height="6rem"
        :value="value"
        :alt="value + ' die'"
        :style="{ transform: 'rotate(' + (Math.random() * 60 - 30) + 'deg)' }"
      ></SvgDie10>
    </template>
    <template v-else-if="roll && roll.mode === MODE_ID.dice && roll.die.max === 12">
      <SvgDie12
        height="6rem"
        :value="value"
        :alt="value + ' die'"
        :style="{ transform: 'rotate(' + (Math.random() * 60 - 30) + 'deg)' }"
      ></SvgDie12>
    </template>
    <template v-else-if="roll && roll.mode === MODE_ID.dice && roll.die.max === 20">
      <SvgDie20
        height="6rem"
        :value="value"
        :alt="value + ' die'"
        :style="{ transform: 'rotate(' + (Math.random() * 60 - 30) + 'deg)' }"
      ></SvgDie20>
    </template>
    <template v-else-if="roll && roll.mode === MODE_ID.dice && roll.die.max === 100">
      <SvgDie100
        height="6rem"
        :value="value"
        :alt="value + ' die'"
        :style="{ transform: 'rotate(' + (Math.random() * 60 - 30) + 'deg)' }"
      ></SvgDie100>
    </template>
    <template v-else>
      <span v-html="displayValue"></span>
    </template>
  </q-btn>
</template>

<style lang="scss">
.rr-big-btn {
  color: var(--rr-text);
  min-width: 2.6em;
  text-transform: none;
}
</style>
