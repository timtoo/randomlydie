<!-- Display a 10-sided die face as SVG -->
<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'SvgDie10',
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
        D10 face: a symmetric kite (convex quadrilateral).
        Interior angles: top 72°, sides 68° each, bottom 152°.

        Vertices (clockwise from top):
        1. Top    (50.0, 17.5)
        2. Right  (80.0, 72.5)
        3. Bottom (50.0, 82.5)
        4. Left   (20.0, 72.5)
      -->
      <polygon
        points="50,17.5 80,72.5 50,82.5 20,72.5"
        fill="#fff"
        stroke="#000"
        stroke-linejoin="round"
      />
      <!-- Digit centred at the kite centroid -->
      <text
        x="50"
        y="61"
        text-anchor="middle"
        dominant-baseline="central"
        font-family="sans-serif"
        font-weight="bold"
        :font-size="value >= 10 ? '20' : '24'"
        fill="#282828"
      >
        {{ value }}
      </text>
    </g>
  </svg>
</template>
