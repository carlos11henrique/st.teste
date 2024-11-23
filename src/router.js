import { createRouter, createWebHistory } from 'vue-router';
import "./assets/global.css";
import ComponenteSidebarNavbar from './components/ComponenteSidebarNavbar.vue';
import LoginPage from './components/LoginPage.vue';
import OpenTicketPage from './components/OpenTicketPage.vue';
import Openchamando from './components/Openchamando.vue';
import axios from "axios";


const routes = [

  { path: '/login', component: LoginPage },
  {path: '/', component: ComponenteSidebarNavbar},
  { path: '/openticketpage', component: OpenTicketPage },
  { path: '/openchamando', component: Openchamando },	
];



const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
