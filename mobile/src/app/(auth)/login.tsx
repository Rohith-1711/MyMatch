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
import { ThemeToggle } from '@/components/ThemeToggle';
import { useThemeColor } from '@/constants/Colors';
import { supabase } from '@/lib/supabase';

function validateEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const colors = useThemeColor();

  const buttonScale = useRef(new Animated.Value(1)).current;

  const pressIn = () =>
    Animated.spring(buttonScale, { toValue: 0.96, useNativeDriver: true }).start();
  const pressOut = () =>
    Animated.spring(buttonScale, { toValue: 1, useNativeDriver: true }).start();

  const validate = () => {
    const errs: { email?: string; password?: string } = {};
    if (!email) errs.email = 'Email is required';
    else if (!validateEmail(email)) errs.email = 'Enter a valid email address';
    if (!password) errs.password = 'Password is required';
    else if (password.length < 6) errs.password = 'Password must be at least 6 characters';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSignIn = async () => {
    if (!validate()) return;
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setErrors({ password: error.message });
    } else {
      router.replace('/(app)/(tabs)');
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

            {/* Top Bar with Theme Toggle */}
            <View style={styles.topBar}>
              <ThemeToggle />
            </View>

            {/* Logo */}
            <View style={styles.logoArea}>
              <View style={[styles.logoRing, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={styles.logoEmoji}>💘</Text>
              </View>
              <Text style={[styles.appName, { color: colors.text }]}>MyMatch</Text>
              <Text style={[styles.tagline, { color: colors.textMuted }]}>Find your perfect match ✨</Text>
            </View>

            {/* Card */}
            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.cardTitle, { color: colors.text }]}>Welcome back</Text>
              <Text style={[styles.cardSubtitle, { color: colors.textMuted }]}>Sign in to continue</Text>

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
                  placeholder="Your password"
                  value={password}
                  onChangeText={t => { setPassword(t); setErrors(e => ({ ...e, password: undefined })); }}
                  isPassword
                  error={errors.password}
                />

                <TouchableOpacity
                  onPress={() => router.push('/(auth)/forgot-password')}
                  style={styles.forgotBtn}>
                  <Text style={styles.forgotText}>Forgot password?</Text>
                </TouchableOpacity>
              </View>

              {/* Sign In Button */}
              <Pressable onPressIn={pressIn} onPressOut={pressOut} onPress={handleSignIn} disabled={loading}>
                <Animated.View style={[styles.primaryBtn, { backgroundColor: colors.tint, shadowColor: colors.tint, transform: [{ scale: buttonScale }] }, loading && styles.btnDisabled]}>
                  {loading ? (
                    <Text style={styles.primaryBtnText}>Signing in...</Text>
                  ) : (
                    <Text style={styles.primaryBtnText}>Sign In →</Text>
                  )}
                </Animated.View>
              </Pressable>

              {/* Divider */}
              <View style={styles.divider}>
                <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
                <Text style={[styles.dividerText, { color: colors.textMuted }]}>or</Text>
                <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
              </View>

              {/* Switch to Sign Up */}
              <TouchableOpacity
                onPress={() => router.push('/(auth)/signup')}
                style={styles.switchBtn}>
                <Text style={[styles.switchText, { color: colors.textMuted }]}>
                  New here?{' '}
                  <Text style={styles.switchHighlight}>Create an account</Text>
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
  scroll: { flexGrow: 1, paddingHorizontal: 24, paddingVertical: 40 },

  topBar: { flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 20 },
  logoArea: { alignItems: 'center', marginBottom: 36 },
  logoRing: {
    width: 88,
    height: 88,
    borderRadius: 28,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 8,
  },
  logoEmoji: { fontSize: 40 },
  appName: {
    fontSize: 40,
    fontWeight: '900',
    letterSpacing: -1.5,
    marginBottom: 6,
  },
  tagline: { fontSize: 15, fontWeight: '500' },

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
  cardTitle: {
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  cardSubtitle: {
    fontSize: 15,
    marginTop: -14,
  },
  fields: { gap: 16 },
  forgotBtn: { alignSelf: 'flex-end', marginTop: -4 },
  forgotText: { fontSize: 13, color: '#fb7185', fontWeight: '600' },

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

  divider: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  dividerLine: { flex: 1, height: 1 },
  dividerText: { fontSize: 13, fontWeight: '500' },

  switchBtn: { alignItems: 'center', paddingVertical: 4 },
  switchText: { fontSize: 15 },
  switchHighlight: { color: '#fb7185', fontWeight: '700' },
});
