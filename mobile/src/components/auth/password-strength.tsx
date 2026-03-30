import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

interface PasswordStrengthProps {
  password: string;
}

function getStrength(password: string): { level: 0 | 1 | 2 | 3; label: string; color: string } {
  if (!password) return { level: 0, label: '', color: '#27272a' };
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 1) return { level: 1, label: 'Weak', color: '#ef4444' };
  if (score === 2) return { level: 2, label: 'Fair', color: '#f97316' };
  return { level: 3, label: 'Strong', color: '#22c55e' };
}

export function getRules(password: string) {
  return [
    { label: 'At least 8 characters', met: password.length >= 8 },
    { label: 'One uppercase letter', met: /[A-Z]/.test(password) },
    { label: 'One number', met: /[0-9]/.test(password) },
  ];
}

export function PasswordStrength({ password }: PasswordStrengthProps) {
  const { level, label, color } = getStrength(password);
  const widthAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(widthAnim, {
      toValue: level / 3,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [level]);

  if (!password) return null;

  const rules = getRules(password);

  return (
    <View style={styles.container}>
      {/* Bar */}
      <View style={styles.bar}>
        <Animated.View
          style={[
            styles.fill,
            {
              flex: widthAnim,
              backgroundColor: color,
            },
          ]}
        />
        <View style={{ flex: widthAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 0] }) as any }} />
      </View>
      <Text style={[styles.label, { color }]}>{label}</Text>

      {/* Rules checklist */}
      <View style={styles.rules}>
        {rules.map(rule => (
          <View key={rule.label} style={styles.ruleRow}>
            <Text style={[styles.ruleIcon, { color: rule.met ? '#22c55e' : '#52525b' }]}>
              {rule.met ? '✓' : '○'}
            </Text>
            <Text style={[styles.ruleText, { color: rule.met ? '#a1a1aa' : '#52525b' }]}>
              {rule.label}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  bar: {
    flexDirection: 'row',
    height: 4,
    backgroundColor: '#27272a',
    borderRadius: 4,
    overflow: 'hidden',
  },
  fill: {
    borderRadius: 4,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'right',
    marginTop: -4,
  },
  rules: {
    gap: 4,
  },
  ruleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ruleIcon: {
    fontSize: 13,
    fontWeight: '700',
    width: 14,
  },
  ruleText: {
    fontSize: 12,
    fontWeight: '500',
  },
});
