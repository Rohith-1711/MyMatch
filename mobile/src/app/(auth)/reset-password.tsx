import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
  Animated,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AuthInput } from '@/components/auth/auth-input';
import { GradientBackground } from '@/components/auth/gradient-background';
import { PasswordStrength, getRules } from '@/components/auth/password-strength';
import { supabase } from '@/lib/supabase';
import { useThemeColor } from '@/constants/Colors';

export default function ResetPasswordScreen() {
  const colors = useThemeColor();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<{ password?: string; confirm?: string }>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const buttonScale = useRef(new Animated.Value(1)).current;
  const pressIn = () =>
    Animated.spring(buttonScale, { toValue: 0.96, useNativeDriver: true }).start();
  const pressOut = () =>
    Animated.spring(buttonScale, { toValue: 1, useNativeDriver: true }).start();

  const validate = () => {
    const errs: { password?: string; confirm?: string } = {};
    const rules = getRules(password);
    if (!password) errs.password = 'Password is required';
    else if (!rules[0].met) errs.password = 'Password must be at least 8 characters';
    else if (!rules[1].met) errs.password = 'Add at least one uppercase letter';
    else if (!rules[2].met) errs.password = 'Add at least one number';

    if (!confirmPassword) errs.confirm = 'Please confirm your password';
    else if (confirmPassword !== password) errs.confirm = 'Passwords do not match';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleReset = async () => {
    if (!validate()) return;
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      setErrors({ password: error.message });
    } else {
      setSuccess(true);
    }
  };

  if (success) {
    return (
      <GradientBackground>
        <SafeAreaView style={styles.safe}>
          <View style={styles.successContainer}>
            <View style={[styles.successIcon, { backgroundColor: colors.card, borderColor: colors.border, shadowColor: colors.tint }]}>
              <Text style={styles.successEmoji}>🎉</Text>
            </View>
            <Text style={[styles.successTitle, { color: colors.text }]}>Password updated!</Text>
            <Text style={[styles.successSubtitle, { color: colors.textMuted }]}>
              Your password has been reset successfully. Please sign in with your new password.
            </Text>
            <Pressable onPress={() => router.replace('/(auth)/login')}>
              <View style={[styles.primaryBtn, { backgroundColor: colors.tint, shadowColor: colors.tint }]}>
                <Text style={styles.primaryBtnText}>Back to Sign In →</Text>
              </View>
            </Pressable>
          </View>
        </SafeAreaView>
      </GradientBackground>
    );
  }

  return (
    <GradientBackground>
      <SafeAreaView style={styles.safe}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}>
          <ScrollView
            contentContainerStyle={styles.scroll}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled">

            {/* Back */}
            <TouchableOpacity onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.backIcon, { color: colors.text }]}>←</Text>
            </TouchableOpacity>

            {/* Icon */}
            <View style={[styles.iconWrap, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={styles.icon}>🔒</Text>
            </View>

            <Text style={[styles.title, { color: colors.text }]}>New password</Text>
            <Text style={[styles.subtitle, { color: colors.textMuted }]}>
              Almost there! Choose a strong new password for your account.
            </Text>

            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.fields}>
                <AuthInput
                  label="New Password"
                  placeholder="Min. 8 characters"
                  value={password}
                  onChangeText={t => { setPassword(t); setErrors(e => ({ ...e, password: undefined })); }}
                  isPassword
                  error={errors.password}
                />
                {password.length > 0 && <PasswordStrength password={password} />}

                <AuthInput
                  label="Confirm New Password"
                  placeholder="Re-enter your password"
                  value={confirmPassword}
                  onChangeText={t => { setConfirmPassword(t); setErrors(e => ({ ...e, confirm: undefined })); }}
                  isPassword
                  error={errors.confirm}
                />
              </View>

              <Pressable onPressIn={pressIn} onPressOut={pressOut} onPress={handleReset} disabled={loading}>
                <Animated.View style={[styles.primaryBtn, { backgroundColor: colors.tint, shadowColor: colors.tint, transform: [{ scale: buttonScale }] }, loading && styles.btnDisabled]}>
                  <Text style={styles.primaryBtnText}>
                    {loading ? 'Updating password...' : 'Reset Password →'}
                  </Text>
                </Animated.View>
              </Pressable>
            </View>

          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { flexGrow: 1, paddingHorizontal: 24, paddingVertical: 32 },

  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
    borderWidth: 1,
  },
  backIcon: { fontSize: 20, fontWeight: '600' },

  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: 22,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 4,
  },
  icon: { fontSize: 32 },

  title: { fontSize: 30, fontWeight: '900', letterSpacing: -1, marginBottom: 10 },
  subtitle: { fontSize: 15, lineHeight: 22, marginBottom: 28 },

  card: {
    borderRadius: 28,
    padding: 28,
    borderWidth: 1,
    gap: 20,
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.1,
    shadowRadius: 40,
    elevation: 8,
  },
  fields: { gap: 16 },

  primaryBtn: {
    borderRadius: 18,
    paddingVertical: 17,
    alignItems: 'center',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 8,
  },
  btnDisabled: { opacity: 0.6 },
  primaryBtnText: { color: '#fff', fontSize: 17, fontWeight: '800', letterSpacing: 0.3 },

  successContainer: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
  },
  successIcon: {
    width: 100,
    height: 100,
    borderRadius: 30,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 10,
  },
  successEmoji: { fontSize: 48 },
  successTitle: { fontSize: 32, fontWeight: '900', textAlign: 'center' },
  successSubtitle: { fontSize: 16, textAlign: 'center', lineHeight: 24, maxWidth: 300 },
});
