import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, Image, TouchableOpacity,
  ActivityIndicator, Alert, StyleSheet
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/auth';

interface Event {
  id: string;
  title: string;
  description: string;
  location: string;
  starts_at: string;
  joined_count: number;
  capacity: number | null;
  image_url: string | null;
  is_joined?: boolean;
}

const EVENT_IMAGES = [
  'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800',
  'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
  'https://images.unsplash.com/photo-1529543544282-ea669407fca3?w=800',
];

export default function EventsScreen() {
  const { session } = useAuthStore();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => { fetchEvents(); }, []);

  const fetchEvents = async () => {
    setLoading(true);
    const { data: eventsData, error } = await supabase
      .from('events')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) { setLoading(false); return; }

    if (session?.user) {
      const { data: rsvpsData } = await supabase
        .from('event_rsvps')
        .select('event_id')
        .eq('user_id', session.user.id);
      const joinedEventIds = new Set(rsvpsData?.map(r => r.event_id));
      setEvents(eventsData.map(ev => ({ ...ev, is_joined: joinedEventIds.has(ev.id) })));
    } else {
      setEvents(eventsData);
    }
    setLoading(false);
  };

  const handleRSVP = async (event: Event) => {
    if (!session?.user) return;
    if (event.is_joined) {
      const { error } = await supabase.from('event_rsvps').delete()
        .eq('event_id', event.id).eq('user_id', session.user.id);
      if (!error)
        setEvents(prev => prev.map(e => e.id === event.id
          ? { ...e, is_joined: false, joined_count: e.joined_count - 1 } : e));
    } else {
      if (event.capacity && event.joined_count >= event.capacity) {
        Alert.alert('Full', 'This event is at capacity!'); return;
      }
      const { error } = await supabase.from('event_rsvps')
        .insert([{ event_id: event.id, user_id: session.user.id }]);
      if (!error) {
        setEvents(prev => prev.map(e => e.id === event.id
          ? { ...e, is_joined: true, joined_count: e.joined_count + 1 } : e));
        Alert.alert('You\'re In! 🎉', `See you at ${event.title}!`);
      } else if (error.code === '23505') {
        Alert.alert('Already Joined', 'You are already going to this event!');
      } else {
        Alert.alert('Error', error.message);
      }
    }
  };

  const renderEvent = ({ item, index }: { item: Event; index: number }) => {
    const date = item.starts_at
      ? new Date(item.starts_at).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })
      : '';
    const spotsLeft = item.capacity ? item.capacity - item.joined_count : null;
    const imgUrl = item.image_url || EVENT_IMAGES[index % EVENT_IMAGES.length];

    return (
      <View style={styles.card}>
        <Image source={{ uri: imgUrl }} style={styles.cardImage} resizeMode="cover" />

        {/* Capacity Badge */}
        <View style={styles.capacityBadge}>
          <Text style={styles.capacityText}>
            {item.joined_count}{item.capacity ? `/${item.capacity}` : ''} going
          </Text>
        </View>

        {/* Joined indicator */}
        {item.is_joined && (
          <View style={styles.joinedBadge}>
            <Text style={styles.joinedBadgeText}>✓ Going</Text>
          </View>
        )}

        <View style={styles.cardBody}>
          <View style={styles.cardDate}>
            <Text style={styles.cardDateText}>{date || 'Upcoming'}</Text>
          </View>
          <Text style={styles.cardTitle}>{item.title}</Text>
          {item.description ? (
            <Text style={styles.cardDesc} numberOfLines={2}>{item.description}</Text>
          ) : null}
          <View style={styles.cardLocation}>
            <Text style={styles.cardLocationText}>📍 {item.location || 'Location TBD'}</Text>
          </View>

          {spotsLeft !== null && spotsLeft <= 10 && spotsLeft > 0 && (
            <View style={styles.urgencyRow}>
              <Text style={styles.urgencyText}>🔥 Only {spotsLeft} spots left!</Text>
            </View>
          )}

          <TouchableOpacity
            onPress={() => handleRSVP(item)}
            style={[styles.rsvpBtn, item.is_joined && styles.rsvpBtnJoined]}
            activeOpacity={0.8}
          >
            <Text style={[styles.rsvpBtnText, item.is_joined && styles.rsvpBtnTextJoined]}>
              {item.is_joined ? 'Cancel RSVP' : 'RSVP Now →'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <View>
          <Text style={styles.title}>Events</Text>
          <Text style={styles.subtitle}>Meetups & Mixers</Text>
        </View>
        <View style={{ width: 44 }} />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color="#e11d48" size="large" />
        </View>
      ) : events.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyEmoji}>🎭</Text>
          <Text style={styles.emptyTitle}>No events yet</Text>
          <Text style={styles.emptySubtitle}>Check back soon for local meetups and mixers!</Text>
        </View>
      ) : (
        <FlatList
          data={events}
          keyExtractor={item => item.id}
          renderItem={renderEvent}
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
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
  card: {
    backgroundColor: '#18181b', borderRadius: 24,
    borderWidth: 1, borderColor: '#27272a',
    overflow: 'hidden', marginBottom: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3, shadowRadius: 20, elevation: 8,
  },
  cardImage: { width: '100%', height: 200 },
  capacityBadge: {
    position: 'absolute', top: 14, right: 14,
    backgroundColor: 'rgba(0,0,0,0.7)', borderRadius: 20,
    paddingHorizontal: 12, paddingVertical: 5,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)',
  },
  capacityText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  joinedBadge: {
    position: 'absolute', top: 14, left: 14,
    backgroundColor: '#14532d', borderRadius: 20,
    paddingHorizontal: 12, paddingVertical: 5,
    borderWidth: 1, borderColor: '#22c55e',
  },
  joinedBadgeText: { color: '#22c55e', fontSize: 12, fontWeight: '800' },
  cardBody: { padding: 20, gap: 8 },
  cardDate: {
    alignSelf: 'flex-start',
    backgroundColor: '#1f0a15', borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 3,
    borderWidth: 1, borderColor: '#7f1d3f',
  },
  cardDateText: { color: '#fb7185', fontSize: 11, fontWeight: '700' },
  cardTitle: { fontSize: 20, fontWeight: '900', color: '#fff' },
  cardDesc: { fontSize: 14, color: '#71717a', lineHeight: 20 },
  cardLocation: { flexDirection: 'row', alignItems: 'center' },
  cardLocationText: { color: '#52525b', fontSize: 13 },
  urgencyRow: { flexDirection: 'row', alignItems: 'center' },
  urgencyText: { color: '#f97316', fontSize: 13, fontWeight: '700' },
  rsvpBtn: {
    backgroundColor: '#e11d48', borderRadius: 14,
    paddingVertical: 13, alignItems: 'center', marginTop: 4,
    shadowColor: '#e11d48', shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35, shadowRadius: 12,
  },
  rsvpBtnJoined: {
    backgroundColor: '#18181b', borderWidth: 1.5,
    borderColor: '#3f3f46', shadowOpacity: 0,
  },
  rsvpBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  rsvpBtnTextJoined: { color: '#71717a' },
});
