import { ref } from 'vue';

const clearHistoryTrigger = ref(0);

export function useClearHistory() {
  return { clearHistoryTrigger };
}
