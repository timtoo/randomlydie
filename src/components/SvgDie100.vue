<!-- Display a 100-sided die face as SVG (regular hexagon) -->
<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'SvgDie100',
  props: {
    value: { type: Number, default: 0 },
    strokeWidth: { type: Number, default: 1.3 },
  },
});
</script>

<template>
  <svg viewBox="8 8 84 84" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="die100-desc">
    <desc id="die100-desc">Hundred-sided die showing {{ value }}</desc>
    <g :stroke-width="strokeWidth">
      <!--
        D100 face: a regular hexagon.
        Corners rounded with r≈4.
        Even values: flat top/bottom. Odd values: rotated 30°.
        Scaled to match d12/d20 size, with padding for rotation.
      -->
      <path
        d="M 72,16 L 88,44 Q 90,50 88,56 L 72,84 Q 68,88 62,88 L 38,88 Q 32,88 28,84 L 12,56 Q 10,50 12,44 L 28,16 Q 32,12 38,12 L 62,12 Q 68,12 72,16 Z"
        fill="#fff"
        stroke="#000"
        stroke-linejoin="round"
        :transform="value % 2 === 1 ? 'rotate(30, 50, 50)' : ''"
      />
      <text
        x="50"
        y="50"
        text-anchor="middle"
        dominant-baseline="central"
        font-family="sans-serif"
        font-weight="bold"
        :font-size="value >= 10 ? '26' : '33'"
        fill="#282828"
      >
        {{ value }}
      </text>
    </g>
  </svg>
</template>
