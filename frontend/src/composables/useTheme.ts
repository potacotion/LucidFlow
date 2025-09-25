import { ref, onMounted, watch } from 'vue';

type Theme = 'light' | 'dark';

const THEME_KEY = 'app-theme';

export function useTheme() {
  const theme = ref<Theme>((localStorage.getItem(THEME_KEY) as Theme) || 'light');

  const setTheme = (newTheme: Theme) => {
    theme.value = newTheme;
  };

  const applyTheme = (theme: Theme) => {
    localStorage.setItem(THEME_KEY, theme);
    document.documentElement.className = `theme-${theme}`;
  };

  onMounted(() => {
    applyTheme(theme.value);
  });

  watch(theme, (newTheme) => {
    applyTheme(newTheme);
  });

  return {
    theme,
    setTheme,
  };
}
