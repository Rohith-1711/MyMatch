import React, { useState, useEffect } from 'react';
import { View, TextInput, FlatList, Image, TouchableOpacity, Text, ActivityIndicator } from 'react-native';

interface GifPickerProps {
  onSelect: (url: string) => void;
  onClose: () => void;
}

const GIPHY_API_KEY = process.env.EXPO_PUBLIC_GIPHY_API_KEY || 'OqVlB8E42n7Btv9Gk4O05tqTlvZ2rQer'; // public beta key fallback

export function GifPicker({ onSelect, onClose }: GifPickerProps) {
  const [search, setSearch] = useState('');
  const [gifs, setGifs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTrending();
  }, []);

  const fetchTrending = async () => {
    setLoading(true);
    try {
      const res = await fetch(`https://api.giphy.com/v1/gifs/trending?api_key=${GIPHY_API_KEY}&limit=20`);
      const json = await res.json();
      setGifs(json.data || []);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const executeSearch = async (text: string) => {
    setSearch(text);
    if (!text) {
      fetchTrending();
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`https://api.giphy.com/v1/gifs/search?api_key=${GIPHY_API_KEY}&q=${encodeURIComponent(text)}&limit=20`);
      const json = await res.json();
      setGifs(json.data || []);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  return (
    <View className="flex-1 bg-zinc-900 rounded-t-3xl pt-4">
      <View className="px-4 flex-row items-center mb-4 border-b border-zinc-800 pb-4">
        <TextInput 
          value={search}
          onChangeText={executeSearch}
          placeholder="Search GIFs..."
          placeholderTextColor="#9ca3af"
          className="flex-1 bg-black text-white px-4 py-3 rounded-xl"
        />
        <TouchableOpacity onPress={onClose} className="ml-4">
          <Text className="text-white font-bold">Close</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator color="#4f46e5" />
        </View>
      ) : (
        <FlatList
          data={gifs}
          numColumns={2}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity 
              onPress={() => onSelect(item.images.fixed_height.url)}
              className="flex-1 m-1 bg-black aspect-square rounded-lg overflow-hidden"
            >
              <Image 
                source={{ uri: item.images.fixed_height.url }} 
                className="w-full h-full"
                resizeMode="cover"
              />
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}
