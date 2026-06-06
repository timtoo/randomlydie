<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import { useStorage } from '@vueuse/core';
import { useQuasar } from 'quasar';
import { useRouter } from 'vue-router';

export default defineComponent({
  name: 'MainLayout',

  components: {},

  setup() {
    const options_default = {
      hideHistory: false,
      hidePrevious: false,
      hideAdvanced: false,
      hideQuick: false,
      enableDebug: false,
      default_roll: '1d10',
    };
    const options = useStorage('options', options_default);
    const $q = useQuasar();
    const darkMode = useStorage('darkMode', true);
    const router = useRouter();
    const showSettingsMenu = ref(false);

    onMounted(() => {
      $q.dark.set(darkMode.value);
    });

    function toggleDark() {
      darkMode.value = !darkMode.value;
      $q.dark.set(darkMode.value);
    }

    function handleReset() {
      options.value = { ...options_default };
    }

    return {
      options,
      darkMode,
      showSettingsMenu,
      toggleDark,
      handleReset,
      router,
    };
  },
});
</script>

<template>
  <q-layout view="hHh lpR lFf">
    <q-header class="bg-transparent shadow-none" style="border-bottom: 1px solid var(--rr-border)">
      <q-toolbar class="q-px-md" style="min-height: 44px">
        <q-toolbar-title class="text-subtitle1" style="color: var(--rr-text-muted)">
          Randomly/Die
        </q-toolbar-title>
        <q-btn
          flat
          round
          dense
          icon="settings"
          style="color: var(--rr-text-muted)"
          class="q-mr-sm"
        >
          <q-menu
            v-model="showSettingsMenu"
            class="bg-rrinput"
            style="min-width: 240px"
            auto-close
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
                  <q-toggle v-model="options.hideAdvanced" color="primary" />
                </q-item-section>
                <q-item-section>Hide settings dialog trigger</q-item-section>
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
          :icon="darkMode ? 'dark_mode' : 'light_mode'"
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
