import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { AuthService, ConfigService, type UserLoginDto } from '@/api';

// Define the shape of the user object we might get from the token
interface User {
  id: number;
  role: string;
}

export const useAuthStore = defineStore('auth', () => {
  const router = useRouter();
  const token = ref<string | null>(localStorage.getItem('token'));
  const user = ref<User | null>(null);

  // --- Getters ---
  const isAuthenticated = computed(() => !!token.value);

  // --- Actions ---

  /**
   * Sets the token and user info.
   * Also decodes the JWT to extract user info.
   */
  function setToken(newToken: string) {
    token.value = newToken;
    localStorage.setItem('token', newToken);

    // Decode JWT payload
    try {
      const payload = JSON.parse(atob(newToken.split('.')[1]));
      user.value = { id: payload.id, role: payload.role };
    } catch (error) {
      console.error('Failed to decode JWT:', error);
      user.value = null;
    }
  }

  /**
   * Clears authentication state.
   */
  function clearAuth() {
    token.value = null;
    user.value = null;
    localStorage.removeItem('token');
  }

  /**
   * Logs the user out and redirects to the login page.
   */
  async function logout() {
    clearAuth();
    router.push({ name: 'Login' }); // Assuming you have a route named 'Login'
  }

  /**
   * Attempts to log in the user.
   * On success, sets the token and navigates to the home page.
   */
  async function login(credentials: UserLoginDto) {
    try {
      const response = await AuthService.postApiAuthLogin(credentials);
      if (response.token) {
        setToken(response.token);
        router.push({ name: 'Home' }); // Navigate to home on successful login
      } else {
        throw new Error('Login response did not include a token.');
      }
    } catch (error) {
      console.error('Login failed:', error);
      // Optionally, set an error state to show in the UI
      throw error; // Re-throw to be caught by the component
    }
  }

  /**
   * Checks for single-user mode and attempts to log in with default credentials.
   * @returns {Promise<boolean>} - True if login was successful, false otherwise.
   */
  async function trySingleUserLogin(): Promise<boolean> {
    try {
      const { isMultiUser } = await ConfigService.getApiConfigIsMultiUser();

      if (isMultiUser) {
        return false;
      }

      // It's single-user mode, attempt login with default creds
      const response = await AuthService.postApiAuthLogin({
        email: 'admin@e.com',
        password: 'password',
      });

      if (response.token) {
        setToken(response.token);
        return true;
      }
      return false;
    } catch (error) {
      // This can happen if the default user doesn't exist, etc.
      // We'll just fail silently and let the normal login flow proceed.
      console.warn('Silent single-user login attempt failed:', error);
      return false;
    }
  }

  return {
    token,
    user,
    isAuthenticated,
    setToken,
    logout,
    login,
    trySingleUserLogin,
  };
});
