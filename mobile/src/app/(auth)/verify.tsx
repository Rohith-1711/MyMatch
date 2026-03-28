import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { supabase } from '@/lib/supabase';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function VerifyScreen() {
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { email } = useLocalSearchParams();

  const handleVerify = async () => {
    if (!token) {
      Alert.alert('Error', 'Please enter the verification code.');
      return;
    }

    setLoading(true);
    const { error, data } = await supabase.auth.verifyOtp({
      email: email as string,
      token,
      type: 'email',
    });

    setLoading(false);

    if (error) {
      Alert.alert('Error', error.message);
    } else {
      router.replace('/(app)');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-black px-6 pt-12">
      <View className="flex-1">
        <TouchableOpacity
          onPress={() => router.back()}
          className="mb-8 w-12 h-12 bg-zinc-900 rounded-full items-center justify-center border border-zinc-800"
        >
          <Text className="text-white font-bold">←</Text>
        </TouchableOpacity>

        <Text className="text-white text-3xl font-bold mb-2 tracking-tight">Enter Code</Text>
        <Text className="text-zinc-400 text-lg mb-10">
          We sent a verification code to {email}
        </Text>

        <View className="gap-4">
          <TextInput
            placeholder="000000"
            placeholderTextColor="#9ca3af"
            value={token}
            onChangeText={setToken}
            keyboardType="number-pad"
            maxLength={6}
            className="w-full bg-zinc-900 border border-zinc-800 text-white px-4 py-4 rounded-xl text-center text-3 tracking-widest text-2xl"
          />

          <TouchableOpacity
            onPress={handleVerify}
            disabled={loading}
            className={`w-full py-4 rounded-xl items-center mt-6 ${
              loading ? 'bg-indigo-600/50' : 'bg-indigo-600'
            }`}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text className="text-white text-lg font-bold">Verify</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
