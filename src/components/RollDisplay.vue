<script lang="ts">
import { computed, defineComponent, ref, PropType } from 'vue';
import { onLongPress } from '@vueuse/core';
import { useQuasar, copyToClipboard } from 'quasar';
import { rollHistoryType } from 'src/lib/models';
import { Die } from 'src/lib/die';
import { MODE, MODE_ID } from 'src/lib/modes';
import SvgDie6 from 'components/SvgDie6.vue';
import SvgDie8 from 'components/SvgDie8.vue';
import SvgDie10 from 'components/SvgDie10.vue';
import SvgDie12 from 'components/SvgDie12.vue';
import SvgDie20 from 'components/SvgDie20.vue';
import SvgDie30 from 'components/SvgDie30.vue';
import SvgDie100 from 'components/SvgDie100.vue';

export default defineComponent({
  name: 'RollDisplay',
  props: {
    value: { type: Number, default: 0 },
    display: String,
    roll: { type: Object as PropType<rollHistoryType | null>, default: null },
    die: { type: Object as PropType<Die | null>, default: null },
    mode: { type: Number, default: undefined },
    index: { type: Number, default: 0 },
    sparkle: { type: Boolean, default: false },
    scale: { type: Number, default: 1 },
    combinedMod: { type: Number, default: undefined },
  },
  components: {
    SvgDie6,
    SvgDie8,
    SvgDie10,
    SvgDie12,
    SvgDie20,
    SvgDie30,
    SvgDie100,
  },
  emits: ['onRollDisplayClick'],
  setup(props) {
    const $q = useQuasar();
    const btn_ref = ref<HTMLElement | null>(null);
    const inLongPress = ref(false);
    const ttopen = ref(false);
    let padding = '1em 4em 1em 4em';

    const effectiveDie = computed(() => props.die || props.roll?.die || null);
    const effectiveMode = computed(() =>
      props.mode !== undefined ? props.mode : props.roll?.mode,
    );

    const isMultiplier = computed(() => {
      const die = effectiveDie.value;
      return die
        ? props.index === die.getThrow().length && die.mult !== 1
        : false;
    });

    const isCombinedOperator = computed(
      () =>
        isMultiplier.value &&
        props.combinedMod !== undefined &&
        props.combinedMod !== 0,
    );

    const isModifier = computed(() => {
      const die = effectiveDie.value;
      if (!die || isCombinedOperator.value) return false;
      const multOffset = die.mult !== 1 ? 1 : 0;
      return (
        props.index === die.getThrow().length + multOffset && die.mod !== 0
      );
    });

    const isOperator = computed(() => isMultiplier.value || isModifier.value);

    const isDie = computed(() => {
      return effectiveDie.value
        ? !isMultiplier.value && !isModifier.value
        : false;
    });

    const displayValue = computed(() => {
      const die = effectiveDie.value;
      const modeId = effectiveMode.value;
      if (props.roll && props.roll.mode === MODE_ID.dice)
        padding = '1em 1em 1em 1em';
      if (props.display) return props.display;
      if (!die || modeId === undefined) return props.value.toString();
      const mode = MODE[modeId];
      if (isMultiplier.value) {
        return die.toString_format_mult();
      }
      if (isModifier.value) {
        return die.get_mod_operator() + mode.formatValue(props.value);
      }
      return mode.displayValue(props.value, die.max, die.mod);
    });

    const modDisplayValue = computed(() => {
      const die = effectiveDie.value;
      const modeId = effectiveMode.value;
      if (!die || !isCombinedOperator.value || modeId === undefined) return '';
      const mode = MODE[modeId];
      return die.get_mod_operator() + mode.formatValue(props.combinedMod!);
    });

    const sparkleBg = computed(() => {
      if (!props.sparkle || !props.roll) return undefined;
      const isDark = $q.dark.isActive;
      const h = Math.floor(Math.random() * 360);
      const s = isDark
        ? 60 + Math.floor(Math.random() * 30)
        : 50 + Math.floor(Math.random() * 30);
      const l = isDark
        ? 25 + Math.floor(Math.random() * 20)
        : 70 + Math.floor(Math.random() * 20);
      return `hsl(${h} ${s}% ${l}%) !important`;
    });

    const sparkleGlow = computed(() => {
      if (!props.sparkle || !props.roll) return undefined;
      const isDark = $q.dark.isActive;
      const h = Math.floor(Math.random() * 360);
      const alpha = isDark ? 0.8 : 0.6;
      return `hsla(${h}, 80%, 60%, ${alpha})`;
    });

    const isSingleResult = computed(() => {
      const die = effectiveDie.value;
      return die ? die.getThrow().length === 1 : false;
    });

    const scaledStyle = computed(() => ({
      minHeight: `${9 * props.scale}rem`,
      borderRadius: `${1 * props.scale}rem`,
      padding: `${1.5 * props.scale}rem`,
      fontSize: `${(isSingleResult.value ? 3.75 : 3) * props.scale}rem`,
      backgroundColor: sparkleBg.value,
      '--rr-glow-color': sparkleGlow.value || 'transparent',
    }));

    const svgHeight = computed(() => `${6 * props.scale}rem`);

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
      modDisplayValue,
      isMultiplier,
      isCombinedOperator,
      isModifier,
      isOperator,
      isDie,
      isSingleResult,
      scaledStyle,
      svgHeight,
      sparkleBg,
      sparkleGlow,
      handleLongPress,
      inLongPress,
      MODE_ID,
      effectiveMode,
      effectiveDie,
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
    :outline="effectiveMode !== MODE_ID.dice"
    @click="inLongPress ? (inLongPress = false) : $emit('onRollDisplayClick')"
    class="rr-big-btn"
    :class="[
      isSingleResult ? 'text-h2' : 'text-h3',
      sparkle ? 'rr-sparkle-glow' : '',
      !roll ? 'rr-idle-shake' : '',
      isOperator ? 'rr-operator-display' : '',
    ]"
    :style="scaledStyle"
    :aria-label="roll ? 'Random result: ' + displayValue : 'Tap to roll'"
  >
    <template
      v-if="
        effectiveMode === MODE_ID.dice &&
        isDie &&
        effectiveDie &&
        effectiveDie.max === 8
      "
    >
      <SvgDie8
        :height="svgHeight"
        :value="value"
        :alt="value + ' die'"
        :style="{ transform: 'rotate(' + (Math.random() * 90 - 45) + 'deg)' }"
      ></SvgDie8>
    </template>
    <template
      v-else-if="
        effectiveMode === MODE_ID.dice &&
        isDie &&
        effectiveDie &&
        effectiveDie.max <= 9
      "
    >
      <SvgDie6
        :height="svgHeight"
        :value="value"
        :alt="value + ' die'"
        :style="{ transform: 'rotate(' + (Math.random() * 90 - 45) + 'deg)' }"
      ></SvgDie6>
    </template>
    <template
      v-else-if="
        effectiveMode === MODE_ID.dice &&
        isDie &&
        effectiveDie &&
        effectiveDie.max === 10
      "
    >
      <SvgDie10
        :height="svgHeight"
        :value="value"
        :alt="value + ' die'"
        :style="{ transform: 'rotate(' + (Math.random() * 60 - 30) + 'deg)' }"
      ></SvgDie10>
    </template>
    <template
      v-else-if="
        effectiveMode === MODE_ID.dice &&
        isDie &&
        effectiveDie &&
        effectiveDie.max === 12
      "
    >
      <SvgDie12
        :height="svgHeight"
        :value="value"
        :alt="value + ' die'"
        :style="{ transform: 'rotate(' + (Math.random() * 60 - 30) + 'deg)' }"
      ></SvgDie12>
    </template>
    <template
      v-else-if="
        effectiveMode === MODE_ID.dice &&
        isDie &&
        effectiveDie &&
        effectiveDie.max === 20
      "
    >
      <SvgDie20
        :height="svgHeight"
        :value="value"
        :alt="value + ' die'"
        :style="{ transform: 'rotate(' + (Math.random() * 60 - 30) + 'deg)' }"
      ></SvgDie20>
    </template>
    <template
      v-else-if="
        effectiveMode === MODE_ID.dice &&
        isDie &&
        effectiveDie &&
        effectiveDie.max === 30
      "
    >
      <SvgDie30
        :height="svgHeight"
        :value="value"
        :alt="value + ' die'"
        :style="{ transform: 'rotate(' + (Math.random() * 60 - 30) + 'deg)' }"
      ></SvgDie30>
    </template>
    <template
      v-else-if="
        effectiveMode === MODE_ID.dice &&
        isDie &&
        effectiveDie &&
        effectiveDie.max === 100
      "
    >
      <SvgDie100
        :height="svgHeight"
        :value="value"
        :alt="value + ' die'"
        :style="{ transform: 'rotate(' + (Math.random() * 60 - 30) + 'deg)' }"
      ></SvgDie100>
    </template>
    <template v-else-if="isCombinedOperator">
      <div class="rr-combined-operator">
        <span v-html="displayValue"></span><br />
        <span>{{ modDisplayValue }}</span>
      </div>
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
  height: 2.6em;
  text-transform: none;
}
.rr-combined-operator {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  line-height: 1;
  font-size: 75%;
}
</style>
