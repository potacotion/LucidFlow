import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/auth.store';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'Home',
      component: () => import('@/Home.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/login',
      name: 'Login',
      component: () => import('@/views/LoginView.vue'),
    },
    {
      path: '/initialization',
      name: 'Initialization',
      component: () => import('@/views/Initialization.vue'),
    },
    {
      path: '/register',
      name: 'Register',
      component: () => import('@/views/Register.vue'),
    },
  ],
});

router.beforeEach(async (to, from, next) => {
  // Public routes that don't require initialization check
  if (to.name === 'Login' || to.name === 'Initialization') {
    return next();
  }

  try {
    const response = await fetch('/api/config/needs-initialization');
    const { needsInitialization } = await response.json();

    if (needsInitialization) {
      return next({ name: 'Initialization' });
    }
  } catch (error) {
    console.error('Failed to check initialization status:', error);
    // Optionally, redirect to an error page
    return next(false); // Block navigation
  }

  const authStore = useAuthStore();
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);

  if (requiresAuth && !authStore.isAuthenticated) {
    const loggedIn = await authStore.trySingleUserLogin();
    if (loggedIn) {
      // If auto-login was successful, we need to decide where to go.
      // If we were going to a specific page, go there. Otherwise, home.
      // 'to' is the original destination.
      return next(to);
    } else {
      // Auto-login failed or not applicable, redirect to login page
      return next({ name: 'Login' });
    }
  }

  next();
});

export default router;
