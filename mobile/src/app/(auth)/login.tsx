import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, Alert,
  ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, StyleSheet
} from 'react-native';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const router = useRouter();

  const handleAuth = async () => {
    if (!email || !password) {
      Alert.alert('Missing Fields', 'Please enter both email and password.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Weak Password', 'Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    if (isSignUp) {
      const { error, data } = await supabase.auth.signUp({ email, password });
      if (error) {
        Alert.alert('Signup Error', error.message);
      } else if (data.session) {
        router.replace('/(app)');
      } else {
        Alert.alert('Check your Email', 'Confirm your account to continue.');
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        Alert.alert('Login Error', error.message);
      } else {
        router.replace('/(app)');
      }
    }
    setLoading(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
          <View style={styles.inner}>

            {/* Logo Area */}
            <View style={styles.logoArea}>
              <View style={styles.logoIcon}>
                <Text style={styles.logoEmoji}>💘</Text>
              </View>
              <Text style={styles.appName}>MyMatch</Text>
              <Text style={styles.tagline}>
                {isSignUp ? 'Create your account' : 'Welcome back'}
              </Text>
            </View>

            {/* Card */}
            <View style={styles.card}>
              <View style={styles.field}>
                <Text style={styles.label}>Email Address</Text>
                <TextInput
                  placeholder="you@example.com"
                  placeholderTextColor="#52525b"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  style={styles.input}
                />
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>Password</Text>
                <View style={styles.passRow}>
                  <TextInput
                    placeholder="Min. 6 characters"
                    placeholderTextColor="#52525b"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPass}
                    style={[styles.input, { flex: 1, borderWidth: 0 }]}
                  />
                  <TouchableOpacity onPress={() => setShowPass(v => !v)} style={styles.eyeBtn}>
                    <Text style={styles.eyeText}>{showPass ? '🙈' : '👁'}</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity
                onPress={handleAuth}
                disabled={loading}
                style={[styles.primaryBtn, loading && { opacity: 0.6 }]}
                activeOpacity={0.85}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.primaryBtnText}>{isSignUp ? 'Create Account' : 'Sign In'}</Text>
                )}
              </TouchableOpacity>

              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>or</Text>
                <View style={styles.dividerLine} />
              </View>

              <TouchableOpacity
                onPress={() => setIsSignUp(v => !v)}
                style={styles.toggleBtn}
                activeOpacity={0.7}
              >
                <Text style={styles.toggleText}>
                  {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
                  <Text style={styles.toggleHighlight}>{isSignUp ? 'Sign In' : 'Sign Up'}</Text>
                </Text>
              </TouchableOpacity>
            </View>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#09090b' },
  inner: { flex: 1, justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 40 },
  logoArea: { alignItems: 'center', marginBottom: 40 },
  logoIcon: {
    width: 80, height: 80, borderRadius: 24,
    backgroundColor: '#2a0a1a',
    borderWidth: 1, borderColor: '#7f1d3f',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#e11d48', shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4, shadowRadius: 20,
  },
  logoEmoji: { fontSize: 36 },
  appName: { fontSize: 38, fontWeight: '900', color: '#fff', letterSpacing: -1.5, marginBottom: 6 },
  tagline: { fontSize: 16, color: '#71717a', fontWeight: '500' },
  card: {
    backgroundColor: '#18181b',
    borderRadius: 28, padding: 28,
    borderWidth: 1, borderColor: '#27272a',
    gap: 20,
  },
  field: { gap: 8 },
  label: { fontSize: 13, color: '#a1a1aa', fontWeight: '600', letterSpacing: 0.3 },
  input: {
    backgroundColor: '#09090b', borderWidth: 1, borderColor: '#27272a',
    borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14,
    color: '#fff', fontSize: 16,
  },
  passRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#09090b', borderWidth: 1, borderColor: '#27272a',
    borderRadius: 14, paddingRight: 12,
  },
  eyeBtn: { padding: 8 },
  eyeText: { fontSize: 18 },
  primaryBtn: {
    backgroundColor: '#e11d48', borderRadius: 16,
    paddingVertical: 16, alignItems: 'center',
    shadowColor: '#e11d48', shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5, shadowRadius: 16,
  },
  primaryBtnText: { color: '#fff', fontSize: 17, fontWeight: '800', letterSpacing: 0.3 },
  divider: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#27272a' },
  dividerText: { color: '#52525b', fontSize: 13, fontWeight: '500' },
  toggleBtn: { alignItems: 'center', paddingVertical: 4 },
  toggleText: { color: '#71717a', fontSize: 15 },
  toggleHighlight: { color: '#fb7185', fontWeight: '700' },
});
