/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly QUASAR_SERVICE_WORKER_FILE: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
