import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, ActivityIndicator, Alert,
  ScrollView, Image, StyleSheet, Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/auth';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';

export default function PhotosScreen() {
  const { session, profile, setProfile } = useAuthStore();
  const router = useRouter();
  const [photos, setPhotos] = useState<string[]>(profile?.photos || []);
  const [uploading, setUploading] = useState(false);

  const pickImage = async () => {
    if (photos.length >= 6) {
      Alert.alert('Limit Reached', 'You can upload up to 6 photos.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 5],
      quality: 0.8,
    });
    if (!result.canceled && result.assets?.length > 0) {
      uploadImage(result.assets[0].uri);
    }
  };

  const uploadImage = async (uri: string) => {
    if (!session?.user) return;
    setUploading(true);
    try {
      let ext = 'jpg';
      if (!uri.startsWith('blob:') && uri.includes('.')) {
        const parts = uri.split('.');
        ext = parts[parts.length - 1].split('?')[0].toLowerCase();
      }
      const fileName = `${Date.now()}.${ext}`;
      const filePath = `${session.user.id}/${fileName}`;

      let uploadBody;
      if (Platform.OS === 'web') {
        const response = await fetch(uri);
        uploadBody = await response.blob();
      } else {
        const formData = new FormData();
        formData.append('file', { uri, name: fileName, type: `image/jpeg` } as any);
        uploadBody = formData;
      }

      const { error: uploadError } = await supabase.storage
        .from('photos')
        .upload(filePath, uploadBody, { cacheControl: '3600', upsert: false });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('photos').getPublicUrl(filePath);
      const newPhotos = [...photos, data.publicUrl];
      setPhotos(newPhotos);

      await supabase.from('profiles').update({ photos: newPhotos }).eq('user_id', session.user.id);
      if (profile) setProfile({ ...profile, photos: newPhotos });
    } catch (error: any) {
      Alert.alert('Upload Failed', error.message);
    } finally {
      setUploading(false);
    }
  };

  const removeImage = async (photoUrl: string) => {
    const newPhotos = photos.filter(url => url !== photoUrl);
    setPhotos(newPhotos);
    if (session?.user) {
      await supabase.from('profiles').update({ photos: newPhotos }).eq('user_id', session.user.id);
      if (profile) setProfile({ ...profile, photos: newPhotos });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.stepBadge}>
              <Text style={styles.stepText}>FINAL STEP</Text>
            </View>
            <Text style={styles.title}>Add Photos 📸</Text>
            <Text style={styles.subtitle}>Your first photo is your main profile picture. Add up to 6.</Text>
          </View>

          {/* Photo Grid */}
          <View style={styles.grid}>
            {Array.from({ length: 6 }).map((_, i) => {
              const photo = photos[i];
              return (
                <View key={i} style={styles.photoSlot}>
                  {photo ? (
                    <>
                      <Image source={{ uri: photo }} style={styles.photoImg} />
                      {i === 0 && (
                        <View style={styles.mainBadge}>
                          <Text style={styles.mainBadgeText}>Main</Text>
                        </View>
                      )}
                      <TouchableOpacity
                        onPress={() => removeImage(photo)}
                        style={styles.removeBtn}
                      >
                        <Text style={styles.removeBtnText}>✕</Text>
                      </TouchableOpacity>
                    </>
                  ) : (
                    <TouchableOpacity
                      onPress={pickImage}
                      disabled={uploading}
                      style={styles.addBtn}
                      activeOpacity={0.7}
                    >
                      {uploading && i === photos.length ? (
                        <ActivityIndicator color="#e11d48" />
                      ) : (
                        <>
                          <Text style={styles.addBtnIcon}>+</Text>
                          {i === 0 && <Text style={styles.addBtnLabel}>Add Photo</Text>}
                        </>
                      )}
                    </TouchableOpacity>
                  )}
                </View>
              );
            })}
          </View>

          {/* Tips */}
          <View style={styles.tipCard}>
            <Text style={styles.tipTitle}>📝 Photo Tips</Text>
            <Text style={styles.tipText}>• Use a clear, well-lit photo of your face</Text>
            <Text style={styles.tipText}>• Smile! It makes a great first impression</Text>
            <Text style={styles.tipText}>• Avoid group photos as your main picture</Text>
          </View>

          {/* CTA */}
          <View style={styles.footer}>
            <TouchableOpacity
              onPress={() => {
                if (photos.length === 0) {
                  Alert.alert('Required', 'Please upload at least one photo to continue.');
                  return;
                }
                router.replace('/(app)');
              }}
              style={[styles.primaryBtn, photos.length === 0 && styles.primaryBtnDisabled]}
              activeOpacity={0.85}
            >
              <Text style={styles.primaryBtnText}>
                {photos.length === 0 ? 'Add at least 1 photo' : `Continue with ${photos.length} photo${photos.length > 1 ? 's' : ''} →`}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#09090b' },
  content: { flex: 1, paddingHorizontal: 24, paddingBottom: 40, gap: 28 },
  header: { gap: 8, marginTop: 32 },
  stepBadge: {
    alignSelf: 'flex-start', backgroundColor: '#2a0a1a',
    borderRadius: 20, paddingHorizontal: 12, paddingVertical: 4,
    borderWidth: 1, borderColor: '#7f1d3f',
  },
  stepText: { color: '#fb7185', fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },
  title: { fontSize: 32, fontWeight: '900', color: '#fff', letterSpacing: -1 },
  subtitle: { fontSize: 15, color: '#71717a' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  photoSlot: {
    width: '31%', aspectRatio: 4 / 5, borderRadius: 16,
    backgroundColor: '#18181b', overflow: 'hidden', position: 'relative',
  },
  photoImg: { width: '100%', height: '100%' },
  mainBadge: {
    position: 'absolute', bottom: 6, left: 6,
    backgroundColor: '#e11d48', borderRadius: 8,
    paddingHorizontal: 8, paddingVertical: 2,
  },
  mainBadgeText: { color: '#fff', fontSize: 10, fontWeight: '800' },
  removeBtn: {
    position: 'absolute', top: 6, right: 6,
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.75)', alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)',
  },
  removeBtnText: { color: '#fff', fontSize: 12, fontWeight: '800' },
  addBtn: {
    flex: 1, borderWidth: 1.5, borderColor: '#27272a',
    borderRadius: 16, alignItems: 'center', justifyContent: 'center',
    borderStyle: 'dashed',
  },
  addBtnIcon: { color: '#e11d48', fontSize: 28, fontWeight: '300' },
  addBtnLabel: { color: '#52525b', fontSize: 11, marginTop: 4 },
  tipCard: {
    backgroundColor: '#18181b', borderRadius: 20,
    borderWidth: 1, borderColor: '#27272a', padding: 16, gap: 6,
  },
  tipTitle: { color: '#fff', fontSize: 14, fontWeight: '700', marginBottom: 4 },
  tipText: { color: '#71717a', fontSize: 13 },
  footer: {},
  primaryBtn: {
    backgroundColor: '#e11d48', borderRadius: 16,
    paddingVertical: 16, alignItems: 'center',
    shadowColor: '#e11d48', shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4, shadowRadius: 16,
  },
  primaryBtnDisabled: { backgroundColor: '#27272a', shadowOpacity: 0 },
  primaryBtnText: { color: '#fff', fontSize: 17, fontWeight: '800' },
});
