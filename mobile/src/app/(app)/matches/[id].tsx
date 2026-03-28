import React, { useEffect, useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, Image, KeyboardAvoidingView, Platform, Alert, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/auth';
import * as ImagePicker from 'expo-image-picker';
import { GifPicker } from '@/components/gif-picker';

interface Message {
  id: string;
  sender_id: string;
  body: string | null;
  image_url: string | null;
  created_at: string;
}

export default function ChatScreen() {
  const { id } = useLocalSearchParams(); // Match ID
  const { session } = useAuthStore();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [showGifPicker, setShowGifPicker] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    fetchMessages();

    // Subscribe to new messages for this match
    const channel = supabase
      .channel(`room:${id}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `match_id=eq.${id}` },
        (payload) => {
          setMessages((prev) => [payload.new as Message, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id]);

  const fetchMessages = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('messages')
      .select('*')
      .eq('match_id', id)
      .order('created_at', { ascending: false })
      .limit(50);
      
    if (data) {
      setMessages(data);
    }
    setLoading(false);
  };

  const handleSend = async () => {
    if (!text.trim() || !session?.user) return;

    const payload = {
      match_id: id,
      sender_id: session.user.id,
      body: text.trim(),
    };

    setText(''); // Optimistic clear

    const { error } = await supabase.from('messages').insert([payload]);
    if (error) {
      Alert.alert('Error', 'Failed to send message');
      setText(payload.body);
    }
  };

  const pickImage = async () => {
    // simplified image upload behavior for chat
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.5,
    });

    if (!result.canceled && result.assets.length > 0 && session?.user) {
      const uri = result.assets[0].uri;
      const ext = uri.substring(uri.lastIndexOf('.') + 1);
      const fileName = `${Date.now()}.${ext}`;
      const filePath = `chat/${id}/${fileName}`;
      
      const formData = new FormData();
      formData.append('file', { uri, name: fileName, type: `image/${ext}` } as any);

      // We probably need a 'chat' bucket, but 'photos' bucket might allow it if RLS matches, actually RLS on photos is strictly user_id directories.
      // So we should upload to photos/[user_id]/[filename] instead so RLS passes.
      const userFilePath = `${session.user.id}/chat_${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('photos')
        .upload(userFilePath, formData);

      if (!uploadError) {
        const { data } = supabase.storage.from('photos').getPublicUrl(userFilePath);
        await supabase.from('messages').insert([{
          match_id: id,
          sender_id: session.user.id,
          image_url: data.publicUrl,
        }]);
      } else {
        Alert.alert('Error', 'Failed to upload image');
      }
    }
  };

  const currentUserId = session?.user?.id;

  const handleSendGif = async (url: string) => {
    setShowGifPicker(false);
    if (!session?.user) return;
    
    const payload = {
      match_id: id,
      sender_id: session.user.id,
      image_url: url,
    };
    
    const { error } = await supabase.from('messages').insert([payload]);
    if (error) Alert.alert('Error', 'Failed to send GIF');
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isMine = item.sender_id === currentUserId;
    return (
      <View className={`my-2 max-w-[80%] ${isMine ? 'self-end bg-indigo-600' : 'self-start bg-zinc-800'} rounded-2xl p-3 px-4`}>
        {item.image_url ? (
          <Image source={{ uri: item.image_url }} className="w-48 h-48 rounded-lg mb-2" resizeMode="cover" />
        ) : null}
        {item.body ? (
          <Text className={`text-base ${isMine ? 'text-white' : 'text-zinc-100'}`}>{item.body}</Text>
        ) : null}
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-black" edges={['top', 'left', 'right']}>
      <KeyboardAvoidingView 
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <View className="px-4 py-4 flex-row justify-between items-center border-b border-zinc-900 bg-black z-10">
          <TouchableOpacity onPress={() => router.back()} className="p-2 pl-0">
            <Text className="text-white font-bold text-lg">← Back</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push(`/(app)/matches/plan/${id}` as any)} className="bg-indigo-600/20 border border-indigo-500/50 px-4 py-2 rounded-full">
            <Text className="text-indigo-400 font-bold">Plan Meetup 📍</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          inverted
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 20 }}
          className="flex-1"
        />

        <View className="px-4 py-4 border-t border-zinc-900 bg-black flex-row items-center gap-2">
          <TouchableOpacity onPress={pickImage} className="w-10 h-10 bg-zinc-900 rounded-full items-center justify-center">
            <Text className="text-zinc-400 font-bold max-h-5 overflow-hidden">📸</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setShowGifPicker(true)} className="w-10 h-10 bg-zinc-900 rounded-full items-center justify-center">
            <Text className="text-zinc-400 font-bold max-h-5 overflow-hidden">GIF</Text>
          </TouchableOpacity>
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder="Type a message..."
            placeholderTextColor="#6b7280"
            className="flex-1 bg-zinc-900 text-white px-4 py-3 rounded-2xl max-h-24"
            multiline
          />
          <TouchableOpacity 
            onPress={handleSend} 
            disabled={!text.trim()} 
            className={`w-10 h-10 rounded-full items-center justify-center ${text.trim() ? 'bg-indigo-600' : 'bg-indigo-600/50'}`}
          >
            <Text className="text-white font-bold">↑</Text>
          </TouchableOpacity>
        </View>
        
        <Modal visible={showGifPicker} animationType="slide" transparent>
          <View className="flex-1 bg-black/80 mt-20">
            <GifPicker 
              onClose={() => setShowGifPicker(false)} 
              onSelect={handleSendGif} 
            />
          </View>
        </Modal>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
