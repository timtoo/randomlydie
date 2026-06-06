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
        Corners rounded with r≈4.
      -->
      <path
        d="M 53.2,17.4 L 83.8,39.6 Q 87,42 85.8,45.8 L 74.2,81.2 Q 73,85 69,85 L 31,85 Q 27,85 25.8,81.2 L 14.2,45.8 Q 13,42 16.2,39.6 L 46.8,17.4 Q 50,15 53.2,17.4 Z"
        fill="#fff"
        stroke="#000"
        stroke-linejoin="round"
      />
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
