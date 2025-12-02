import { createApp } from 'vue';
import { createRouter, createWebHistory } from 'vue-router';
import App from './App.vue';
import './style.css';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('./views/HomeView.vue'),
    },
    {
      path: '/create',
      name: 'create',
      component: () => import('./views/CreateView.vue'),
    },
    {
      path: '/edit/:id',
      name: 'edit',
      component: () => import('./views/EditView.vue'),
    },
    {
      path: '/features/:id',
      name: 'detail',
      component: () => import('./views/DetailView.vue'),
    },
  ],
});

const app = createApp(App);
app.use(router);
app.mount('#app');
