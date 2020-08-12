import Vue from 'vue';
import VueRouter from 'vue-router';
import Todo from '../components/Todos.vue';

Vue.use(VueRouter);

const routes = [
  {
    path: '/fetch',
    name: 'fetch',
    component: Todo,
  },
];

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes,
});

export default router;
