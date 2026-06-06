<script setup lang="ts">
import { MODE } from 'src/lib/modes';
</script>

<template>
  <q-page class="rr-page-container q-pb-xl">
    <div class="text-h5 text-center q-py-md">Modes</div>

    <div class="row q-col-gutter-md justify-center">
      <template v-for="(val, key) in MODE" :key="key">
        <div class="col-12 col-sm-6 col-md-4">
          <q-card bordered class="rr-mode-card">
            <q-card-section>
              <div class="text-h6" style="color: var(--rr-text)">
                <q-icon :name="val.material_icon" size="sm" class="q-mr-sm" />
                <router-link
                  :to="'/' + val.name"
                  custom
                  v-slot="{ navigate }"
                >
                  <span
                    @click="navigate"
                    @keypress.enter="navigate"
                    role="link"
                    class="span-link"
                    style="color: $secondary"
                  >{{ val.name }}</span>
                </router-link>
              </div>
            </q-card-section>

            <q-separator style="background: var(--rr-border)" />

            <q-card-section class="q-gutter-y-sm">
              <div class="row items-start">
                <div class="col-5 text-primary text-body2">Default Range</div>
                <div class="col text-body2" style="color: var(--rr-text)">
                  {{ val.override.zerobase ? '0' : '1' }} – {{ val.default_max }}
                </div>
              </div>

              <div v-if="val.number_base !== 10" class="row items-start">
                <div class="col-5 text-primary text-body2">Number Base</div>
                <div class="col text-body2" style="color: var(--rr-text)">
                  {{ val.number_base || 'Non-number' }}
                </div>
              </div>

              <div v-if="val.override.exclusive || val.override.zerobase" class="row items-start">
                <div class="col-5 text-primary text-body2">Flags</div>
                <div class="col text-body2" style="color: var(--rr-text)">
                  {{
                    [
                      val.override.exclusive ? 'Exclusive' : '',
                      val.override.zerobase ? 'Zero-base' : '',
                    ]
                      .filter((v) => v)
                      .join(', ') || 'None'
                  }}
                </div>
              </div>

              <div class="row items-start">
                <div class="col-5 text-primary text-body2">Quick Buttons</div>
                <div class="col text-body2" style="color: var(--rr-text)">
                  {{ val.quick.map((v) => v.toString()).join(', ') || 'None' }}
                </div>
              </div>

              <div v-if="val.mappings" class="row items-start">
                <div class="col-5 text-primary text-body2">Mapping</div>
                <div class="col">
                  <div
                    v-for="(v, k) in val.mappings"
                    :key="k"
                    class="text-body2"
                    style="color: var(--rr-text)"
                  >
                    <span class="text-weight-medium">{{ k }}:</span>
                    {{ v.join(', ') }}
                  </div>
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>
      </template>
    </div>
  </q-page>
</template>

<style lang="scss">
.rr-mode-card {
  background-color: var(--rr-paper);
  border-color: $primary;
}
</style>
