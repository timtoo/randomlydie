<script setup lang="ts">
import { useQuasar } from 'quasar';
import { computed, defineProps, defineEmits, ref, watch, onMounted, onUnmounted } from 'vue';
import { Die } from 'src/lib/die';
import { rollHistoryType } from '../lib/models';
import { MODE_ID, mode_by_name } from 'src/lib/modes';

interface Props {
  active: boolean;
  die: Die;
  mode: MODE_ID;
  history: rollHistoryType[];
  sparkle?: boolean;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  (e: 'submit', data: rollHistoryType): void;
  (e: 'console-close'): void;
}>();

const console_active = ref(props.active);
const console_input = ref('');
const error_status = ref(false);
const console_error = ref('');
const consoleRef = ref<HTMLDivElement | null>(null);
const keyboardOffset = ref(0);
const $q = useQuasar();

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
  () => (console_active.value = props.active)
);

watch(console_input, () => {
  if (console_input.value === '') {
    error_status.value = false;
  }
});

function onSubmit() {
  let terms = console_input.value.split(/[ :;.,/]+/);
  let valid_die = false;
  let valid_mode = false;
  let new_die = props.die;
  let new_mode = props.mode;

  console.log('handle console submit: ' + console_input.value);

  while (terms.length > 0) {
    if (!valid_mode) {
      let found_mode = mode_by_name(terms[0]);
      if (found_mode) {
        console.log(`Console found mode: ${found_mode.id} (${terms[0]})`)
        new_mode = found_mode.id;
        valid_mode = true;
        terms = terms.slice(1);
      }
    }
    if (terms.length > 0) {
      if (
        !valid_die &&
        (terms[0].indexOf('d') >= 0 || terms[0].indexOf('D') >= 0)
      ) {
        try {
          new_die = new Die(terms[0]);
          console_error.value = '';
          valid_die = true;
          console.log(`Console found die: ${new_die.toString()} (${terms[0]})`)
        } catch {
          console_error.value = 'Invalid dice format. Try something like: dice 3d6.';
        }
      }
      terms = terms.slice(1);
    }
  }

  if (!console_error.value) {
    emit('submit', {
      die: new_die,
      display: [],
      mode: new_mode,
      label: console_input.value,
      time: new Date(),
    });
  }
}

// Visual Viewport API to handle virtual keyboard on mobile
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
      :style="{ marginBottom: keyboardOffset + 'px', '--rr-glow-color': sparkleGlow || 'transparent' }"
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
          input-class="text-rrinput"
        >
          <template v-slot:prepend>
            <q-icon name="computer" color="primary" /> </template
        ></q-input>
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
