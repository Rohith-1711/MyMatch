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
import { supabase } from '@/lib/supabase';
import { useThemeColor } from '@/constants/Colors';

function validateEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function ForgotPasswordScreen() {
  const colors = useThemeColor();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const buttonScale = useRef(new Animated.Value(1)).current;
  const pressIn = () =>
    Animated.spring(buttonScale, { toValue: 0.96, useNativeDriver: true }).start();
  const pressOut = () =>
    Animated.spring(buttonScale, { toValue: 1, useNativeDriver: true }).start();

  const handleSend = async () => {
    if (!email) { setError('Email is required'); return; }
    if (!validateEmail(email)) { setError('Enter a valid email address'); return; }
    setError('');
    setLoading(true);

    // resetPasswordForEmail sends a 6-digit OTP to the user's email.
    // We navigate to the verify screen regardless — if the email isn't
    // registered, the OTP verify step will catch it with an error.
    const { error: err } = await supabase.auth.resetPasswordForEmail(email);
    setLoading(false);

    if (err) {
      setError(err.message);
    } else {
      router.push({ pathname: '/(auth)/verify', params: { email, mode: 'reset' } });
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

            {/* Back */}
            <TouchableOpacity onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.backIcon, { color: colors.text }]}>←</Text>
            </TouchableOpacity>

            {/* Icon */}
            <View style={[styles.iconWrap, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={styles.icon}>🔑</Text>
            </View>

            <Text style={[styles.title, { color: colors.text }]}>Forgot password?</Text>
            <Text style={[styles.subtitle, { color: colors.textMuted }]}>
              Enter your registered email and we'll send you an 8-digit reset code.
            </Text>

            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <AuthInput
                label="Email Address"
                placeholder="you@example.com"
                value={email}
                onChangeText={t => { setEmail(t); setError(''); }}
                keyboardType="email-address"
                autoCapitalize="none"
                error={error}
              />

              <View style={styles.infoBox}>
                <Text style={styles.infoText}>
                  📬  An 8-digit code will be sent to your email. Check your inbox (and spam folder).
                </Text>
              </View>

              <Pressable
                onPressIn={pressIn}
                onPressOut={pressOut}
                onPress={handleSend}
                disabled={loading}>
                <Animated.View
                  style={[
                    styles.primaryBtn,
                    { backgroundColor: colors.tint, shadowColor: colors.tint, transform: [{ scale: buttonScale }] },
                    loading && styles.btnDisabled,
                  ]}>
                  <Text style={styles.primaryBtnText}>
                    {loading ? 'Sending code...' : 'Send Reset Code →'}
                  </Text>
                </Animated.View>
              </Pressable>

              <TouchableOpacity
                onPress={() => router.replace('/(auth)/signup')}
                style={styles.noAccountBtn}>
                <Text style={styles.noAccountText}>
                  Don't have an account?{' '}
                  <Text style={styles.noAccountHighlight}>Sign Up</Text>
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              onPress={() => router.replace('/(auth)/login')}
              style={styles.backToLogin}>
              <Text style={styles.backToLoginText}>← Back to Sign In</Text>
            </TouchableOpacity>

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
    shadowOpacity: 0.2,
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

  infoBox: {
    backgroundColor: 'rgba(99,102,241,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(99,102,241,0.2)',
    borderRadius: 14,
    padding: 14,
  },
  infoText: {
    color: '#6366f1',
    fontSize: 13,
    lineHeight: 20,
    fontWeight: '500',
  },

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

  noAccountBtn: { alignItems: 'center' },
  noAccountText: { fontSize: 14 },
  noAccountHighlight: { color: '#fb7185', fontWeight: '700' },

  backToLogin: { alignItems: 'center', marginTop: 28 },
  backToLoginText: { fontSize: 14, fontWeight: '600' },
});
