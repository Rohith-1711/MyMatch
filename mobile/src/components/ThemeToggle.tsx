import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useThemeStore } from '@/store/theme';
import { useThemeColor } from '@/constants/Colors';

export function ThemeToggle() {
  const { theme, setTheme } = useThemeStore();
  const colors = useThemeColor();

  const toggleTheme = () => {
    // Cycle through system -> dark -> light -> system
    if (theme === 'system') setTheme('dark');
    else if (theme === 'dark') setTheme('light');
    else setTheme('system');
  };

  const getIcon = () => {
    if (theme === 'system') return '⚙️';
    if (theme === 'dark') return '🌙';
    return '☀️';
  };

  return (
    <TouchableOpacity 
      onPress={toggleTheme} 
      style={[styles.btn, { backgroundColor: colors.card, borderColor: colors.border }]}
    >
      <Text style={{ fontSize: 20 }}>{getIcon()}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  }
});
