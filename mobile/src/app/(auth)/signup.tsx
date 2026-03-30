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

function validateEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function SignUpScreen() {
  const colors = useThemeColor();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string; confirm?: string }>({});
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const buttonScale = useRef(new Animated.Value(1)).current;
  const pressIn = () =>
    Animated.spring(buttonScale, { toValue: 0.96, useNativeDriver: true }).start();
  const pressOut = () =>
    Animated.spring(buttonScale, { toValue: 1, useNativeDriver: true }).start();

  const validate = () => {
    const errs: { email?: string; password?: string; confirm?: string } = {};
    if (!email) errs.email = 'Email is required';
    else if (!validateEmail(email)) errs.email = 'Enter a valid email address';

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

  const handleSignUp = async () => {
    if (!validate()) return;
    setLoading(true);
    const { error, data } = await supabase.auth.signUp({ email, password });
    setLoading(false);
    if (error) {
      setErrors({ email: error.message });
    } else if (data.session) {
      // Email confirmation is OFF — session returned immediately
      router.replace('/(app)/onboarding');
    } else {
      // Shouldn't happen with confirmation OFF, but handle gracefully
      setErrors({ email: 'Account created! Please sign in.' });
    }
  };

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

            {/* Back button */}
            <TouchableOpacity onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.backIcon, { color: colors.text }]}>←</Text>
            </TouchableOpacity>

            {/* Header */}
            <View style={styles.header}>
              <Text style={[styles.title, { color: colors.text }]}>Create account</Text>
              <Text style={[styles.subtitle, { color: colors.textMuted }]}>Join MyMatch and find your person 💘</Text>
            </View>

            {/* Card */}
            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, shadowColor: '#000' }]}>
              <View style={styles.fields}>
                <AuthInput
                  label="Email Address"
                  placeholder="you@example.com"
                  value={email}
                  onChangeText={t => { setEmail(t); setErrors(e => ({ ...e, email: undefined })); }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  error={errors.email}
                />
                <AuthInput
                  label="Password"
                  placeholder="Min. 8 characters"
                  value={password}
                  onChangeText={t => { setPassword(t); setErrors(e => ({ ...e, password: undefined })); }}
                  isPassword
                  error={errors.password}
                />
                {password.length > 0 && <PasswordStrength password={password} />}

                <AuthInput
                  label="Confirm Password"
                  placeholder="Re-enter your password"
                  value={confirmPassword}
                  onChangeText={t => { setConfirmPassword(t); setErrors(e => ({ ...e, confirm: undefined })); }}
                  isPassword
                  error={errors.confirm}
                />
              </View>

              {/* Create Account Button */}
              <Pressable onPressIn={pressIn} onPressOut={pressOut} onPress={handleSignUp} disabled={loading}>
                <Animated.View style={[styles.primaryBtn, { backgroundColor: colors.tint, shadowColor: colors.tint, transform: [{ scale: buttonScale }] }, loading && styles.btnDisabled]}>
                  <Text style={styles.primaryBtnText}>
                    {loading ? 'Creating account...' : 'Create Account →'}
                  </Text>
                </Animated.View>
              </Pressable>

              {/* Terms note */}
              <Text style={[styles.termsText, { color: colors.textMuted }]}>
                By signing up, you agree to our{' '}
                <Text style={[styles.termsLink, { color: colors.text }]}>Terms of Service</Text> and{' '}
                <Text style={[styles.termsLink, { color: colors.text }]}>Privacy Policy</Text>
              </Text>

              {/* Divider */}
              <View style={styles.divider}>
                <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
                <Text style={styles.dividerText}>or</Text>
                <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
              </View>

              {/* Switch to Sign In */}
              <TouchableOpacity
                onPress={() => router.replace('/(auth)/login')}
                style={styles.switchBtn}>
                <Text style={styles.switchText}>
                  Already have an account?{' '}
                  <Text style={[styles.switchHighlight, { color: colors.tint }]}>Sign In</Text>
                </Text>
              </TouchableOpacity>
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
    marginBottom: 24,
    borderWidth: 1,
  },
  backIcon: { fontSize: 20, fontWeight: '600' },

  header: { marginBottom: 28 },
  title: { fontSize: 34, fontWeight: '900', letterSpacing: -1, marginBottom: 8 },
  subtitle: { fontSize: 16, fontWeight: '500' },

  card: {
    borderRadius: 28,
    padding: 28,
    borderWidth: 1,
    gap: 20,
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.1,
    shadowRadius: 40,
    elevation: 10,
  },
  fields: { gap: 16 },

  primaryBtn: {
    borderRadius: 18,
    paddingVertical: 17,
    alignItems: 'center',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 12,
  },
  btnDisabled: { opacity: 0.6 },
  primaryBtnText: { color: '#fff', fontSize: 17, fontWeight: '800', letterSpacing: 0.3 },

  termsText: { fontSize: 12, textAlign: 'center', lineHeight: 18 },
  termsLink: { fontWeight: '600' },

  divider: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  dividerLine: { flex: 1, height: 1 },
  dividerText: { color: '#52525b', fontSize: 13, fontWeight: '500' },

  switchBtn: { alignItems: 'center', paddingVertical: 4 },
  switchText: { color: '#71717a', fontSize: 15 },
  switchHighlight: { fontWeight: '700' },
});
