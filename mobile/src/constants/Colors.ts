import { useThemeStore } from '@/store/theme';
import { useColorScheme } from 'react-native';

const tintColorLight = '#e11d48';
const tintColorDark = '#e11d48';

export const Colors = {
  light: {
    text: '#18181b', // zinc-900
    textMuted: '#71717a', // zinc-500
    background: '#ffffff',
    card: '#f4f4f5', // zinc-100
    border: '#e4e4e7', // zinc-200
    tint: tintColorLight,
    error: '#ef4444',
  },
  dark: {
    text: '#ffffff',
    textMuted: '#a1a1aa',
    background: '#09090b',
    card: '#18181b',
    border: '#27272a',
    tint: tintColorDark,
    error: '#ef4444',
  },
};

export function useThemeColor() {
  const { theme } = useThemeStore();
  const systemTheme = useColorScheme() ?? 'light'; // Fallback to light
  
  const activeTheme = theme === 'system' ? systemTheme : theme;
  return Colors[activeTheme];
}
