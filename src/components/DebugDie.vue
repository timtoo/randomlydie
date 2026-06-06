<!-- Put a semi-transparent div in the corner with info. Click to move. -->
<script setup lang="ts">
import { ref } from 'vue';
import { Die } from 'src/lib/die';

defineProps({ die: Die, active: Boolean, bgColor: String });

const locations = ['top-right', 'bottom-right', 'top-left', 'bottom-left'];
let locidx = 0;

const loc = ref(locations[locidx]);

function handleClick() {
    console.log('click')
  locidx++;
  if (locidx >= locations.length) locidx = 0;
  loc.value = locations[locidx];
}
</script>

<template>
  <div v-if="active">
    <q-page-sticky :position="(loc as any)" :offset="[18, 18]">
      <div class="debug-sticky q-pa-sm text-caption" :style="{backgroundColor: bgColor}" @click="handleClick">
        <pre>{{ JSON.stringify(die, null, 3) || 'no die?' }}</pre>
      </div>
    </q-page-sticky>
  </div>
</template>

<style lang="css">
.debug-sticky {
  background-color: rgb(250, 250, 175);
  opacity: 0.5;
  color: black;

}
</style>
