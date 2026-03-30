import { Tabs } from 'expo-router';
import React from 'react';
import { BlurView } from 'expo-blur';
import { Platform, StyleSheet, Text } from 'react-native';
import { useThemeColor } from '@/constants/Colors';
import { useThemeStore } from '@/store/theme';

export default function TabsLayout() {
  const colors = useThemeColor();
  const tintStr = colors.background === '#ffffff' ? 'light' : 'dark';

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: colors.tint,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarShowLabel: true,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        ...(Platform.OS === 'ios' ? {
          tabBarBackground: () => (
            <BlurView intensity={80} tint={tintStr} style={StyleSheet.absoluteFill} />
          ),
        } : {
          tabBarStyle: { ...styles.tabBar, backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border }
        })
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Discover',
          tabBarIcon: ({ color }) => <TabBarIcon icon="✨" color={color} />,
        }}
      />
      <Tabs.Screen
        name="events"
        options={{
          title: 'Events',
          tabBarIcon: ({ color }) => <TabBarIcon icon="📅" color={color} />,
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          title: 'Messages',
          tabBarIcon: ({ color }) => <TabBarIcon icon="💬" color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <TabBarIcon icon="👤" color={color} />,
        }}
      />
    </Tabs>
  );
}

// Simple fallback text icon component (since expo-symbols was removed)
function TabBarIcon({ icon, color }: { icon: string; color: string }) {
  const colors = useThemeColor();
  const isColorActive = color === colors.tint;
  return (
    <React.Fragment>
      <Text style={{ fontSize: 24, opacity: isColorActive ? 1 : 0.6 }}>{icon}</Text>
    </React.Fragment>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    borderTopWidth: 0,
    elevation: 0,
    height: 85,
    paddingBottom: Platform.OS === 'ios' ? 25 : 10,
    backgroundColor: 'transparent',
  },
});
