import React, { useEffect, useState } from 'react';
import {
  View, Text, ActivityIndicator, Alert, TouchableOpacity,
  Modal, TextInput, KeyboardAvoidingView, Platform, StyleSheet
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/auth';
import { SwipeCard, ProfileCard } from '@/components/swipe-card';
import { useThemeColor } from '@/constants/Colors';

export default function FeedScreen() {
  const { profile } = useAuthStore();
  const colors = useThemeColor();
  const [feed, setFeed] = useState<ProfileCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [complimentModalVisible, setComplimentModalVisible] = useState(false);
  const [complimentText, setComplimentText] = useState('');
  const [selectedProfile, setSelectedProfile] = useState<ProfileCard | null>(null);
  useEffect(() => { fetchFeed(); }, [profile]);

  const fetchFeed = async () => {
    if (!profile) return;
    setLoading(true);
    const { data, error } = await supabase.rpc('get_discovery_feed', {
      query_intent: profile.intent,
      query_location: profile.general_location,
      limit_count: 10,
    });
    if (error) console.error(error);
    else setFeed(data || []);
    setLoading(false);
  };

  const handleSwipeLeft = async (targetProfile: ProfileCard) => {
    setFeed(prev => prev.slice(0, prev.length - 1));
    await supabase.rpc('create_match_if_mutual', { target_user_id: targetProfile.user_id, p_direction: 'pass' });
  };

  const handleSwipeRight = async (targetProfile: ProfileCard) => {
    setFeed(prev => prev.slice(0, prev.length - 1));
    const { data } = await supabase.rpc('create_match_if_mutual', { target_user_id: targetProfile.user_id, p_direction: 'like' });
    if (data === true) {
      Alert.alert("🎉 It's a Match!", `You and ${targetProfile.name} liked each other!`);
    }
  };

  const openComplimentModal = (targetProfile: ProfileCard) => {
    setSelectedProfile(targetProfile);
    setComplimentModalVisible(true);
  };

  const sendCompliment = () => {
    if (selectedProfile) handleSwipeRight(selectedProfile);
    setComplimentModalVisible(false);
    setComplimentText('');
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingState}>
          <ActivityIndicator size="large" color={colors.tint} />
          <Text style={[styles.loadingText, { color: colors.textMuted }]}>Finding people near you...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.logo, { color: colors.text }]}>MyMatch</Text>
      </View>

      {/* Card Stack */}
      <View style={styles.stack}>
        {feed.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🌎</Text>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>You've seen everyone!</Text>
            <Text style={[styles.emptySubtitle, { color: colors.textMuted }]}>Check back later or expand your search location.</Text>
            <TouchableOpacity onPress={fetchFeed} style={[styles.refreshBtn, { backgroundColor: colors.tint }]} activeOpacity={0.8}>
              <Text style={styles.refreshBtnText}>Refresh Feed</Text>
            </TouchableOpacity>
          </View>
        ) : (
          feed.map((user, index) => {
            const isFirst = index === feed.length - 1;
            const scale = 1 - (feed.length - 1 - index) * 0.03;
            const translateY = (feed.length - 1 - index) * -10;
            return (
              <View key={user.id} style={[StyleSheet.absoluteFillObject, { transform: [{ scale }, { translateY }] }]}>
                <SwipeCard
                  profile={user}
                  onSwipeLeft={handleSwipeLeft}
                  onSwipeRight={handleSwipeRight}
                  onCompliment={openComplimentModal}
                  isFirst={isFirst}
                />
              </View>
            );
          })
        )}
      </View>

      {/* Action Buttons (only when there are cards) */}
      {feed.length > 0 && (
        <View style={styles.actionRow}>
          <TouchableOpacity
            onPress={() => feed.length > 0 && handleSwipeLeft(feed[feed.length - 1])}
            style={[styles.actionBtn, styles.actionBtnPass, { backgroundColor: colors.card, borderColor: colors.border }]}
            activeOpacity={0.8}
          >
            <Text style={{ fontSize: 26, color: colors.textMuted }}>✕</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => feed.length > 0 && openComplimentModal(feed[feed.length - 1])}
            style={[styles.actionBtn, styles.actionBtnStar]}
            activeOpacity={0.8}
          >
            <Text style={{ fontSize: 22 }}>💌</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => feed.length > 0 && handleSwipeRight(feed[feed.length - 1])}
            style={[styles.actionBtn, styles.actionBtnLike]}
            activeOpacity={0.8}
          >
            <Text style={{ fontSize: 26 }}>♥</Text>
          </TouchableOpacity>
        </View>
      )}

      <Modal animationType="slide" transparent visible={complimentModalVisible} onRequestClose={() => setComplimentModalVisible(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
          <View style={[styles.modalSheet, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.modalHandle, { backgroundColor: colors.border }]} />
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Send a Compliment 💌</Text>
              <TouchableOpacity onPress={() => setComplimentModalVisible(false)} style={[styles.modalCloseBtn, { backgroundColor: colors.border }]}>
                <Text style={styles.modalCloseTxt}>✕</Text>
              </TouchableOpacity>
            </View>
            <Text style={[styles.modalSub, { color: colors.textMuted }]}>Say something genuine to {selectedProfile?.name}!</Text>
            <TextInput
              placeholder="e.g. Your smile is contagious ✨"
              placeholderTextColor={colors.textMuted}
              value={complimentText}
              onChangeText={setComplimentText}
              autoFocus
              multiline
              style={[styles.modalInput, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
              textAlignVertical="top"
            />
            <TouchableOpacity onPress={sendCompliment} style={[styles.modalSendBtn, { backgroundColor: colors.tint }]} activeOpacity={0.85}>
              <Text style={styles.modalSendTxt}>Send & Like ❤️</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#09090b' },
  loadingState: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  loadingText: { color: '#71717a', fontSize: 15 },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 12,
  },
  logo: { fontSize: 26, fontWeight: '900', color: '#fff', letterSpacing: -1 },
  stack: { flex: 1, position: 'relative' },
  emptyState: {
    flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40, gap: 12,
  },
  emptyEmoji: { fontSize: 64, marginBottom: 8 },
  emptyTitle: { fontSize: 24, fontWeight: '800', color: '#fff', textAlign: 'center' },
  emptySubtitle: { fontSize: 15, color: '#71717a', textAlign: 'center', lineHeight: 22 },
  refreshBtn: {
    marginTop: 16, backgroundColor: '#e11d48', borderRadius: 16,
    paddingHorizontal: 32, paddingVertical: 14,
    shadowColor: '#e11d48', shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4, shadowRadius: 16,
  },
  refreshBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  actionRow: {
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
    paddingHorizontal: 40, paddingVertical: 16, gap: 20,
  },
  actionBtn: {
    alignItems: 'center', justifyContent: 'center',
    shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 16, elevation: 8,
  },
  actionBtnPass: {
    width: 60, height: 60, borderRadius: 30,
    backgroundColor: '#18181b', borderWidth: 2, borderColor: '#3f3f46',
    shadowColor: '#000',
  },
  actionBtnStar: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: '#1f0a2a', borderWidth: 2, borderColor: '#7c3aed',
    shadowColor: '#7c3aed',
  },
  actionBtnLike: {
    width: 68, height: 68, borderRadius: 34,
    backgroundColor: '#e11d48', borderWidth: 2, borderColor: '#fb7185',
    shadowColor: '#e11d48',
  },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'flex-end' },
  modalSheet: {
    backgroundColor: '#18181b', borderTopLeftRadius: 36, borderTopRightRadius: 36,
    padding: 28, paddingBottom: 44, gap: 16,
    borderWidth: 1, borderColor: '#27272a',
  },
  modalHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: '#3f3f46', alignSelf: 'center', marginBottom: 4 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  modalTitle: { fontSize: 20, fontWeight: '800', color: '#fff' },
  modalCloseBtn: {
    width: 32, height: 32, borderRadius: 16, backgroundColor: '#27272a',
    alignItems: 'center', justifyContent: 'center',
  },
  modalCloseTxt: { color: '#a1a1aa', fontSize: 13, fontWeight: '700' },
  modalSub: { color: '#71717a', fontSize: 15 },
  modalInput: {
    backgroundColor: '#09090b', borderWidth: 1, borderColor: '#27272a',
    borderRadius: 16, paddingHorizontal: 16, paddingVertical: 14,
    color: '#fff', fontSize: 16, minHeight: 120,
  },
  modalSendBtn: {
    backgroundColor: '#e11d48', borderRadius: 16, paddingVertical: 16,
    alignItems: 'center', shadowColor: '#e11d48',
    shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 16,
  },
  modalSendTxt: { color: '#fff', fontSize: 17, fontWeight: '800' },
});
