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
import SvgDie30 from 'components/SvgDie30.vue';
import SvgDie100 from 'components/SvgDie100.vue';

export default defineComponent({
  name: 'RollDisplay',
  props: {
    value: { type: Number, default: 0 },
    display: String,
    roll: { type: Object as PropType<rollHistoryType | null>, default: null },
    index: { type: Number, default: 0 },
    sparkle: { type: Boolean, default: false },
  },
  components: { SvgDie6, SvgDie10, SvgDie12, SvgDie20, SvgDie30, SvgDie100 },
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

    const sparkleBg = computed(() => {
      if (!props.sparkle || !props.roll) return undefined;
      const isDark = $q.dark.isActive;
      const h = Math.floor(Math.random() * 360);
      const s = isDark ? 60 + Math.floor(Math.random() * 30) : 50 + Math.floor(Math.random() * 30);
      const l = isDark ? 25 + Math.floor(Math.random() * 20) : 70 + Math.floor(Math.random() * 20);
      return `hsl(${h} ${s}% ${l}%) !important`;
    });

    const sparkleGlow = computed(() => {
      if (!props.sparkle || !props.roll) return undefined;
      const isDark = $q.dark.isActive;
      const h = Math.floor(Math.random() * 360);
      const alpha = isDark ? 0.8 : 0.6;
      return `hsla(${h}, 80%, 60%, ${alpha})`;
    });

    const sparkleEmojis = computed(() => {
      if (!props.sparkle || !props.roll) return [];
      const emojis = ['✨', '🎲', '🌈', '🔥', '⭐', '🎉', '💫', '🌟', '👏', '🐕', '🐈', '🐋', '🌸', '😊', '🦄', '🍀', '🌺', '🎈', '🌙', '☀️'];
      const count = 2 + Math.floor(Math.random() * 4);
      const result = [];
      for (let i = 0; i < count; i++) {
        result.push(emojis[Math.floor(Math.random() * emojis.length)]);
      }
      return result;
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
      sparkleBg,
      sparkleGlow,
      sparkleEmojis,
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
    :class="[roll?.die.getThrow().length === 1 ? 'text-h2' : 'text-h3', sparkle ? 'rr-sparkle-glow' : '']"
    :style="{ minHeight: '9rem', borderRadius: '1rem', backgroundColor: sparkleBg, '--rr-glow-color': sparkleGlow || 'transparent' }"
    :aria-label="roll ? 'Random result: ' + displayValue : 'Tap to roll'"
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
    <template v-else-if="roll && roll.mode === MODE_ID.dice && roll.die.max === 30">
      <SvgDie30
        height="6rem"
        :value="value"
        :alt="value + ' die'"
        :style="{ transform: 'rotate(' + (Math.random() * 60 - 30) + 'deg)' }"
      ></SvgDie30>
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
    <!-- sparkle emojis - disabled for now
    <template v-for="(emoji, idx) in sparkleEmojis" :key="idx">
      <div
        class="rr-sparkle-emoji"
        :style="{
          left: (35 + Math.random() * 30) + '%',
          top: (35 + Math.random() * 30) + '%',
          '--rr-float-x': (Math.random() * 10 - 5) + 'rem',
          '--rr-float-y': (Math.random() * 10 - 5) + 'rem',
          animationDelay: (Math.random() * 0.3) + 's'
        }"
      >
        {{ emoji }}
      </div>
    </template>
    -->
  </q-btn>
</template>

<style lang="scss">
.rr-big-btn {
  color: var(--rr-text);
  min-width: 2.6em;
  text-transform: none;
}
</style>
