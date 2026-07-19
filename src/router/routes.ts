import { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('../layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('../pages/IndexPage.vue') },
      { path: 'roll/:mode/:die*', component: () => import('../pages/IndexPage.vue') },
      { path: 'modes', component: () => import('../pages/ModePage.vue') },
      { path: 'test', component: () => import('../pages/TestPage.vue') },
      { path: ':die+', component: () => import('../pages/IndexPage.vue') },
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
