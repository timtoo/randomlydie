<!-- Display a 12-sided die face as SVG (regular pentagon) -->
<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'SvgDie12',
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
        D12 face: a regular pentagon (flat base, pointed top).
        Circumradius ≈ 38.7, centred at (50, 53.7).

        Vertices (clockwise from top):
        1. Top    (50,  15)
        2. UR     (87,  42)
        3. LR     (73,  85)
        4. LL     (27,  85)
        5. UL     (13,  42)
      -->
      <polygon
        points="50,15 87,42 73,85 27,85 13,42"
        fill="#fff"
        stroke="#000"
        stroke-linejoin="round"
      />
      <!-- Digit centred at the pentagon centroid -->
      <text
        x="50"
        y="56"
        text-anchor="middle"
        dominant-baseline="central"
        font-family="sans-serif"
        font-weight="bold"
        :font-size="value >= 10 ? '31' : '35'"
        fill="#282828"
      >
        {{ value }}
      </text>
    </g>
  </svg>
</template>
