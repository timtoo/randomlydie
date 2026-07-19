import { RouteRecordRaw } from 'vue-router';
import { MODE } from '../lib/modes';

const mode_name_str = Object.values(MODE)
  .map((e) => e.name_stripped.slice(0, 3) + '[^/]*')
  .join('|');

const routes: RouteRecordRaw[] = [
  {
    path: `/:mode((?:${mode_name_str})(?:,(?:${mode_name_str}))*)?/:die*`,
    component: () => import('../layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('../pages/IndexPage.vue') },
      { path: 'modes', component: () => import('../pages/ModePage.vue') },
      { path: 'test', component: () => import('../pages/TestPage.vue') },
    ],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;
