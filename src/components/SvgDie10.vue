<!-- Display a 10-sided die face as SVG -->
<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'SvgDie10',
  props: {
    value: { type: Number, default: 0 },
    strokeWidth: { type: Number, default: 1.4 },
  },
});
</script>

<template>
  <svg viewBox="18 15 64 70" xmlns="http://www.w3.org/2000/svg">
    <g :stroke-width="strokeWidth">
      <!--
        D10 face: a symmetric kite (convex quadrilateral).
        Corners rounded with r≈4.
      -->
      <path
        d="M 51.9,21.0 L 78.1,69.0 Q 80,72.5 76.2,73.8 L 53.8,81.2 Q 50,82.5 46.2,81.2 L 23.8,73.8 Q 20,72.5 21.9,69.0 L 48.1,21.0 Q 50,17.5 51.9,21.0 Z"
        fill="#fff"
        stroke="#000"
        stroke-linejoin="round"
      />
      <text
        x="50"
        y="58"
        text-anchor="middle"
        dominant-baseline="central"
        font-family="sans-serif"
        font-weight="bold"
        :font-size="value >= 10 ? '28' : '33'"
        fill="#282828"
      >
        {{ value }}
      </text>
    </g>
  </svg>
</template>
