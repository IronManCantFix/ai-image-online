import { ref, watch } from 'vue'

type Theme = 'light' | 'dark'

const STORAGE_KEY = 'ai-image-theme'
const theme = ref<Theme>('light')

function applyTheme(t: Theme) {
  if (t === 'dark') {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
}

function loadTheme() {
  const saved = localStorage.getItem(STORAGE_KEY) as Theme | null
  if (saved) {
    theme.value = saved
  }
  applyTheme(theme.value)
}

function toggleTheme() {
  theme.value = theme.value === 'light' ? 'dark' : 'light'
  localStorage.setItem(STORAGE_KEY, theme.value)
  applyTheme(theme.value)
}

watch(theme, (t) => applyTheme(t))

export function useTheme() {
  return { theme, toggleTheme, loadTheme }
}
