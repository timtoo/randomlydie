<!-- Display a 100-sided die face as SVG (regular hexagon, flat top/bottom) -->
<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'SvgDie100',
  props: {
    value: { type: Number, default: 0 },
    strokeWidth: { type: Number, default: 2 },
  },
});
</script>

<template>
  <svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <g :stroke-width="strokeWidth">
      <!--
        D100 face: a regular hexagon (flat top & bottom, points left/right).
        Side length ≈ 35.

        Vertices (clockwise from top-right):
        1. TR  (68, 20)
        2. R   (85, 50)
        3. BR  (68, 80)
        4. BL  (32, 80)
        5. L   (15, 50)
        6. TL  (32, 20)
      -->
      <polygon
        points="68,20 85,50 68,80 32,80 15,50 32,20"
        fill="#fff"
        stroke="#000"
        stroke-linejoin="round"
        :transform="value % 2 === 1 ? 'rotate(30, 50, 50)' : ''"
      />
      <!-- Digit centred in the hexagon -->
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
