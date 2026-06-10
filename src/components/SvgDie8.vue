<!-- Display an 8-sided die face as SVG (equilateral triangle, point down) -->
<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'SvgDie8',
  props: {
    value: { type: Number, default: 0 },
    strokeWidth: { type: Number, default: 1.6 },
  },
});
</script>

<template>
  <svg viewBox="4 10 92 80" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="die8-desc">
    <desc id="die8-desc">Eight-sided die showing {{ value }}</desc>
    <g :stroke-width="strokeWidth">
      <!--
        D8 face: an equilateral triangle (flat base at top, pointed bottom).
        Inverted from the d20 triangle. Corners rounded with r≈4.
      -->
      <path
        d="M 8.0,15.5 L 92.0,15.5 Q 96,15 94.0,19.0 L 54.0,84.5 Q 50,90 46.0,84.5 L 6.0,19.0 Q 4,15 8.0,15.5 Z"
        fill="#fff"
        stroke="#000"
        stroke-linejoin="round"
      />
      <text
        x="50"
        y="40"
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
