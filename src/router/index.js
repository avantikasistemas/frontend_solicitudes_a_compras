import { createRouter, createWebHistory } from 'vue-router'
import Loginview from '@/views/Loginview.vue'
import HomeView from '@/views/HomeView.vue'
import SolicitudesComprasView from '@/views/SolicitudesComprasView.vue'
import LoginComprasView from '@/views/LoginComprasView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {path: '/', name: 'login', component: Loginview, meta: { public: true }},
    {path: '/solicitudes', name: 'solicitudes', component: HomeView},
    {path: '/login-compras', name: 'login-compras', component: LoginComprasView, meta: { public: true }},
    {path: '/solicitudes-compras', name: 'solicitudes-compras', component: SolicitudesComprasView}
  ]
})

// Middleware de autenticación
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token');
  const isPublic = to.meta.public === true;

  if (isPublic) {
    next(); // Ruta pública, permitir acceso
  } else {
    if (!token) {
      // Si la ruta protegida es 'solicitudes-compras', redirigir a login-compras
      if (to.name === 'solicitudes-compras') {
        next({ name: 'login-compras' });
      } else {
        next({ name: 'login' }); // Resto de rutas, redirigir al login por defecto
      }
    } else {
      next(); // Token presente, permitir navegación
    }
  }
});

export default router
