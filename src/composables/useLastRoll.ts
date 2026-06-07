import { ref } from 'vue';

const lastRollDisplay = ref<string>('');

export function useLastRoll() {
  return { lastRollDisplay };
}
