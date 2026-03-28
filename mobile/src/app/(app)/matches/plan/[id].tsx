import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/auth';

interface Venue {
  place_id: number;
  display_name: string;
  name: string;
  lat: string;
  lon: string;
}

export default function PlanMeetupScreen() {
  const { id } = useLocalSearchParams(); // match_id
  const { session, profile } = useAuthStore();
  const router = useRouter();

  const [query, setQuery] = useState('Coffee');
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(false);
  
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);
  
  // Extra security fields
  const [trustedEmail, setTrustedEmail] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile?.general_location) {
      searchVenues();
    }
  }, [profile]);

  const searchVenues = async () => {
    if (!query) return;
    setLoading(true);
    
    // We append the user's general location to improve Nominatim search relevance
    const locationSuffix = profile?.general_location ? ` in ${profile.general_location}` : '';
    const searchQuery = `${query}${locationSuffix}`;
    
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery)}&format=json&limit=5`, {
        headers: {
          'User-Agent': 'MyMatch-Dating-App/1.0',
        }
      });
      const data = await res.json();
      setVenues(data.map((v: any) => ({
        ...v,
        name: v.display_name.split(',')[0], // Extract just the first part for a clean name
      })));
    } catch (e) {
      Alert.alert('Search Failed', 'Could not load venues from OpenStreetMap.');
    }
    setLoading(false);
  };

  const handleShareDate = async () => {
    if (!selectedVenue || !trustedEmail || !session?.user) {
      Alert.alert('Incomplete', 'Please select a venue and provide a trusted contact email.');
      return;
    }
    
    setSaving(true);
    const { error } = await supabase.from('date_shares').insert([{
      match_id: id,
      creator_id: session.user.id,
      trusted_email: trustedEmail,
      match_contact_info: contactInfo,
      venue_name: selectedVenue.name,
      venue_address: selectedVenue.display_name,
      status: 'active'
    }]);

    setSaving(false);

    if (error) {
      Alert.alert('Error', error.message);
    } else {
      Alert.alert(
        'Date Secure!',
        `Your meetup details have been isolated. Your trusted contact (${trustedEmail}) will automatically receive these details if you don't check-in after the date!`,
        [
          { text: 'Awesome', onPress: () => router.back() }
        ]
      );
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-black">
      <View className="px-4 py-4 flex-row justify-between items-center border-b border-zinc-900 bg-black">
        <TouchableOpacity onPress={() => router.back()} className="p-2 pl-0">
          <Text className="text-white font-bold text-lg">← Back</Text>
        </TouchableOpacity>
        <Text className="text-white font-bold text-xl">Plan Meetup</Text>
        <View className="w-10" />
      </View>

      <ScrollView className="flex-1 p-6">
        
        <Text className="text-white text-2xl font-bold mb-2">1. Where are you meeting?</Text>
        <Text className="text-zinc-500 mb-4">Powered by OpenStreetMap</Text>
        
        <View className="flex-row gap-2 mb-4">
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="e.g. Cafe, Bar, Park"
            placeholderTextColor="#6b7280"
            className="flex-1 bg-zinc-900 border border-zinc-800 text-white px-4 py-3 rounded-xl"
            onSubmitEditing={searchVenues}
          />
          <TouchableOpacity onPress={searchVenues} className="bg-indigo-600 px-6 justify-center rounded-xl">
            <Text className="text-white font-bold">Search</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator color="#4f46e5" className="my-4" />
        ) : (
          <View className="mb-8">
            {venues.map((venue) => (
              <TouchableOpacity
                key={venue.place_id}
                onPress={() => setSelectedVenue(venue)}
                className={`p-4 rounded-xl border mb-2 ${
                  selectedVenue?.place_id === venue.place_id 
                    ? 'bg-indigo-600/20 border-indigo-500' 
                    : 'bg-zinc-900 border-zinc-800'
                }`}
              >
                <Text className="text-white font-bold text-base">{venue.name}</Text>
                <Text className="text-zinc-400 mt-1" numberOfLines={2}>{venue.display_name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {selectedVenue && (
          <View className="mb-6">
            <Text className="text-white text-2xl font-bold mb-4">2. Date Security Check-in</Text>
            
            <View className="gap-2 mb-4">
              <Text className="text-zinc-400 font-semibold ml-1">Trusted Contact Email</Text>
              <TextInput
                value={trustedEmail}
                onChangeText={setTrustedEmail}
                placeholder="friend@example.com"
                placeholderTextColor="#6b7280"
                keyboardType="email-address"
                autoCapitalize="none"
                className="w-full bg-zinc-900 border border-zinc-800 text-white px-4 py-4 rounded-xl"
              />
            </View>
            
            <View className="gap-2 mb-8">
              <Text className="text-zinc-400 font-semibold ml-1">Emergency Context (Optional)</Text>
              <TextInput
                value={contactInfo}
                onChangeText={setContactInfo}
                placeholder="e.g. They drive a red sedan, met on MyMatch"
                placeholderTextColor="#6b7280"
                multiline
                numberOfLines={3}
                style={{ textAlignVertical: 'top' }}
                className="w-full bg-zinc-900 border border-zinc-800 text-white px-4 py-4 rounded-xl"
              />
            </View>

            <TouchableOpacity
              onPress={handleShareDate}
              disabled={saving}
              className={`w-full py-4 rounded-xl items-center flex-row justify-center gap-2 ${
                saving ? 'bg-indigo-600/50' : 'bg-indigo-600'
              }`}
            >
              {saving ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <>
                  <Text className="text-white text-lg font-bold">Lock & Secure Meetup</Text>
                  <Text>🛡️</Text>
                </>
              )}
            </TouchableOpacity>
            <Text className="text-zinc-600 text-center mt-4 text-xs">
              If you don't cancel this check-in within 6 hours of the date, an automatic secure alert ping is sent to your trusted contact containing the venue coordinates.
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
