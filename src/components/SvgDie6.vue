<!-- Display a standard 6 sided die as SVG image. Actually handles values 1 to 9 -->
<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'SvgDie6',
  props: {
    value: { type: Number, default: 0 },
    strokeWidth: { type: Number, default: 2 },
    dotRadius: { type: Number, default: 10 },
  },
});
</script>

<template>
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="die6-desc">
    <desc id="die6-desc">Die face showing {{ value }}</desc>
    <g stroke="#000" class="die6">
      <rect
        class="die"
        width="98"
        height="98"
        x="1"
        y="1"
        ry="25"
        :stroke-width="strokeWidth"
      />
      <circle
        class="dot"
        cx="26"
        cy="26"
        :r="dotRadius"
        :stroke-width="strokeWidth"
        v-if="[2, 3, 4, 5, 6, 7, 8, 9].includes(value)"
      />
      <circle
        class="dot"
        cx="50"
        cy="26"
        :r="dotRadius"
        :stroke-width="strokeWidth"
        v-if="[8, 9].includes(value)"
      />
      <circle
        class="dot"
        cx="74"
        cy="26"
        :r="dotRadius"
        :stroke-width="strokeWidth"
        v-if="[4, 5, 6, 7, 8, 9].includes(value)"
      />
      <circle
        class="dot"
        cx="26"
        cy="50"
        :r="dotRadius"
        :stroke-width="strokeWidth"
        v-if="[6, 7, 8, 9].includes(value)"
      />
      <circle
        class="dot"
        cx="50"
        cy="50"
        :r="dotRadius"
        :stroke-width="strokeWidth"
        v-if="[1, 3, 5, 7, 9].includes(value)"
      />
      <circle
        class="dot"
        cx="74"
        cy="50"
        :r="dotRadius"
        :stroke-width="strokeWidth"
        v-if="[6, 7, 8, 9].includes(value)"
      />
      <circle
        class="dot"
        cx="26"
        cy="74"
        :r="dotRadius"
        :stroke-width="strokeWidth"
        v-if="[4, 5, 6, 7, 8, 9].includes(value)"
      />
      <circle
        class="dot"
        cx="50"
        cy="74"
        :r="dotRadius"
        :stroke-width="strokeWidth"
        v-if="[8, 9].includes(value)"
      />
      <circle
        class="dot"
        cx="74"
        cy="74"
        :r="dotRadius"
        :stroke-width="strokeWidth"
        v-if="[2, 3, 4, 5, 6, 7, 8, 9].includes(value)"
      />
    </g>
  </svg>
</template>

<style scoped lang="scss">
.die6 {
  fill: #fff;
  stroke: #000;
  .dot {
    fill: #282828;
  }
}
</style>
