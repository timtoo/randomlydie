<!-- Display a 20-sided die face as SVG (equilateral triangle) -->
<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'SvgDie20',
  props: {
    value: { type: Number, default: 0 },
    strokeWidth: { type: Number, default: 1.6 },
  },
});
</script>

<template>
  <svg viewBox="4 10 92 80" xmlns="http://www.w3.org/2000/svg">
    <g :stroke-width="strokeWidth">
      <!--
        D20 face: an equilateral triangle (flat base, pointed top).
        Corners rounded with r≈4.
      -->
      <path
        d="M 52.0,15.5 L 92.0,84.5 Q 94,88 90.0,88 L 10.0,88 Q 6,88 8.0,84.5 L 48.0,15.5 Q 50,12 52.0,15.5 Z"
        fill="#fff"
        stroke="#000"
        stroke-linejoin="round"
      />
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
