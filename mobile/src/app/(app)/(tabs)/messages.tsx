import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColor } from '@/constants/Colors';

export default function MessagesScreen() {
  const colors = useThemeColor();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <Text style={styles.emoji}>💬</Text>
        <Text style={[styles.title, { color: colors.text }]}>Messages</Text>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>Chat with your matches</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  emoji: { fontSize: 64 },
  title: { fontSize: 24, fontWeight: '800' },
  subtitle: { fontSize: 15 },
});
