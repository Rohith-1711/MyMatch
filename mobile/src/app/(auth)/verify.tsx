import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { GradientBackground } from '@/components/auth/gradient-background';
import { OtpInput } from '@/components/auth/otp-input';
import { supabase } from '@/lib/supabase';
import { useThemeColor } from '@/constants/Colors';

const OTP_EXPIRY_SECS = 300; // 5 minutes

export default function VerifyScreen() {
  const colors = useThemeColor();
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [countdown, setCountdown] = useState(OTP_EXPIRY_SECS);
  const [attempts, setAttempts] = useState(0);

  const router = useRouter();
  const { email, mode } = useLocalSearchParams<{ email: string; mode?: string }>();
  const isReset = mode === 'reset';

  const buttonScale = useRef(new Animated.Value(1)).current;
  const pressIn = () =>
    Animated.spring(buttonScale, { toValue: 0.96, useNativeDriver: true }).start();
  const pressOut = () =>
    Animated.spring(buttonScale, { toValue: 1, useNativeDriver: true }).start();

  // Countdown timer
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => setCountdown(c => c - 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleVerify = async () => {
    if (otp.length < 8) { setError('Please enter the full 8-digit code'); return; }
    if (attempts >= 5) { setError('Too many attempts. Please request a new code.'); return; }

    setLoading(true);
    setError('');
    setHasError(false);

    const type = isReset ? 'recovery' : 'email';
    const { error: err } = await supabase.auth.verifyOtp({
      email: email as string,
      token: otp,
      type,
    });

    setLoading(false);

    if (err) {
      setAttempts(a => a + 1);
      setHasError(true);
      setError(err.message);
      setTimeout(() => setHasError(false), 1000);
    } else {
      if (isReset) {
        router.replace('/(auth)/reset-password');
      } else {
        router.replace('/(app)/(tabs)');
      }
    }
  };

  const handleResend = async () => {
    setCountdown(OTP_EXPIRY_SECS);
    setAttempts(0);
    setError('');
    setOtp('');
    if (isReset) {
      await supabase.auth.resetPasswordForEmail(email as string);
    }
  };

  return (
    <GradientBackground>
      <SafeAreaView style={styles.safe}>
        <View style={styles.container}>

          {/* Back */}
          <TouchableOpacity onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.backIcon, { color: colors.text }]}>←</Text>
          </TouchableOpacity>

          {/* Icon */}
          <View style={[styles.iconWrap, { backgroundColor: colors.card, borderColor: colors.border, shadowColor: colors.tint }]}>
            <Text style={styles.icon}>✉️</Text>
          </View>

          <Text style={[styles.title, { color: colors.text }]}>Enter the code</Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>
            We sent an 8-digit code to{'\n'}
            <Text style={styles.emailHighlight}>{email}</Text>
          </Text>

          {/* OTP Input */}
          <View style={styles.otpWrap}>
            <OtpInput value={otp} onChange={setOtp} hasError={hasError} />
          </View>

          {/* Error */}
          {error ? (
            <View style={[styles.errorBox, { borderColor: colors.error }]}>
              <Text style={[styles.errorText, { color: colors.error }]}>⚠ {error}</Text>
            </View>
          ) : null}

          {/* Countdown */}
          <View style={styles.timerRow}>
            {countdown > 0 ? (
              <Text style={[styles.timerText, { color: colors.textMuted }]}>
                Code expires in{' '}
                <Text style={[styles.timerNum, { color: colors.text }, countdown < 60 && styles.timerUrgent]}>
                  {formatTime(countdown)}
                </Text>
              </Text>
            ) : (
              <Text style={styles.timerExpired}>Code expired</Text>
            )}
          </View>

          {/* Verify Button */}
          <Pressable
            onPressIn={pressIn}
            onPressOut={pressOut}
            onPress={handleVerify}
            disabled={loading || otp.length < 8}>
            <Animated.View
              style={[
                styles.primaryBtn,
                { backgroundColor: colors.tint, shadowColor: colors.tint, transform: [{ scale: buttonScale }] },
                (loading || otp.length < 8) && styles.btnDisabled,
              ]}>
              <Text style={styles.primaryBtnText}>
                {loading ? 'Verifying...' : 'Verify Code →'}
              </Text>
            </Animated.View>
          </Pressable>

          {/* Resend */}
          <TouchableOpacity onPress={handleResend} style={styles.resendBtn} disabled={countdown > 0}>
            <Text style={[styles.resendText, { color: colors.textMuted }, countdown > 0 && styles.resendDisabled]}>
              Didn't get a code?{' '}
              <Text style={countdown > 0 ? styles.resendDisabled : [styles.resendHighlight, { color: colors.tint }]}>
                Resend
              </Text>
            </Text>
          </TouchableOpacity>

          {/* Attempt counter */}
          {attempts > 0 && (
            <Text style={styles.attemptText}>
              {5 - attempts} attempt{5 - attempts !== 1 ? 's' : ''} remaining
            </Text>
          )}

        </View>
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: { flex: 1, paddingHorizontal: 24, paddingVertical: 32 },

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
    shadowOpacity: 0.3,
    shadowRadius: 16,
  },
  icon: { fontSize: 32 },

  title: { fontSize: 30, fontWeight: '900', letterSpacing: -1, marginBottom: 10 },
  subtitle: { fontSize: 15, lineHeight: 22, marginBottom: 36 },
  emailHighlight: { color: '#fb7185', fontWeight: '700' },

  otpWrap: { marginBottom: 24 },

  errorBox: {
    backgroundColor: '#1a0000',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  errorText: { fontSize: 13, fontWeight: '600', textAlign: 'center' },

  timerRow: { alignItems: 'center', marginBottom: 28 },
  timerText: { fontSize: 14 },
  timerNum: { fontWeight: '700' },
  timerUrgent: { color: '#ef4444' },
  timerExpired: { color: '#ef4444', fontWeight: '700', fontSize: 14 },

  primaryBtn: {
    borderRadius: 18,
    paddingVertical: 17,
    alignItems: 'center',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 12,
    marginBottom: 20,
  },
  btnDisabled: { opacity: 0.5 },
  primaryBtnText: { color: '#fff', fontSize: 17, fontWeight: '800', letterSpacing: 0.3 },

  resendBtn: { alignItems: 'center' },
  resendText: { fontSize: 14 },
  resendDisabled: { color: '#3f3f46' },
  resendHighlight: { fontWeight: '700' },

  attemptText: { color: '#f97316', fontSize: 12, fontWeight: '600', textAlign: 'center', marginTop: 12 },
});
