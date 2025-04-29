import { createRouter, createWebHistory } from 'vue-router'
import Loginview from '@/views/Loginview.vue';
import HomeView from '@/views/HomeView.vue';
// import RegistroView from '@/views/RegistroView.vue';
// import FormacionesView from '@/views/FormacionesView.vue';
// import EditarFormacion from '@/views/EditarFormacion.vue';
// import ConsultasView from '@/views/ConsultasView.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {path: '/', name: 'login', component: Loginview},
    {path: '/solicitudes', name: 'solicitudes', component: HomeView},
    // {path: '/formaciones', name: 'formaciones', component: FormacionesView},
    // {path: '/editar-formacion/:id', name: 'editar-formacion', component: EditarFormacion, props: true},
    // {path: '/consultas/', name: 'consultas', component: ConsultasView},
  ]
})

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token');
  // Si no se requiere autenticación (por ejemplo, en la ruta de login), continúa
  if (to.path === '/' || to.name === 'login') {
    next();
  } else {
    // Si se requiere autenticación y no hay token, redirigir al login
    if (!token) {
      next({ name: 'login' }); // Redirigir a la ruta de login si no hay token
    } else {
      // Si hay token, permitir la navegación
      next();
    }
  }
});

export default router