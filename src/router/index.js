import { createRouter, createWebHistory } from 'vue-router';
import { supabase } from '../supabase/init';
const routes = [
  {
    path: '/dashboard',
    name: 'WarrantyApp',
    component: () => import('../pages/WarrantyApp.vue'),
    beforeEnter(to, from, next) {
      if (!supabase.auth.user()) {
        next('/login');
      } else {
        next();
      }
    },
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../pages/LoginTemplate.vue'),
  },
  {
    path: '/FirstLogin',
    name: 'FirstLogin',
    component: () => import('../pages/FirstLogin.vue'),
    beforeEnter(to, from, next) {
      if (!supabase.auth.user()) {
        next('/login');
      } else {
        next();
      }
    },
  },
  {
    path: '/:pathMatch(.*)*',
    component: () => import('../pages/WarrantyApp.vue'),
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});
export default router;
