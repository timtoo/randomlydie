<script lang="ts">
import { computed, defineComponent, ref, onMounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { rollHistoryType } from 'components/models';
import { MODE_ID, MODE, mode_by_name } from 'src/lib/modes';
import { Die } from 'src/lib/die';
import SettingsDialog from 'components/SettingsDialog.vue';
import ModePickerDialog from 'components/ModePickerDialog.vue';
import HistoryList from 'src/components/HistoryList.vue';
import PreviousRolls from 'components/PreviousRolls.vue';
import QuickButtons from 'components/QuickButtons.vue';
import RollDisplay from 'components/RollDisplay.vue';
import DieConsole from 'components/DieConsole.vue';
import DebugDie from 'components/DebugDie.vue';
import TimerBar from 'components/TimerBar.vue';
import { onKeyStroke, useStorage } from '@vueuse/core';
import { useLastRoll } from 'src/composables/useLastRoll';
import { version } from '../../package.json';

const DEFAULT_QUANTITY = 2;
const DEFAULT_MIN = 1;
const DEFAULT_MAX = 6;
const MAX_QUANTITY = 100;
const MAX_HISTORY = MAX_QUANTITY * 5;
const { lastRollDisplay } = useLastRoll();

function letsroll(
  die: Die,
  mode: MODE_ID,
  rolls: rollHistoryType[],
  quantity?: number,
  min?: number,
  max?: number
): Die {
  const title_divider = ' | ';
  if (quantity !== undefined && quantity !== die.dice) die.dice = quantity;

  die.roll();
  const newDie = die.clone();

  rolls.unshift({
    label: die.toString(),
    display: MODE[mode].displayMulti(die),
    die: die,
    mode: mode,
    time: new Date(),
  });

  if (rolls.length > MAX_HISTORY) rolls.pop();

  const title_divider_index = document.title.lastIndexOf(title_divider);
  if (title_divider_index >= 0) {
    document.title = document.title.slice(title_divider_index + title_divider.length);
  }
  document.title = `${rolls[0].display}${title_divider}${rolls[0].label}${title_divider}${document.title}`;
  lastRollDisplay.value = rolls[0].display;

  return newDie;
}

export default defineComponent({
  name: 'IndexPage',
  props: {
    options: Object,
  },
  components: {
    QuickButtons,
    RollDisplay,
    PreviousRolls,
    HistoryList,
    SettingsDialog,
    ModePickerDialog,
    DieConsole,
    TimerBar,
    DebugDie,
  },
  setup(props) {
    const _rolls: rollHistoryType[] = [];
    const die = ref(new Die(DEFAULT_MIN, DEFAULT_MAX, DEFAULT_QUANTITY));
    const rolls = ref(_rolls);
    const lastUpdate = ref(new Date());
    const mode = ref(MODE_ID.dice);
    const console_active = ref(false);
    const console_error = ref('');
    const ttopen = ref(false);
    const afrender = ref(0);
    const slideshow = ref(false);
    const router = useRouter();
    const route = useRoute();
    const reset_confirm_dialog = ref(false);
    const settingsDialogOpen = ref(false);
    const modeDialogOpen = ref(false);
    const showPrevious = useStorage('rd-show-previous', false);
    const showHistory = useStorage('rd-show-history', false);

    const slideshow_delay = computed(() => {
      return (props.options?.slideshow_delay || 5) * 1000;
    });

    const fabStyle = computed(() => {
      const pos = props.options?.fab_position || 'bottom-right';
      const base = { position: 'fixed' as const, zIndex: 1000 };
      const maxW = 720;
      const pad = 16;
      const margin = 'max(' + pad + 'px, calc((100vw - ' + maxW + 'px) / 2 + ' + pad + 'px))';
      switch (pos) {
        case 'bottom-left':
          return { ...base, bottom: '20px', left: margin };
        case 'top-right':
          return { ...base, top: '60px', right: margin };
        case 'top-left':
          return { ...base, top: '60px', left: margin };
        default:
          return { ...base, bottom: '20px', right: margin };
      }
    });

    watch(
      () => route.params,
      () => handleURLChange()
    );

    const lastRoll = computed(() => {
      return rolls.value.length > 0 ? rolls.value[0] : null;
    });

    const dice_count = computed(() => {
      return rolls.value.length > 0 ? rolls.value[0].die.dice : 0;
    });

    function handleURLChange() {
      console.log('route params', route.params);
      const modeParam = Array.isArray(route.params.mode)
        ? route.params.mode[0]
        : route.params.mode;
      if (modeParam) {
        const new_mode = mode_by_name(modeParam);
        if (new_mode) {
          mode.value = new_mode.id;
        }
      }
      const dieParam = Array.isArray(route.params.die)
        ? route.params.die[0]
        : route.params.die;
      if (dieParam) {
        try {
          const new_die = new Die(dieParam);
          die.value = new_die;
        } catch {
          console.log('Could not parse die: ', dieParam);
        }
      }
    }

    onMounted(() => {
      handleURLChange();
    });

    function updateURL(replace = true) {
      const r = lastRoll.value;
      if (r) {
        router.push({
          params: { mode: MODE[r.mode].name_stripped, die: r.label },
          replace: replace,
        });
      }
    }

    function toggleSlideshow() {
      slideshow.value = !slideshow.value;
      if (slideshow.value) {
        bigButtonClick();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
      console.log('Slideshow now ', slideshow.value);
    }

    function bigButtonClick() {
      die.value = letsroll(die.value, mode.value, rolls.value);
      lastUpdate.value = rolls.value[0].time;
      if (
        rolls.value.length == 1 ||
        (rolls.value.length > 1 &&
          (rolls.value[0].mode != rolls.value[1].mode ||
            rolls.value[0].label != rolls.value[1].label))
      ) {
        updateURL(false);
      }
    }

    function fabClick() {
      if (slideshow.value) {
        toggleSlideshow();
      } else {
        bigButtonClick();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }

    function handleQuickButton(v: number) {
      die.value.max = v;
      die.value.min = die.value.zerobase ? 0 : 1;
      bigButtonClick();
    }

    function advancedUpdate(v: number[]) {
      if (die.value.min == 0 && v[0] > 0) {
        die.value.zerobase = false;
      }
      if (die.value.min > 0 && v[0] == 0) {
        die.value.zerobase = true;
      }
      die.value.min = v[0];
      die.value.max = v[1];
      die.value.dice = v[2];
    }

    function incrementDice() {
      if (die.value.dice < 10) {
        die.value.dice++;
        advancedUpdate([die.value.min, die.value.max, die.value.dice]);
        bigButtonClick();
      }
    }

    function decrementDice() {
      if (die.value.dice > 1) {
        die.value.dice--;
        advancedUpdate([die.value.min, die.value.max, die.value.dice]);
        bigButtonClick();
      }
    }

    function handleChipClick(v: rollHistoryType) {
      die.value = v.die.clone();
      mode.value = v.mode;
      bigButtonClick();
    }

    function handleModeChange(m: number, reroll = true) {
      if (m != mode.value) {
        const new_mode = MODE[m];
        if (new_mode) {
          die.value = die.value.clone();
          if (new_mode.override) {
            Object.assign(die.value, new_mode.override);
          } else {
            die.value.zerobase = false;
            die.value.exclusive = false;
          }
          if (!new_mode.quick.includes(die.value.max)) {
            die.value.max = new_mode.default_max;
            die.value.min = die.value.zerobase ? 0 : 1;
          }
          mode.value = m;
          if (reroll) bigButtonClick();
        }
      }
    }

    function handleZeroBaseToggle() {
      die.value = die.value.clone();
      die.value.zerobase = !die.value.zerobase;
      die.value.min = die.value.zerobase ? 0 : 1;
      if (die.value.max <= die.value.min) die.value.max = die.value.min + 1;
    }

    function handleReset() {
      if (slideshow.value == true) {
        toggleSlideshow();
      }
      console_active.value = false;
      die.value = new Die(DEFAULT_MIN, DEFAULT_MAX, DEFAULT_QUANTITY);
      mode.value = MODE_ID.dice;
      rolls.value = [];
      reset_confirm_dialog.value = false;
      router.push({ path: '/' });
    }

    function handleConsoleSubmit(data: rollHistoryType) {
      if (data.die !== undefined) die.value = data.die as Die;
      if (data.mode !== undefined) mode.value = data.mode as number;
      bigButtonClick();
    }

    onKeyStroke([' ', 'r', 'R'], (e) => {
      if (e.ctrlKey || e.metaKey) return;
      if (console_active.value) {
        console.log('console open: no enter');
      } else if (!shouldIgnoreHotkey()) {
        e.preventDefault();
        bigButtonClick();
      }
    });

    onKeyStroke('`', () => (console_active.value = true));
    onKeyStroke('Escape', () => (console_active.value = false));

    function shouldIgnoreHotkey() {
      if (console_active.value || settingsDialogOpen.value) return true;
      const active = document.activeElement;
      if (!active || active === document.body) return false;
      const tag = active.tagName.toLowerCase();
      const role = active.getAttribute('role');
      return (
        tag === 'input' ||
        tag === 'textarea' ||
        tag === 'button' ||
        tag === 'a' ||
        role === 'button' ||
        role === 'link' ||
        (active as HTMLElement).isContentEditable
      );
    }

    onKeyStroke('n', () => {
      if (shouldIgnoreHotkey()) return;
      die.value.min = Math.max(0, die.value.min - 1);
      advancedUpdate([die.value.min, die.value.max, die.value.dice]);
    });
    onKeyStroke('N', () => {
      if (shouldIgnoreHotkey()) return;
      if (die.value.min < die.value.max - 1) die.value.min++;
      advancedUpdate([die.value.min, die.value.max, die.value.dice]);
    });
    onKeyStroke('x', () => {
      if (shouldIgnoreHotkey()) return;
      if (die.value.max > die.value.min + 1) die.value.max--;
      advancedUpdate([die.value.min, die.value.max, die.value.dice]);
    });
    onKeyStroke('X', () => {
      if (shouldIgnoreHotkey()) return;
      die.value.max++;
      advancedUpdate([die.value.min, die.value.max, die.value.dice]);
    });
    onKeyStroke('d', () => {
      if (shouldIgnoreHotkey()) return;
      decrementDice();
    });
    onKeyStroke('D', () => {
      if (shouldIgnoreHotkey()) return;
      incrementDice();
    });

    return {
      MODE,
      lastRoll,
      dice_count,
      lastUpdate,
      mode,
      die,
      rolls,
      afrender,
      ttopen,
      console_active,
      console_error,
      slideshow,
      slideshow_delay,
      version,
      reset_confirm_dialog,
      settingsDialogOpen,
      modeDialogOpen,
      showPrevious,
      showHistory,
      bigButtonClick,
      handleQuickButton,
      handleChipClick,
      handleZeroBaseToggle,
      handleModeChange,
      handleReset,
      advancedUpdate,
      handleConsoleSubmit,
      toggleSlideshow,
      incrementDice,
      decrementDice,
      fabClick,
      fabStyle,
    };
  },
});
</script>

<template>
  <q-page class="rr-page-container q-pb-xl">
    <main role="main">
    <!-- Hero Result Display -->
    <div id="result-display" class="rr-hero-display q-mt-md" role="region" aria-label="Roll result">
      <template v-if="lastRoll">
        <div v-for="(v, idx) in lastRoll.die.getThrow()" :key="lastRoll.time.getTime() + '-' + idx">
          <roll-display
            :value="v"
            :index="idx"
            :display="MODE[lastRoll.mode].displayValue(lastRoll.die.getThrow()[idx], lastRoll.die.max)"
            :roll="lastRoll"
            :sparkle="options?.sparkleMode"
            @on-roll-display-click="bigButtonClick"
          ></roll-display>
        </div>
      </template>
      <template v-else>
        <roll-display
          :value="0"
          :roll="null"
          display="Tap to Roll"
          @on-roll-display-click="bigButtonClick"
        ></roll-display>
      </template>
    </div>

    <!-- Settings Summary Bar -->
    <div
      class="text-center q-mt-sm rr-settings-bar text-body1 row justify-center items-center q-gutter-x-sm"
    >
      <span
        class="rr-settings-item cursor-pointer"
        tabindex="0"
        role="button"
        aria-label="Open generator settings"
        @click="settingsDialogOpen = true"
        @keydown.enter="settingsDialogOpen = true"
        @keydown.space.prevent="settingsDialogOpen = true"
      >
        <q-icon name="expand_more" size="xs" class="q-mr-xs" style="opacity: 0.6" />
        {{ die.getRangeString(true, ' to ') }}
      </span>
      <span style="color: var(--rr-text-muted)">·</span>
      <span
        class="rr-settings-item cursor-pointer"
        tabindex="0"
        role="button"
        aria-label="Open mode picker"
        @click="modeDialogOpen = true"
        @keydown.enter="modeDialogOpen = true"
        @keydown.space.prevent="modeDialogOpen = true"
      >
        <q-icon :name="MODE[mode].material_icon" size="sm" />
        <span class="q-ml-xs">{{ MODE[mode].name }}</span>
        <q-icon name="expand_more" size="xs" class="q-ml-xs" style="opacity: 0.6" />
      </span>
    </div>

    <!-- Timestamp -->
    <div class="text-center q-mt-xs text-body2 text-italic" style="color: var(--rr-text-muted)">
      {{ lastRoll ? lastRoll.time.toLocaleString() : '&nbsp;' }}
    </div>

    <!-- Dice Quantity Stepper -->
    <div class="row justify-center q-mt-lg rr-quantity-stepper">
      <q-btn flat dense color="primary" icon="remove" class="text-h6" aria-label="Decrease number of values" @click="decrementDice" />
      <div class="rr-quantity-value text-h5 self-center">{{ die.dice }}</div>
      <q-btn flat dense color="primary" icon="add" class="text-h6" aria-label="Increase number of values" @click="incrementDice" />
    </div>
    <div class="text-center text-body2" style="color: var(--rr-text-muted)">
      Number of values
    </div>

    <!-- Quick Buttons -->
    <div id="quick-roll" class="q-mt-md" v-if="!options?.hideQuick">
      <quick-buttons
        :mode="mode"
        :current="die.max"
        @on-quick-button="(v:number) => handleQuickButton(v)"
      ></quick-buttons>
    </div>

    <!-- History Toggles -->
    <div class="row justify-center q-gutter-sm q-mt-md" v-if="rolls.length > 0 && (!options?.hidePrevious || !options?.hideHistory)">
      <q-btn
        v-if="!options?.hidePrevious"
        :unelevated="showPrevious"
        :outline="!showPrevious"
        color="primary"
        no-caps
        size="md"
        class="text-body1"
        :label="'Previous rolls (' + (rolls.length > 1 ? rolls.length - 1 : 0) + ')'"
        @click="showPrevious = !showPrevious"
      />
      <q-btn
        v-if="!options?.hideHistory"
        :unelevated="showHistory"
        :outline="!showHistory"
        color="primary"
        no-caps
        size="md"
        class="text-body1"
        label="Roll history"
        @click="showHistory = !showHistory"
      />
    </div>

    <!-- Previous Rolls Panel -->
    <div
      v-if="showPrevious && !options?.hidePrevious && rolls.length > 1"
      class="rr-history-panel q-mt-sm q-pa-md"
    >
      <previous-rolls :rolls="rolls"></previous-rolls>
    </div>

    <!-- Roll History Panel -->
    <div
      v-if="showHistory && !options?.hideHistory && rolls.length > 0"
      class="rr-history-panel q-mt-sm q-pa-md"
    >
      <history-list
        :rolls="rolls"
        @on-die-chip="(v: rollHistoryType) => handleChipClick(v)"
      ></history-list>
    </div>

    <!-- Action Icons -->
    <div class="row justify-center q-mt-xl rr-action-row">
      <q-btn
        flat
        round
        color="primary"
        icon="help_outline"
        aria-label="Tips and tricks"
        @click="ttopen = !ttopen"
      >
        <q-tooltip v-model="ttopen" :hide-delay="1550">
          <div class="text-body1">
            <b>Tips and tricks!</b>
            <ul>
              <li>
                Click/tap the top box, or the bottom right button, for
                <b>new number(s)</b>. Too obvious?
              </li>
              <li>
                Long press (click and hold) random item to copy to
                <b>clipboard</b> (or use the copy button, or click previous rolls!)
              </li>
              <li class="desktop-only">
                Hot keys! Min: N/n, Max: X/x, # 'dice': D/d, roll: Enter/Space
              </li>
              <li>
                Use hex mode
                <span style="font-family: monospace">x1000000</span> button for
                random HTML colour codes (or
                <span style="font-family: monospace">3d256xz</span> if you
                prefer!)
              </li>
              <li>Use five dice to play Yahtzee?</li>
              <li class="desktop-only" >` for console. Is that crazy?</li>
            </ul>
            <div style="float: right">v{{ version }}</div>
            <i>Use your randomness for good.</i>
          </div>
        </q-tooltip>
      </q-btn>
      <q-btn
        flat
        round
        color="primary"
        icon="computer"
        aria-label="Toggle console"
        @click="console_active = !console_active"
      />
      <q-btn
        flat
        round
        color="primary"
        icon="refresh"
        aria-label="Reset to defaults"
        @click="reset_confirm_dialog = true"
      >
        <q-tooltip :delay="1000">Reset to defaults</q-tooltip>
      </q-btn>
      <q-btn
        flat
        round
        color="primary"
        :icon="slideshow ? 'pause' : 'play_arrow'"
        :aria-label="slideshow ? 'Stop slideshow' : 'Start slideshow'"
        @click="toggleSlideshow"
      >
        <q-tooltip :delay="1000">Toggle automatic random numbers every few seconds</q-tooltip>
      </q-btn>
    </div>

    <!-- Settings Dialog -->
    <SettingsDialog
      v-model="settingsDialogOpen"
      :die="die"
      :mode="mode"
      @advanced-update="(v:number[]) => advancedUpdate(v)"
      @base-toggle="handleZeroBaseToggle"
      @exclusive-toggle="() => (die.exclusive = !die.exclusive)"
      @mode-change="(m:number) => handleModeChange(m, false)"
      @close="bigButtonClick"
    ></SettingsDialog>

    <!-- Mode Picker Dialog -->
    <ModePickerDialog
      v-model="modeDialogOpen"
      :mode="mode"
      @mode-change="(m:number) => handleModeChange(m)"
    ></ModePickerDialog>

    <!-- Console -->
    <DieConsole
      :active="console_active"
      :history="rolls"
      :die="die"
      :mode="mode"
      @console-close="console_active = false"
      @submit="handleConsoleSubmit"
    ></DieConsole>

    <!-- FAB -->
    <div :style="fabStyle">
      <q-btn
        fab
        :icon="slideshow ? 'stop' : MODE[mode].material_icon"
        :color="slideshow ? 'positive' : 'secondary'"
        text-color="black"
        @click="fabClick"
      >
        &nbsp;
        <span style="text-transform: none">{{ slideshow ? 'Stop' : die.toString() }}</span>
      </q-btn>
    </div>

    <!-- Reset Dialog -->
    <q-dialog v-model="reset_confirm_dialog" role="alertdialog" aria-label="Confirm reset">
      <q-card class="reset-card outlined">
        <q-card-section class="row items-center">
          <q-avatar icon="warning" color="primary" text-color="white" />
          <span class="q-ml-sm">Clear history and reset mode?</span>
        </q-card-section>
        <q-card-actions align="center">
          <q-btn outline label="Do it" color="primary" @click="handleReset" />
          <q-btn outline label="Cancel" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <TimerBar
      :duration="slideshow_delay"
      :active="slideshow"
      @timeout="bigButtonClick"
    ></TimerBar>

    <DebugDie
      :die="die"
      :active="options?.enableDebug"
      bg-color="#d5c396"
    ></DebugDie>
    </main>
  </q-page>
</template>

<style lang="scss">
.reset-card {
  background-color: var(--rr-paper);
}
</style>
