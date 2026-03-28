import React, { useEffect, useState } from 'react';
import {
  View, Text, TouchableOpacity, FlatList, ActivityIndicator,
  Image, StyleSheet
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'expo-router';

interface MatchItem {
  match_id: string;
  other_user_id: string;
  other_name: string;
  other_photo: string;
  last_message: string | null;
  created_at: string;
}

export default function MatchesListScreen() {
  const [matches, setMatches] = useState<MatchItem[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => { fetchMatches(); }, []);

  const fetchMatches = async () => {
    setLoading(true);
    const { data, error } = await supabase.rpc('get_my_matches');
    if (!error && data) setMatches(data);
    setLoading(false);
  };

  const renderItem = ({ item, index }: { item: MatchItem; index: number }) => (
    <TouchableOpacity
      onPress={() => router.push(`/(app)/matches/${item.match_id}` as any)}
      style={styles.matchRow}
      activeOpacity={0.7}
    >
      <View style={styles.avatarContainer}>
        <Image
          source={{ uri: item.other_photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400' }}
          style={styles.avatar}
        />
        <View style={styles.onlineDot} />
      </View>
      <View style={styles.matchInfo}>
        <Text style={styles.matchName}>{item.other_name}</Text>
        <Text style={styles.lastMessage} numberOfLines={1}>
          {item.last_message ?? 'New Match! Say hello 👋'}
        </Text>
      </View>
      <View style={styles.matchMeta}>
        {!item.last_message && (
          <View style={styles.newBadge}>
            <Text style={styles.newBadgeText}>NEW</Text>
          </View>
        )}
        <Text style={styles.chevron}>›</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <View>
          <Text style={styles.title}>Messages</Text>
          {matches.length > 0 && (
            <Text style={styles.subtitle}>{matches.length} match{matches.length !== 1 ? 'es' : ''}</Text>
          )}
        </View>
        <View style={{ width: 44 }} />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color="#e11d48" size="large" />
        </View>
      ) : matches.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyEmoji}>💘</Text>
          <Text style={styles.emptyTitle}>No matches yet</Text>
          <Text style={styles.emptySubtitle}>Keep swiping — your perfect match is out there!</Text>
          <TouchableOpacity onPress={() => router.back()} style={styles.discoverBtn} activeOpacity={0.85}>
            <Text style={styles.discoverBtnText}>Discover People</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={matches}
          keyExtractor={item => item.match_id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingVertical: 8 }}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#09090b' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 16,
    borderBottomWidth: 1, borderBottomColor: '#18181b',
  },
  backBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: '#18181b', borderWidth: 1, borderColor: '#27272a',
    alignItems: 'center', justifyContent: 'center',
  },
  backIcon: { color: '#fff', fontSize: 18, fontWeight: '700' },
  title: { fontSize: 22, fontWeight: '900', color: '#fff', textAlign: 'center' },
  subtitle: { fontSize: 12, color: '#71717a', textAlign: 'center', marginTop: 2 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12, padding: 40 },
  emptyEmoji: { fontSize: 56 },
  emptyTitle: { fontSize: 22, fontWeight: '800', color: '#fff' },
  emptySubtitle: { fontSize: 15, color: '#71717a', textAlign: 'center', lineHeight: 22 },
  discoverBtn: {
    marginTop: 16, backgroundColor: '#e11d48', borderRadius: 16,
    paddingHorizontal: 32, paddingVertical: 14,
    shadowColor: '#e11d48', shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4, shadowRadius: 16,
  },
  discoverBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  matchRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 14, gap: 14,
  },
  avatarContainer: { position: 'relative' },
  avatar: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#27272a' },
  onlineDot: {
    position: 'absolute', bottom: 2, right: 2,
    width: 12, height: 12, borderRadius: 6,
    backgroundColor: '#22c55e', borderWidth: 2, borderColor: '#09090b',
  },
  matchInfo: { flex: 1 },
  matchName: { fontSize: 16, fontWeight: '700', color: '#fff', marginBottom: 3 },
  lastMessage: { fontSize: 14, color: '#71717a' },
  matchMeta: { alignItems: 'center', gap: 4 },
  newBadge: {
    backgroundColor: '#1f0a15', borderWidth: 1, borderColor: '#e11d48',
    borderRadius: 8, paddingHorizontal: 6, paddingVertical: 2,
  },
  newBadgeText: { color: '#e11d48', fontSize: 9, fontWeight: '800', letterSpacing: 0.5 },
  chevron: { color: '#52525b', fontSize: 22, fontWeight: '300' },
  separator: { height: 1, backgroundColor: '#18181b', marginLeft: 94 },
});
