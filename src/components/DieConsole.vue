<script setup lang="ts">
import { useStorage } from '@vueuse/core';
import { useQuasar } from 'quasar';
import { computed, ref, watch, onMounted, onUnmounted } from 'vue';
import { Die } from 'src/lib/die';
import { consoleSubmitType, rollHistoryType } from '../lib/models';
import { MODE_ID } from 'src/lib/modes';
import { parseDiceExpression } from 'src/lib/consoleParser';

interface Props {
  active: boolean;
  die: Die;
  mode: MODE_ID;
  history: rollHistoryType[];
  sparkle?: boolean;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  (e: 'submit', data: consoleSubmitType): void;
  (e: 'console-close'): void;
}>();

const console_active = ref(props.active);
const console_input = ref('');
const error_status = ref(false);
const console_error = ref('');
const consoleRef = ref<HTMLDivElement | null>(null);
const keyboardOffset = ref(0);
const $q = useQuasar();

const console_history = useStorage<string[]>('rd-console-history', []);
const selected_match = ref(-1);
const selectingMatch = ref(false);

const inputValue = computed(() => (console_input.value || '').trim());

const matches = computed(() => {
  const val = inputValue.value.toLowerCase();
  if (!val) return [];
  const seen = new Set<string>();
  const list: string[] = [];
  for (const entry of console_history.value) {
    const lower = entry.toLowerCase();
    if (lower.includes(val) && lower !== val && !seen.has(lower)) {
      seen.add(lower);
      list.push(entry);
    }
    if (list.length >= 8) break;
  }
  return list;
});

const show_matches = computed(() => matches.value.length > 0);

const sparkleGlow = computed(() => {
  if (!props.sparkle || !console_active.value) return undefined;
  const isDark = $q.dark.isActive;
  const h = Math.floor(Math.random() * 360);
  const alpha = isDark ? 0.8 : 0.6;
  return `hsla(${h}, 80%, 60%, ${alpha})`;
});

watch(console_error, () => {
  error_status.value = console_error.value !== '';
});

watch(
  () => props.active,
  () => (console_active.value = props.active),
);

watch(console_input, () => {
  selected_match.value = -1;
  if (!console_input.value) {
    error_status.value = false;
  }
});

function onSubmit() {
  if (selectingMatch.value) {
    console_input.value = matches.value[selected_match.value];
    selectingMatch.value = false;
    selected_match.value = -1;
    return;
  }

  console.log('handle console submit: ' + console_input.value);

  const result = parseDiceExpression(
    console_input.value,
    props.mode,
    props.die,
  );

  if (!result) {
    console_error.value = 'Invalid dice format. Try something like: dice 3d6.';
    return;
  }

  console_error.value = '';
  console.log(
    'Console parsed:',
    result.dice
      .map((d) => `${MODE_ID[d.mode]}:${d.die.toString()}(${d.die.operator})`)
      .join(', '),
  );

  emit('submit', {
    label: console_input.value,
    mode: result.mode,
    dice: result.dice,
    time: new Date(),
  });

  const raw = inputValue.value;
  if (raw) {
    const idx = console_history.value.indexOf(raw);
    if (idx >= 0) console_history.value.splice(idx, 1);
    console_history.value.unshift(raw);
    if (console_history.value.length > 50) console_history.value.pop();
  }
}

function selectMatch(index: number) {
  console_input.value = matches.value[index];
  selected_match.value = -1;
}

function onInputKeydown(event: KeyboardEvent) {
  if (!show_matches.value) return;

  if (event.key === 'ArrowDown') {
    event.preventDefault();
    selected_match.value = (selected_match.value + 1) % matches.value.length;
  } else if (event.key === 'ArrowUp') {
    event.preventDefault();
    selected_match.value =
      (selected_match.value - 1 + matches.value.length) % matches.value.length;
  } else if (event.key === 'Enter' && selected_match.value >= 0) {
    event.preventDefault();
    selectingMatch.value = true;
  }
}
function updateKeyboardOffset() {
  if (!window.visualViewport) return;
  const vv = window.visualViewport;
  const layoutHeight = window.innerHeight;
  const visualHeight = vv.height;
  const offset = layoutHeight - visualHeight - vv.offsetTop;
  keyboardOffset.value = Math.max(0, offset);
}

onMounted(() => {
  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', updateKeyboardOffset);
    window.visualViewport.addEventListener('scroll', updateKeyboardOffset);
    updateKeyboardOffset();
  }
});

onUnmounted(() => {
  if (window.visualViewport) {
    window.visualViewport.removeEventListener('resize', updateKeyboardOffset);
    window.visualViewport.removeEventListener('scroll', updateKeyboardOffset);
  }
});
</script>

<template>
  <q-dialog
    v-model="console_active"
    seamless
    position="bottom"
    ref="console_ref"
  >
    <div
      class="row console justify-center items-center"
      :class="[sparkle && console_active ? 'rr-sparkle-glow' : '']"
      :style="{
        marginBottom: keyboardOffset + 'px',
        '--rr-glow-color': sparkleGlow || 'transparent',
      }"
    >
      <div class="col-grow">
        <q-input
          placeholder="Dice hacking mode enabled..."
          hint="Your dice notation console is ready to serve."
          filled
          clearable
          autofocus
          outlined
          stack-label
          bottom-slots
          :error-message="console_error"
          :error="error_status"
          v-model="console_input"
          @keyup.enter="onSubmit"
          @keydown="onInputKeydown"
          input-class="text-rrinput"
        >
          <template v-slot:prepend>
            <q-icon name="computer" color="primary" /> </template
        ></q-input>
        <q-list
          v-show="show_matches"
          bordered
          separator
          class="rounded-borders console-history-list"
        >
          <q-item
            v-for="(entry, index) in matches"
            :key="entry + index"
            clickable
            :active="index === selected_match"
            active-class="bg-primary text-white"
            @click="selectMatch(index)"
          >
            <q-item-section>
              <q-item-label>{{ entry }}</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </div>
      <div style="margin-left: 1em">
        <div class="col">
          <div>
            <q-btn
              style="width: 100%"
              outline
              @click="$emit('console-close')"
              color="primary"
              >Esc</q-btn
            >
          </div>
          <div>
            <q-btn outline @click="onSubmit" color="primary">Enter</q-btn>
          </div>
        </div>
      </div>
    </div>
  </q-dialog>
</template>

<style lang="scss">
.console-history-list {
  max-height: 30vh;
  overflow-y: auto;
  margin-top: 0.5em;
  background-color: var(--rr-paper);
}

.console {
  color: var(--rr-text);
  background-color: var(--rr-paper);
  border-radius: 4px;
  margin: 1em;
  padding: 1em;
  width: 80vw;
  border: 1px solid var(--rr-border);
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.25);
}
</style>
