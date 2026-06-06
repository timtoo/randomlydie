<!-- Display a 20-sided die face as SVG (equilateral triangle) -->
<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'SvgDie20',
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
        D20 face: an equilateral triangle (flat base, pointed top).
        Height ≈ 76, side ≈ 88.

        Vertices:
        1. Top    (50, 12)
        2. BR     (94, 88)
        3. BL     (6,  88)
      -->
      <polygon
        points="50,12 94,88 6,88"
        fill="#fff"
        stroke="#000"
        stroke-linejoin="round"
      />
      <!-- Digit centred at the triangle centroid -->
      <text
        x="50"
        y="63"
        text-anchor="middle"
        dominant-baseline="central"
        font-family="sans-serif"
        font-weight="bold"
        :font-size="value >= 10 ? '34' : '42'"
        fill="#282828"
      >
        {{ value }}
      </text>
    </g>
  </svg>
</template>
