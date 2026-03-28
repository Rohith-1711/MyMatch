import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useAuthStore } from '@/store/auth';
import { useRouter } from 'expo-router';

export default function Index() {
  const { isInitialized, session } = useAuthStore();
  const router = useRouter();

  // Redirect manually once initialized to avoid early rendering issues
  useEffect(() => {
    if (isInitialized) {
      if (session) {
        // Here we could also check if profile is set up to go to onboarding
        router.replace('/(app)');
      } else {
        router.replace('/(auth)/login');
      }
    }
  }, [isInitialized, session]);

  return (
    <View className="flex-1 bg-black justify-center items-center">
      <ActivityIndicator size="large" color="#4f46e5" />
    </View>
  );
}
