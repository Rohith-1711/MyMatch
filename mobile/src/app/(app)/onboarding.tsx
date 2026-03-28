import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, Alert,
  ActivityIndicator, ScrollView, StyleSheet, KeyboardAvoidingView, Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/auth';
import { useRouter } from 'expo-router';

const INTENTS = [
  { type: 'dating' as const, label: '❤️ Dating', desc: 'Looking for romance' },
  { type: 'platonic' as const, label: '🤝 Friends', desc: 'New friendships' },
  { type: 'both' as const, label: '✨ Both', desc: 'Open to anything' },
];

export default function OnboardingScreen() {
  const { session, setProfile } = useAuthStore();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [intent, setIntent] = useState<'dating' | 'platonic' | 'both'>('dating');
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSaveProfile = async () => {
    if (!name.trim()) { Alert.alert('Required', 'Please enter your name.'); return; }
    if (!location.trim()) { Alert.alert('Required', 'Please enter your location.'); return; }
    if (!session?.user) return;

    setLoading(true);
    const newProfile = {
      user_id: session.user.id,
      name: name.trim(),
      bio: bio.trim(),
      intent,
      general_location: location.trim(),
      is_precise_location_opted_in: false,
      photos: [],
    };

    const { data, error } = await supabase
      .from('profiles')
      .upsert([newProfile], { onConflict: 'user_id' })
      .select()
      .single();

    setLoading(false);
    if (error) { Alert.alert('Error', error.message); }
    else { setProfile(data); router.replace('/(app)/photos'); }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>

          {/* Progress Bar */}
          <View style={styles.progressContainer}>
            {[0, 1, 2].map(i => (
              <View key={i} style={[styles.progressDot, step >= i && styles.progressDotActive]} />
            ))}
          </View>

          <View style={styles.content}>
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.stepBadge}>
                <Text style={styles.stepText}>Step {step + 1} of 3</Text>
              </View>
              <Text style={styles.title}>
                {step === 0 ? 'Who are you?' : step === 1 ? 'Your vibe 🎯' : 'Where are you?'}
              </Text>
              <Text style={styles.subtitle}>
                {step === 0 ? 'Tell us about yourself' : step === 1 ? "What are you looking for?" : 'Help us find people near you'}
              </Text>
            </View>

            {/* Step 0: Name + Bio */}
            {step === 0 && (
              <View style={styles.fields}>
                <View style={styles.field}>
                  <Text style={styles.label}>Your Name</Text>
                  <TextInput
                    placeholder="What should people call you?"
                    placeholderTextColor="#52525b"
                    value={name}
                    onChangeText={setName}
                    style={styles.input}
                  />
                </View>
                <View style={styles.field}>
                  <Text style={styles.label}>Bio <Text style={styles.optional}>(Optional)</Text></Text>
                  <TextInput
                    placeholder="Write something interesting about yourself..."
                    placeholderTextColor="#52525b"
                    value={bio}
                    onChangeText={setBio}
                    multiline
                    numberOfLines={4}
                    style={[styles.input, styles.textArea]}
                    textAlignVertical="top"
                  />
                  <Text style={styles.hint}>{bio.length}/200 characters</Text>
                </View>
              </View>
            )}

            {/* Step 1: Intent */}
            {step === 1 && (
              <View style={styles.intentGrid}>
                {INTENTS.map(({ type, label, desc }) => (
                  <TouchableOpacity
                    key={type}
                    onPress={() => setIntent(type)}
                    style={[styles.intentCard, intent === type && styles.intentCardActive]}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.intentLabel}>{label}</Text>
                    <Text style={[styles.intentDesc, intent === type && styles.intentDescActive]}>{desc}</Text>
                    {intent === type && <View style={styles.intentCheck}><Text style={{ color: '#fff', fontSize: 11, fontWeight: '800' }}>✓</Text></View>}
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Step 2: Location */}
            {step === 2 && (
              <View style={styles.fields}>
                <View style={styles.field}>
                  <Text style={styles.label}>City / Neighborhood</Text>
                  <TextInput
                    placeholder="e.g. Mumbai, India"
                    placeholderTextColor="#52525b"
                    value={location}
                    onChangeText={setLocation}
                    style={styles.input}
                  />
                  <Text style={styles.hint}>🔒 Only your general area is shared — never your exact address.</Text>
                </View>
              </View>
            )}

            {/* Navigation */}
            <View style={styles.navRow}>
              {step > 0 && (
                <TouchableOpacity onPress={() => setStep(s => s - 1)} style={styles.backBtn}>
                  <Text style={styles.backBtnText}>← Back</Text>
                </TouchableOpacity>
              )}
              {step < 2 ? (
                <TouchableOpacity
                  onPress={() => {
                    if (step === 0 && !name.trim()) { Alert.alert('Required', 'Please enter your name.'); return; }
                    setStep(s => s + 1);
                  }}
                  style={[styles.primaryBtn, { flex: 1 }]}
                  activeOpacity={0.85}
                >
                  <Text style={styles.primaryBtnText}>Continue →</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  onPress={handleSaveProfile}
                  disabled={loading}
                  style={[styles.primaryBtn, { flex: 1 }, loading && { opacity: 0.6 }]}
                  activeOpacity={0.85}
                >
                  {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryBtnText}>Save Profile 🎉</Text>}
                </TouchableOpacity>
              )}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#09090b' },
  progressContainer: { flexDirection: 'row', justifyContent: 'center', gap: 8, paddingTop: 20, paddingBottom: 8 },
  progressDot: { width: 60, height: 4, borderRadius: 2, backgroundColor: '#27272a' },
  progressDotActive: { backgroundColor: '#e11d48' },
  content: { flex: 1, paddingHorizontal: 24, paddingBottom: 40, gap: 32 },
  header: { gap: 8, marginTop: 24 },
  stepBadge: {
    alignSelf: 'flex-start', backgroundColor: '#2a0a1a',
    borderRadius: 20, paddingHorizontal: 12, paddingVertical: 4,
    borderWidth: 1, borderColor: '#7f1d3f',
  },
  stepText: { color: '#fb7185', fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },
  title: { fontSize: 32, fontWeight: '900', color: '#fff', letterSpacing: -1 },
  subtitle: { fontSize: 15, color: '#71717a' },
  fields: { gap: 20 },
  field: { gap: 8 },
  label: { fontSize: 13, color: '#a1a1aa', fontWeight: '600', letterSpacing: 0.3 },
  optional: { color: '#52525b', fontWeight: '400' },
  input: {
    backgroundColor: '#18181b', borderWidth: 1, borderColor: '#27272a',
    borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14,
    color: '#fff', fontSize: 16,
  },
  textArea: { minHeight: 120 },
  hint: { fontSize: 12, color: '#52525b', marginTop: 4 },
  intentGrid: { gap: 12 },
  intentCard: {
    backgroundColor: '#18181b', borderWidth: 1, borderColor: '#27272a',
    borderRadius: 20, padding: 20, position: 'relative',
  },
  intentCardActive: { backgroundColor: '#1f0a15', borderColor: '#e11d48' },
  intentLabel: { fontSize: 17, fontWeight: '800', color: '#fff', marginBottom: 4 },
  intentDesc: { fontSize: 14, color: '#71717a' },
  intentDescActive: { color: '#fb7185' },
  intentCheck: {
    position: 'absolute', top: 12, right: 12,
    width: 24, height: 24, borderRadius: 12, backgroundColor: '#e11d48',
    alignItems: 'center', justifyContent: 'center',
  },
  navRow: { flexDirection: 'row', gap: 12 },
  backBtn: {
    backgroundColor: '#18181b', borderWidth: 1, borderColor: '#27272a',
    borderRadius: 16, paddingVertical: 16, paddingHorizontal: 20,
    alignItems: 'center', justifyContent: 'center',
  },
  backBtnText: { color: '#a1a1aa', fontSize: 15, fontWeight: '600' },
  primaryBtn: {
    backgroundColor: '#e11d48', borderRadius: 16,
    paddingVertical: 16, alignItems: 'center',
    shadowColor: '#e11d48', shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4, shadowRadius: 16,
  },
  primaryBtnText: { color: '#fff', fontSize: 17, fontWeight: '800' },
});
