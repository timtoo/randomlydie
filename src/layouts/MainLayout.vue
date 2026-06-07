<script lang="ts">
import { defineComponent, ref, watch, computed } from 'vue';
import { useStorage } from '@vueuse/core';
import { useQuasar, copyToClipboard } from 'quasar';
import { useRouter } from 'vue-router';
import { useLastRoll } from 'src/composables/useLastRoll';

export default defineComponent({
  name: 'MainLayout',

  components: {},

  setup() {
    const options_default = {
      hideHistory: false,
      hidePrevious: false,
      hideQuick: false,
      enableDebug: false,
      sparkleMode: false,
      default_roll: '1d10',
      slideshow_delay: 5,
      fab_position: 'bottom-right',
    };
    const options = useStorage('options', options_default);
    // Merge with defaults so new fields are populated on old stored data
    options.value = { ...options_default, ...options.value };
    const $q = useQuasar();
    const darkMode = useStorage<'auto' | boolean>('darkMode', 'auto');
    const router = useRouter();
    const showSettingsMenu = ref(false);
    const { lastRollDisplay } = useLastRoll();

    watch(
      darkMode,
      (v) => {
        if (v !== 'auto' && v !== true && v !== false) {
          darkMode.value = 'auto';
        }
        $q.dark.set(darkMode.value);
      },
      { immediate: true }
    );

    function toggleDark() {
      if (darkMode.value === 'auto') {
        darkMode.value = false;
      } else if (darkMode.value === false) {
        darkMode.value = true;
      } else {
        darkMode.value = 'auto';
      }
      $q.dark.set(darkMode.value);
    }

    const darkIcon = computed(() => {
      if (darkMode.value === 'auto') return 'brightness_auto';
      return darkMode.value ? 'dark_mode' : 'light_mode';
    });

    function handleReset() {
      options.value = { ...options_default };
    }

    function handleCopy() {
      if (!lastRollDisplay.value) return;
      copyToClipboard(lastRollDisplay.value)
        .then(() => {
          $q.notify({
            message: 'Copied "' + lastRollDisplay.value + '" to clipboard!',
            icon: 'announcement',
            color: 'primary',
            position: 'top',
            textColor: 'background',
          });
        })
        .catch(() => {
          $q.notify({
            message: 'Clipboard failed',
            icon: 'warning',
            color: 'warn',
            position: 'top',
            textColor: 'background',
          });
        });
    }

    return {
      options,
      darkMode,
      darkIcon,
      showSettingsMenu,
      toggleDark,
      handleReset,
      handleCopy,
      lastRollDisplay,
      router,
    };
  },
});
</script>

<template>
  <q-layout view="hHh lpR lFf">
    <q-header class="bg-transparent shadow-none" style="border-bottom: 1px solid var(--rr-border)" role="banner">
      <q-toolbar class="q-px-md rr-page-container" style="min-height: 44px; background: transparent;">
        <q-btn
          flat
          no-caps
          dense
          class="text-subtitle1"
          style="color: var(--rr-text-muted); padding: 0"
          label="Randomly/Die"
          @click="router.push('/')"
        />
        <q-space />
        <q-btn
          flat
          round
          dense
          icon="content_copy"
          aria-label="Copy last roll to clipboard"
          style="color: var(--rr-text-muted)"
          class="q-mr-sm"
          :disable="!lastRollDisplay"
          @click="handleCopy"
        />
        <q-btn
          flat
          round
          dense
          icon="settings"
          aria-label="Settings menu"
          style="color: var(--rr-text-muted)"
          class="q-mr-sm"
        >
          <q-menu
            v-model="showSettingsMenu"
            class="bg-rrinput"
            style="min-width: 240px"
          >
            <q-list dense>
              <q-item-label header class="text-uppercase text-caption" style="color: var(--rr-text-muted)">
                Display
              </q-item-label>
              <q-item tag="label" v-ripple>
                <q-item-section side>
                  <q-toggle v-model="options.hideQuick" color="primary" />
                </q-item-section>
                <q-item-section>Hide quick buttons</q-item-section>
              </q-item>
              <q-item tag="label" v-ripple>
                <q-item-section side>
                  <q-toggle v-model="options.hidePrevious" color="primary" />
                </q-item-section>
                <q-item-section>Hide previous rolls toggle</q-item-section>
              </q-item>
              <q-item tag="label" v-ripple>
                <q-item-section side>
                  <q-toggle v-model="options.hideHistory" color="primary" />
                </q-item-section>
                <q-item-section>Hide roll history toggle</q-item-section>
              </q-item>
              <q-item tag="label" v-ripple>
                <q-item-section side>
                  <q-toggle v-model="options.sparkleMode" color="primary" />
                </q-item-section>
                <q-item-section>Sparkle mode</q-item-section>
              </q-item>
              <q-separator spaced style="background: var(--rr-border)" />

              <q-item-label header class="text-uppercase text-caption" style="color: var(--rr-text-muted)">
                Auto-roll
              </q-item-label>
              <q-item>
                <q-item-section>
                  <q-item-label class="text-body2">
                    Delay: {{ options.slideshow_delay }}s
                  </q-item-label>
                  <q-slider
                    v-model="options.slideshow_delay"
                    :min="1"
                    :max="30"
                    :step="1"
                    color="primary"
                    label
                  />
                </q-item-section>
              </q-item>

              <q-separator spaced style="background: var(--rr-border)" />

              <q-item-label header class="text-uppercase text-caption" style="color: var(--rr-text-muted)">
                Float Button Position
              </q-item-label>
              <q-item>
                <q-item-section>
                  <q-select
                    v-model="options.fab_position"
                    :options="[
                      { label: 'Bottom right', value: 'bottom-right' },
                      { label: 'Bottom left', value: 'bottom-left' },
                      { label: 'Top right', value: 'top-right' },
                      { label: 'Top left', value: 'top-left' },
                    ]"
                    option-value="value"
                    option-label="label"
                    emit-value
                    map-options
                    dense
                    outlined
                    color="primary"
                    class="bg-rrinput"
                  />
                </q-item-section>
              </q-item>

              <q-separator spaced style="background: var(--rr-border)" />

              <q-item-label header class="text-uppercase text-caption" style="color: var(--rr-text-muted)">
                Developer
              </q-item-label>
              <q-item tag="label" v-ripple>
                <q-item-section side>
                  <q-toggle v-model="options.enableDebug" color="red" />
                </q-item-section>
                <q-item-section>Enable debug</q-item-section>
              </q-item>

              <q-separator spaced style="background: var(--rr-border)" />

              <q-item clickable @click="router.push('/modes')">
                <q-item-section avatar>
                  <q-icon name="list" size="xs" />
                </q-item-section>
                <q-item-section>Modes</q-item-section>
              </q-item>
              <q-item clickable @click="handleReset">
                <q-item-section avatar>
                  <q-icon name="restore" size="xs" />
                </q-item-section>
                <q-item-section>Reset all options</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
        <q-btn
          flat
          round
          dense
          :icon="darkIcon"
          :aria-label="darkMode === 'auto' ? 'Dark mode: auto' : darkMode ? 'Dark mode: on' : 'Dark mode: off'"
          style="color: var(--rr-text-muted)"
          @click="toggleDark"
        />
      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view :options="options" />
    </q-page-container>
  </q-layout>
</template>

<style lang="scss">
</style>
