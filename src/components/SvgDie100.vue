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
  <svg viewBox="13 18 74 64" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="die100-desc">
    <desc id="die100-desc">Hundred-sided die showing {{ value }}</desc>
    <g :stroke-width="strokeWidth">
      <!--
        D100 face: a regular hexagon.
        Corners rounded with r≈4.
        Even values: flat top/bottom. Odd values: rotated 30°.
      -->
      <path
        d="M 70.0,23.5 L 83.0,46.5 Q 85,50 83.0,53.5 L 70.0,76.5 Q 68,80 64,80 L 36,80 Q 32,80 30.0,76.5 L 17.0,53.5 Q 15,50 17.0,46.5 L 30.0,23.5 Q 32,20 36,20 L 64,20 Q 68,20 70.0,23.5 Z"
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
