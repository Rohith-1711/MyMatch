import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/auth';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useThemeColor } from '@/constants/Colors';
import { ProfilePreview } from '@/components/profile-preview';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

export default function ProfileScreen() {
  const { profile, setProfile } = useAuthStore();
  const colors = useThemeColor();
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editedProfile, setEditedProfile] = useState(profile);

  // Sync state with store if it changes elsewhere
  React.useEffect(() => {
    if (profile) {
      setEditedProfile(prev => ({
        ...prev,
        ...profile,
        drinking_habit: profile.drinking_habit || 'No', // Default if missing
        smoking_habit: profile.smoking_habit || 'No',   // Default if missing
      }));
    }
  }, [profile]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const handleSave = async () => {
    if (!profile?.id || !editedProfile) return;
    setIsSaving(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(editedProfile)
        .eq('id', profile.id)
        .select()
        .single();

      if (error) throw error;
      setProfile(data);
      alert('Changes saved! 🎉');
    } catch (err: any) {
      alert(err.message || 'Error saving changes');
    } finally {
      setIsSaving(false);
    }
  };

  const updateField = (field: string, value: any) => {
    setEditedProfile((prev: any) => ({ ...prev, [field]: value }));
  };

  const isLight = colors.background === '#ffffff';
  const bwText = isLight ? '#000000' : '#ffffff';
  const bwMuted = isLight ? '#71717a' : '#a1a1aa';
  const bwBorder = isLight ? '#e4e4e7' : '#27272a';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header with Theme Toggle in Top Left */}
      <View style={{ width: '100%', maxWidth: 600, alignSelf: 'center' }}>
        <View style={[styles.header, { borderBottomColor: bwBorder }]}>
          <View style={styles.headerLeft}>
            <ThemeToggle />
          </View>
          <Text style={[styles.headerTitle, { color: colors.text }]}>My Profile</Text>
          <TouchableOpacity
            onPress={handleSave}
            style={styles.headerRight}
            disabled={isSaving}
          >
            {isSaving ? (
              <ActivityIndicator size="small" color={colors.tint} />
            ) : (
              <Text style={[styles.saveAction, { color: colors.tint }]}>Save</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.scrollContent, { maxWidth: 600, alignSelf: 'center', width: '100%' }]}
        >
          {/* Status-style Avatar */}
          <View style={styles.avatarSection}>
            <TouchableOpacity
              onPress={() => setIsPreviewVisible(true)}
              style={[styles.avatarWrapper, { borderColor: colors.tint }]}
              activeOpacity={0.8}
            >
              {profile?.photos && profile.photos.length > 0 ? (
                <Image source={{ uri: profile.photos[0] }} style={styles.avatar} />
              ) : (
                <View style={[styles.avatarPlaceholder, { backgroundColor: colors.card }]}>
                  <Ionicons name="person-outline" size={40} color={bwMuted} />
                </View>
              )}
              <View style={[styles.previewIcon, { backgroundColor: colors.tint }]}>
                <Ionicons name="eye" size={16} color="#ffffff" />
              </View>
            </TouchableOpacity>
            <Text style={[styles.tapToPreview, { color: colors.tint }]}>Tap to preview / See how others see you</Text>
          </View>

          {/* Editable Sections */}
          <View style={styles.formSection}>

            {/* 1. Core Identity Card */}
            <View style={[styles.card, { backgroundColor: colors.card, borderColor: bwBorder }]}>
              <View style={styles.cardHeader}>
                <Ionicons name="person-circle-outline" size={20} color={colors.tint} />
                <Text style={[styles.cardTitle, { color: colors.text }]}>Core Identity</Text>
              </View>

              <View style={styles.inputItem}>
                <View style={styles.inputLabelRow}>
                  <Ionicons name="text-outline" size={16} color={bwMuted} />
                  <Text style={[styles.inputLabel, { color: bwMuted }]}>Display Name</Text>
                </View>
                <TextInput
                  style={[styles.input, { color: bwText, borderColor: bwBorder }]}
                  value={editedProfile?.name}
                  onChangeText={(v) => updateField('name', v)}
                  placeholder="Your Name"
                  placeholderTextColor={bwMuted}
                />
              </View>

              <View style={styles.inputItem}>
                <View style={styles.inputLabelRow}>
                  <Ionicons name="document-text-outline" size={16} color={bwMuted} />
                  <Text style={[styles.inputLabel, { color: bwMuted }]}>Short Bio</Text>
                </View>
                <TextInput
                  style={[styles.input, styles.textArea, { color: bwText, borderColor: bwBorder }]}
                  value={editedProfile?.bio}
                  onChangeText={(v) => updateField('bio', v)}
                  placeholder="What makes you, you?"
                  placeholderTextColor={bwMuted}
                  multiline
                  numberOfLines={4}
                />
              </View>

              <View style={styles.inputItem}>
                <View style={styles.inputLabelRow}>
                  <Ionicons name="briefcase-outline" size={16} color={bwMuted} />
                  <Text style={[styles.inputLabel, { color: bwMuted }]}>Occupation</Text>
                </View>
                <TextInput
                  style={[styles.input, { color: bwText, borderColor: bwBorder }]}
                  value={editedProfile?.occupation}
                  onChangeText={(v) => updateField('occupation', v)}
                  placeholder="What do you do?"
                  placeholderTextColor={bwMuted}
                />
              </View>
            </View>

            {/* 2. Lifestyle & Basics Card */}
            <View style={[styles.card, { backgroundColor: colors.card, borderColor: bwBorder }]}>
              <View style={styles.cardHeader}>
                <Ionicons name="navigate-outline" size={20} color={colors.tint} />
                <Text style={[styles.cardTitle, { color: colors.text }]}>Basics & Vibes</Text>
              </View>

              <View style={styles.inputItem}>
                <View style={styles.inputLabelRow}>
                  <Ionicons name="home-outline" size={16} color={bwMuted} />
                  <Text style={[styles.inputLabel, { color: bwMuted }]}>Hometown</Text>
                </View>
                <TextInput
                  style={[styles.input, { color: bwText, borderColor: bwBorder }]}
                  value={editedProfile?.hometown}
                  onChangeText={(v) => updateField('hometown', v)}
                  placeholder="Where's home?"
                  placeholderTextColor={bwMuted}
                />
              </View>

              <View style={styles.inputItem}>
                <View style={styles.inputLabelRow}>
                  <Ionicons name="star-outline" size={16} color={bwMuted} />
                  <Text style={[styles.inputLabel, { color: bwMuted }]}>Religion</Text>
                </View>
                <TextInput
                  style={[styles.input, { color: bwText, borderColor: bwBorder }]}
                  value={editedProfile?.religion}
                  onChangeText={(v) => updateField('religion', v)}
                  placeholder="Faith/Belief"
                  placeholderTextColor={bwMuted}
                />
              </View>

              <View style={styles.inputItem}>
                <View style={styles.inputLabelRow}>
                  <Ionicons name="resize-outline" size={16} color={bwMuted} />
                  <Text style={[styles.inputLabel, { color: bwMuted }]}>Height (cm)</Text>
                </View>
                <TextInput
                  style={[styles.input, { color: bwText, borderColor: bwBorder }]}
                  value={editedProfile?.height?.toString()}
                  onChangeText={(v) => updateField('height', parseInt(v) || 0)}
                  placeholder="e.g. 175"
                  placeholderTextColor={bwMuted}
                  keyboardType="numeric"
                />
              </View>
            </View>

            {/* 3. Habits Selection Card */}
            <View style={[styles.card, { backgroundColor: colors.card, borderColor: bwBorder }]}>
              <View style={styles.cardHeader}>
                <Ionicons name="wine-outline" size={20} color={colors.tint} />
                <Text style={[styles.cardTitle, { color: colors.text }]}>Lifestyle Habits</Text>
              </View>

              <View style={styles.inputItem}>
                <View style={styles.inputLabelRow}>
                  <Ionicons name="beer-outline" size={16} color={bwMuted} />
                  <Text style={[styles.inputLabel, { color: bwMuted }]}>Drinking</Text>
                </View>
                <View style={styles.chipRow}>
                  {['No', 'Sometimes', 'Yes'].map(opt => {
                    const currentVal = editedProfile?.drinking_habit || 'No';
                    const isActive = currentVal === opt;
                    return (
                      <TouchableOpacity
                        key={opt}
                        onPress={() => updateField('drinking_habit', opt)}
                        style={[
                          styles.chip,
                          { borderColor: bwBorder },
                          isActive && { borderColor: colors.tint, backgroundColor: colors.tint + '10' }
                        ]}
                      >
                        <Text style={[
                          styles.chipText,
                          { color: bwMuted },
                          isActive && { color: colors.tint, fontWeight: '800' }
                        ]}>{opt}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              <View style={styles.inputItem}>
                <View style={styles.inputLabelRow}>
                  <Ionicons name="medical-outline" size={16} color={bwMuted} />
                  <Text style={[styles.inputLabel, { color: bwMuted }]}>Smoking</Text>
                </View>
                <View style={styles.chipRow}>
                  {['No', 'Sometimes', 'Yes'].map(opt => {
                    const currentVal = editedProfile?.smoking_habit || 'No';
                    const isActive = currentVal === opt;
                    return (
                      <TouchableOpacity
                        key={opt}
                        onPress={() => updateField('smoking_habit', opt)}
                        style={[
                          styles.chip,
                          { borderColor: bwBorder },
                          isActive && { borderColor: colors.tint, backgroundColor: colors.tint + '10' }
                        ]}
                      >
                        <Text style={[
                          styles.chipText,
                          { color: bwMuted },
                          isActive && { color: colors.tint, fontWeight: '800' }
                        ]}>{opt}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            </View>

            {/* 4. Interests & Tags Card */}
            <View style={[styles.card, { backgroundColor: colors.card, borderColor: bwBorder, marginBottom: 20 }]}>
              <View style={styles.cardHeader}>
                <Ionicons name="heart-half-outline" size={20} color={colors.tint} />
                <Text style={[styles.cardTitle, { color: colors.text }]}>Interests & Fun</Text>
              </View>

              <View style={styles.inputItem}>
                <View style={styles.inputLabelRow}>
                  <Ionicons name="basketball-outline" size={16} color={bwMuted} />
                  <Text style={[styles.inputLabel, { color: bwMuted }]}>Sports</Text>
                </View>
                <TextInput
                  style={[styles.input, { color: bwText, borderColor: bwBorder }]}
                  value={editedProfile?.sports?.join(', ')}
                  onChangeText={(v) => updateField('sports', v.split(',').map(s => s.trim()).filter(Boolean))}
                  placeholder="Basketball, Tennis"
                  placeholderTextColor={bwMuted}
                />
              </View>

              <View style={styles.inputItem}>
                <View style={styles.inputLabelRow}>
                  <Ionicons name="brush-outline" size={16} color={bwMuted} />
                  <Text style={[styles.inputLabel, { color: bwMuted }]}>Hobbies</Text>
                </View>
                <TextInput
                  style={[styles.input, { color: bwText, borderColor: bwBorder }]}
                  value={editedProfile?.hobbies?.join(', ')}
                  onChangeText={(v) => updateField('hobbies', v.split(',').map(s => s.trim()).filter(Boolean))}
                  placeholder="Cooking, Painting"
                  placeholderTextColor={bwMuted}
                />
              </View>
            </View>

            {/* Logout at very bottom */}
            <TouchableOpacity onPress={handleLogout} style={[styles.logoutBtn, { borderColor: bwBorder }]}>
              <Text style={styles.logoutText}>Safe Sign Out 🔒</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Profile Preview Modal */}
      {(editedProfile || profile) && (
        <ProfilePreview
          visible={isPreviewVisible}
          onClose={() => setIsPreviewVisible(false)}
          onSave={() => {
            setIsPreviewVisible(false);
            handleSave();
          }}
          profile={(editedProfile || profile) as any}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  headerLeft: { width: 40 },
  headerRight: { width: 60, alignItems: 'flex-end' },
  headerTitle: {
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  saveAction: { fontSize: 16, fontWeight: '800' },
  scrollContent: { paddingBottom: 60 },
  avatarSection: { alignItems: 'center', paddingTop: 24, marginBottom: 12 },
  avatarWrapper: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    padding: 3,
    position: 'relative',
    marginBottom: 8,
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 45,
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    borderRadius: 45,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emoji: { fontSize: 40 },
  previewIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  tapToPreview: {
    fontSize: 13,
    fontWeight: '800',
    marginTop: 4,
    letterSpacing: -0.2,
  },
  formSection: {
    paddingHorizontal: 20,
    paddingTop: 10,
    gap: 20,
  },
  card: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 24,
    gap: 24,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10 },
      android: { elevation: 2 }
    })
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: -4,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  inputItem: {
    gap: 12,
  },
  inputLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '700',
  },
  input: {
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    fontWeight: '500',
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  chipRow: {
    flexDirection: 'row',
    gap: 12,
  },
  chip: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
  },
  chipText: {
    fontSize: 14,
    fontWeight: '600',
  },
  logoutBtn: {
    marginTop: 20,
    paddingVertical: 18,
    borderRadius: 20,
    borderWidth: 1.5,
    alignItems: 'center',
    marginBottom: 60,
  },
  logoutText: {
    color: '#ef4444',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
}); 