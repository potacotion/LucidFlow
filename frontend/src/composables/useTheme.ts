import { computed } from 'vue';
import { useConfigStore } from '@/stores/config.store';

type Theme = 'light' | 'dark';

/**
 * Provides a reactive theme value and a method to update it.
 * The actual application of the theme (updating the DOM) is now handled
 * centrally within the config store.
 */
export function useTheme() {
  const configStore = useConfigStore();

  // The theme is a computed property reacting to the config store.
  // It falls back to 'light' if the config isn't loaded or doesn't have a theme.
  const theme = computed<Theme>(() => configStore.config?.theme || 'light');

  // To change the theme, we simply call the store's action.
  const setTheme = (newTheme: Theme) => {
    configStore.updateUserSettings({ theme: newTheme });
  };

  return {
    theme,
    setTheme,
  };
}
