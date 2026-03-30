import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/auth';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useThemeColor } from '@/constants/Colors';
import { ProfilePreview } from '@/components/profile-preview';
import { Ionicons } from '@expo/vector-icons';

export default function ProfileScreen() {
  const { profile, setProfile } = useAuthStore();
  const colors = useThemeColor();
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editedProfile, setEditedProfile] = useState(profile);

  // Sync state with store if it changes elsewhere
  React.useEffect(() => {
    if (profile) setEditedProfile(profile);
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

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView 
          showsVerticalScrollIndicator={false} 
          contentContainerStyle={styles.scrollContent}
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
                  <Text style={styles.emoji}>👤</Text>
                </View>
              )}
              <View style={[styles.previewIcon, { backgroundColor: colors.tint }]}>
                <Ionicons name="eye" size={16} color="#ffffff" />
              </View>
            </TouchableOpacity>
            <Text style={[styles.tapToPreview, { color: bwMuted }]}>Tap photo to preview profile</Text>
          </View>

          {/* Editable Fields */}
          <View style={styles.formSection}>
            <Text style={[styles.sectionTitle, { color: bwMuted }]}>Core Identity</Text>
            
            <View style={styles.inputWrap}>
              <Text style={[styles.inputLabel, { color: bwMuted }]}>Name</Text>
              <TextInput 
                style={[styles.input, { color: bwText, borderColor: bwBorder }]}
                value={editedProfile?.name}
                onChangeText={(v) => updateField('name', v)}
                placeholder="Enter your name"
                placeholderTextColor={bwMuted}
              />
            </View>

            <View style={styles.inputWrap}>
              <Text style={[styles.inputLabel, { color: bwMuted }]}>Bio</Text>
              <TextInput 
                style={[styles.input, styles.textArea, { color: bwText, borderColor: bwBorder }]}
                value={editedProfile?.bio}
                onChangeText={(v) => updateField('bio', v)}
                placeholder="Tell us about yourself..."
                placeholderTextColor={bwMuted}
                multiline
                numberOfLines={4}
              />
            </View>

            <View style={styles.inputWrap}>
              <Text style={[styles.inputLabel, { color: bwMuted }]}>Occupation</Text>
              <TextInput 
                style={[styles.input, { color: bwText, borderColor: bwBorder }]}
                value={editedProfile?.occupation}
                onChangeText={(v) => updateField('occupation', v)}
                placeholder="e.g. Software Engineer"
                placeholderTextColor={bwMuted}
              />
            </View>

            <Text style={[styles.sectionTitle, { color: bwMuted, marginTop: 20 }]}>Lifestyle & Basics</Text>

            <View style={styles.inputWrap}>
              <Text style={[styles.inputLabel, { color: bwMuted }]}>Hometown</Text>
              <TextInput 
                style={[styles.input, { color: bwText, borderColor: bwBorder }]}
                value={editedProfile?.hometown}
                onChangeText={(v) => updateField('hometown', v)}
                placeholder="Where are you from?"
                placeholderTextColor={bwMuted}
              />
            </View>

            <View style={styles.inputWrap}>
              <Text style={[styles.inputLabel, { color: bwMuted }]}>Religion</Text>
              <TextInput 
                style={[styles.input, { color: bwText, borderColor: bwBorder }]}
                value={editedProfile?.religion}
                onChangeText={(v) => updateField('religion', v)}
                placeholder="Optional"
                placeholderTextColor={bwMuted}
              />
            </View>

            <View style={styles.inputWrap}>
              <Text style={[styles.inputLabel, { color: bwMuted }]}>Height (cm)</Text>
              <TextInput 
                style={[styles.input, { color: bwText, borderColor: bwBorder }]}
                value={editedProfile?.height?.toString()}
                onChangeText={(v) => updateField('height', parseInt(v) || 0)}
                placeholder="Height in cm"
                placeholderTextColor={bwMuted}
                keyboardType="numeric"
              />
            </View>

            {/* Habits (Simplified Selection) */}
            <View style={styles.inputWrap}>
              <Text style={[styles.inputLabel, { color: bwMuted }]}>Drinking Habit</Text>
              <View style={styles.chipRow}>
                {['No', 'Sometimes', 'Yes'].map(opt => (
                  <TouchableOpacity 
                    key={opt}
                    onPress={() => updateField('drinking_habit', opt)}
                    style={[styles.chip, { borderColor: bwBorder }, editedProfile?.drinking_habit === opt && { backgroundColor: bwText }]}
                  >
                    <Text style={[styles.chipText, { color: editedProfile?.drinking_habit === opt ? colors.background : bwText }]}>{opt}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputWrap}>
              <Text style={[styles.inputLabel, { color: bwMuted }]}>Smoking Habit</Text>
              <View style={styles.chipRow}>
                {['No', 'Sometimes', 'Yes'].map(opt => (
                  <TouchableOpacity 
                    key={opt}
                    onPress={() => updateField('smoking_habit', opt)}
                    style={[styles.chip, { borderColor: bwBorder }, editedProfile?.smoking_habit === opt && { backgroundColor: bwText }]}
                  >
                    <Text style={[styles.chipText, { color: editedProfile?.smoking_habit === opt ? colors.background : bwText }]}>{opt}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <Text style={[styles.sectionTitle, { color: bwMuted, marginTop: 20 }]}>Interests & Tags</Text>

            <View style={styles.inputWrap}>
              <Text style={[styles.inputLabel, { color: bwMuted }]}>Sports (comma separated)</Text>
              <TextInput 
                style={[styles.input, { color: bwText, borderColor: bwBorder }]}
                value={editedProfile?.sports?.join(', ')}
                onChangeText={(v) => updateField('sports', v.split(',').map(s => s.trim()).filter(Boolean))}
                placeholder="Basketball, Soccer, etc."
                placeholderTextColor={bwMuted}
              />
            </View>

            <View style={styles.inputWrap}>
              <Text style={[styles.inputLabel, { color: bwMuted }]}>Hobbies (comma separated)</Text>
              <TextInput 
                style={[styles.input, { color: bwText, borderColor: bwBorder }]}
                value={editedProfile?.hobbies?.join(', ')}
                onChangeText={(v) => updateField('hobbies', v.split(',').map(s => s.trim()).filter(Boolean))}
                placeholder="Reading, Cooking, etc."
                placeholderTextColor={bwMuted}
              />
            </View>

            {/* Logout at bottom of form */}
            <TouchableOpacity onPress={handleLogout} style={[styles.logoutBtn, { borderColor: bwBorder }]}>
              <Text style={styles.logoutText}>Log Out Account</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Profile Preview Modal */}
      {profile && (
        <ProfilePreview 
          visible={isPreviewVisible}
          onClose={() => setIsPreviewVisible(false)}
          onSave={() => setIsPreviewVisible(false)}
          profile={profile as any}
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
    right: 