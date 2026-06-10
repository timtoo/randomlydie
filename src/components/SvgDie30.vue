<!-- Display a 30-sided die face as SVG (rhombus / diamond) -->
<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'SvgDie30',
  props: {
    value: { type: Number, default: 0 },
    strokeWidth: { type: Number, default: 1.4 },
  },
});
</script>

<template>
  <svg viewBox="10 8 80 84" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="die30-desc">
    <desc id="die30-desc">Thirty-sided die showing {{ value }}</desc>
    <g :stroke-width="strokeWidth">
      <!--
        D30 face: a rhombus (diamond) with acute angles of ~63.43° at top and bottom.
        Center (50,50). Vertical half-diagonal = 40, horizontal half-diagonal = 25.
        tan(63.43°/2) = tan(31.715°) ≈ 0.617 ≈ 25/40.
        Corners rounded with small arcs (r≈3).
      -->
      <path
        d="M 50,10 L 75,50 Q 76,52 75,54 L 50,90 Q 48,92 46,90 L 25,54 Q 24,52 25,50 L 48,10 Q 49,8 50,10 Z"
        fill="#fff"
        stroke="#000"
        stroke-linejoin="round"
      />
      <text
        x="50"
        y="52"
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
