import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import React, { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/auth';
import { useThemeStore } from '@/store/theme';
import { useColorScheme as useNativeColorScheme } from 'react-native';

import '../global.css';
import 'react-native-url-polyfill/auto';

import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function RootLayout() {
  const { theme } = useThemeStore();
  const systemColorScheme = useNativeColorScheme();
  const { setSession, setInitialized } = useAuthStore();

  useEffect(() => {
    // Initialize Supabase Auth state
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setInitialized(true);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setInitialized(true);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);
  
  const activeColorScheme = theme === 'system' ? (systemColorScheme ?? 'light') : theme;
  const navigationTheme = activeColorScheme === 'dark' ? DarkTheme : DefaultTheme;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider value={navigationTheme}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(app)" />
        </Stack>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
