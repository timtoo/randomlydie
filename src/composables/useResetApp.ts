import { ref } from 'vue';

const resetAppTrigger = ref(0);

export function useResetApp() {
  return { resetAppTrigger };
}
