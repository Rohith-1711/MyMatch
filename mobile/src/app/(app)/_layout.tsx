import React, { useEffect, useState } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/auth';

export default function AppLayout() {
  const { session, profile, setProfile } = useAuthStore();
  const [loadingProfile, setLoadingProfile] = useState(true);
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    async function fetchProfile() {
      if (!session?.user) {
        setLoadingProfile(false);
        return;
      }
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', session.user.id)
        .single();
        
      if (!error && data) {
        setProfile(data);
      } else {
        setProfile(null);
      }
      
      setLoadingProfile(false);
    }
    
    fetchProfile();
  }, [session]);

  useEffect(() => {
    if (loadingProfile) return;

    const inOnboarding = segments.includes('onboarding');
    const inPhotos = segments.includes('photos');
    
    if (!profile && !inOnboarding) {
      // Setup profile
      router.replace('/(app)/onboarding');
    } else if (profile && profile.photos.length === 0 && !inPhotos) {
      // Setup photos
      router.replace('/(app)/photos');
    } else if (profile && profile.photos.length > 0 && (inOnboarding || inPhotos)) {
      // Have profile and photos, exit setup
      router.replace('/(app)');
    }
  }, [profile, loadingProfile, segments]);

  if (loadingProfile) {
    return (
      <View className="flex-1 bg-black justify-center items-center">
        <ActivityIndicator size="large" color="#4f46e5" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="onboarding" options={{ presentation: 'fullScreenModal' }} />
      <Stack.Screen name="photos" options={{ presentation: 'fullScreenModal' }} />
    </Stack>
  );
}
