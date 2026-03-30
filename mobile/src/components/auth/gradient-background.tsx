import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useThemeColor } from '@/constants/Colors';

interface GradientBackgroundProps {
  children: React.ReactNode;
}

export function GradientBackground({ children }: GradientBackgroundProps) {
  const colors = useThemeColor();
  const isDark = colors.background === '#09090b';

  const gradientColors = isDark 
    ? ['#1a0010', '#09090b', '#070d1f'] as const
    : ['#fff1f2', '#ffffff', '#eef2ff'] as const;

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={gradientColors}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.blobTopRight} />
      <View style={styles.blobBottomLeft} />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
  },
  blobTopRight: {
    position: 'absolute',
    top: -120,
    right: -100,
    width: 350,
    height: 350,
    borderRadius: 175,
    backgroundColor: '#e11d48',
    opacity: 0.12,
  },
  blobBottomLeft: {
    position: 'absolute',
    bottom: -150,
    left: -100,
    width: 400,
    height: 400,
    borderRadius: 200,
    backgroundColor: '#6366f1',
    opacity: 0.1,
  },
});
