import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, Image, TouchableOpacity,
  ActivityIndicator, Alert, StyleSheet, Modal, ScrollView, TextInput, Platform, Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/auth';
import { useThemeColor } from '@/constants/Colors';

import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { ThemeToggle } from '@/components/ThemeToggle';

interface Event {
  id: string;
  title: string;
  type: 'Dinner' | 'Pub' | 'Pickleball' | 'Trekking' | 'Restrobar';
  location: string;
  date: string;
  time: string;
  cost: number;
  capacity: number;
  joined_count: number;
  image_url: string;
  gradient: string[];
}

const DUMMY_EVENTS: Event[] = [
  {
    id: '1',
    title: 'Dinner Hangout',
    type: 'Dinner',
    location: 'Little Italy, Indiranagar',
    date: 'Saturday, Apr 5',
    time: '8:00 PM',
    cost: 499,
    capacity: 6,
    joined_count: 2,
    image_url: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800',
    gradient: ['#fb923c', '#ea580c'], // Orange
  },
  {
    id: '2',
    title: 'Pub Hangout',
    type: 'Pub',
    location: 'Toit Brewpub, Indiranagar',
    date: 'Saturday, Apr 12',
    time: '9:00 PM',
    cost: 499,
    capacity: 6,
    joined_count: 5,
    image_url: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=800',
    gradient: ['#a855f7', '#7c3aed'], // Purple
  },
  {
    id: '3',
    title: 'Pickleball Match',
    type: 'Pickleball',
    location: 'The Arena, Koramangala',
    date: 'Sunday, Apr 13',
    time: '5:00 PM',
    cost: 299,
    capacity: 6,
    joined_count: 3,
    image_url: 'https://images.unsplash.com/photo-1594470117722-de4d9a3f8dfd?w=800',
    gradient: ['#22c55e', '#16a34a'], // Green
  },
  {
    id: '4',
    title: 'Trekking Hangout',
    type: 'Trekking',
    location: 'Nandi Hills Base',
    date: 'Saturday, Apr 19',
    time: '6:00 AM',
    cost: 299,
    capacity: 6,
    joined_count: 0,
    image_url: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=800',
    gradient: ['#0ea5e9', '#0284c7'], // Blue
  },
  {
    id: '5',
    title: 'Mufasa Restrobar',
    type: 'Restrobar',
    location: 'Mufasa, Coimbatore',
    date: 'Saturday, Apr 26',
    time: '8:30 PM',
    cost: 499,
    capacity: 6,
    joined_count: 1,
    image_url: 'https://images.unsplash.com/photo-1574096079513-d8259312b785?w=800',
    gradient: ['#f43f5e', '#e11d48'], // Rose
  },
];

export default function EventsScreen() {
  const { profile } = useAuthStore();
  const colors = useThemeColor();
  const router = useRouter();

  const [events, setEvents] = useState<Event[]>(DUMMY_EVENTS);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isBookingModalVisible, setIsBookingModalVisible] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);

  // Form State
  const [bookingForm, setBookingForm] = useState({
    name: profile?.name || '',
    age: '',
    location: profile?.general_location || '',
    email: '',
  });

  const handleOpenBooking = (event: Event) => {
    if (event.joined_count >= event.capacity) {
      Alert.alert('Event Full', 'Sorry, all slots are booked!');
      return;
    }
    setSelectedEvent(event);
    setIsBookingModalVisible(true);
  };

  const handleBookSlot = () => {
    if (!bookingForm.name || !bookingForm.email) {
      Alert.alert('Missing Info', 'Please provide name and email.');
      return;
    }
    setBookingLoading(true);
    setTimeout(() => {
      if (selectedEvent) {
        setEvents(prev => prev.map(ev => 
          ev.id === selectedEvent.id ? { ...ev, joined_count: ev.joined_count + 1 } : ev
        ));
        
        console.log(`
          INVITATION SENT: ${selectedEvent.title}
          Name: ${bookingForm.name} | Email: ${bookingForm.email}
          Check walkthrough for full HTML email template.
        `);

        Alert.alert('Spot Booked! 🎉', 'Check your email (simulated in logs).', [
          { text: 'Sweet!', onPress: () => setIsBookingModalVisible(false) }
        ]);
      }
      setBookingLoading(false);
    }, 1200);
  };

  const isLight = colors.background === '#ffffff';
  const bwText = isLight ? '#000000' : '#ffffff';
  const bwMuted = isLight ? '#71717a' : '#a1a1aa';
  const bwBorder = isLight ? '#e4e4e7' : '#27272a';

  // Responsive Calculation
  const windowWidth = Dimensions.get('window').width;
  const contentWidth = Math.min(windowWidth, 800);
  const cardWidth = (contentWidth - 48) / 2; // Adjusted for responsive container

  const renderEventCard = ({ item }: { item: Event }) => {
    const slotsLeft = item.capacity - item.joined_count;
    const isFull = slotsLeft <= 0;

    return (
      <TouchableOpacity 
        onPress={() => handleOpenBooking(item)}
        activeOpacity={0.9} 
        style={[styles.card, { width: cardWidth, backgroundColor: colors.card, borderColor: bwBorder }]}
      >
        <View style={styles.imageWrapper}>
          <Image source={{ uri: item.image_url }} style={styles.cardImage} />
          
          {/* Slots Pill */}
          <View style={[styles.slotsPill, { backgroundColor: isFull ? '#000' : colors.tint }]}>
            <Text style={styles.slotsPillText}>
              {isFull ? 'FULL' : `${slotsLeft} slot${slotsLeft > 1 ? 's' : ''} left`}
            </Text>
          </View>

          {/* District-Style Text Overlay */}
          <LinearGradient colors={['transparent', 'rgba(0,0,0,0.85)']} style={styles.textOverlay}>
            <Text style={styles.cardTitleLine} numberOfLines={1}>{item.title}</Text>
            <Text style={styles.cardDateLine}>{item.date}</Text>
          </LinearGradient>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header Container */}
      <View style={{ width: '100%', maxWidth: 800, alignSelf: 'center' }}>
        <View style={[styles.header, { borderBottomColor: bwBorder }]}>
          <View style={styles.headerLeft}>
            <Text style={[styles.headerTitle, { color: colors.text }]}>Weekend Meetups</Text>
            <Text style={[styles.headerSubtitle, { color: colors.tint }]}>Join the Vibe ⚡</Text>
          </View>
          <ThemeToggle />
        </View>
      </View>

      <FlatList
        data={events}
        keyExtractor={item => item.id}
        renderItem={renderEventCard}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        contentContainerStyle={[styles.listContent, { width: contentWidth, alignSelf: 'center' }]}
        showsVerticalScrollIndicator={false}
      />

      {/* Booking Modal (Responsive) */}
      <Modal 
        visible={isBookingModalVisible} 
        animationType="slide" 
        transparent={true}
        onRequestClose={() => setIsBookingModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
          <View style={[styles.modalContent, { backgroundColor: colors.card, maxWidth: 500, alignSelf: 'center', width: '100%' }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Book Entry</Text>
              <TouchableOpacity onPress={() => setIsBookingModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalScroll}>
              {selectedEvent && (
                <View style={[styles.eventSummaryCard, { borderColor: bwBorder }]}>
                  <Text style={[styles.summaryTitle, { color: colors.text }]}>{selectedEvent.title}</Text>
                  <Text style={[styles.summaryInfo, { color: bwMuted }]}>📍 {selectedEvent.location}</Text>
                  <Text style={[styles.summaryInfo, { color: colors.tint }]}>🕒 {selectedEvent.date} @ {selectedEvent.time}</Text>
                </View>
              )}

              <View style={styles.formSection}>
                <View style={styles.formGroup}>
                  <Text style={[styles.label, { color: bwMuted }]}>Name</Text>
                  <TextInput 
                    style={[styles.input, { color: colors.text, borderColor: bwBorder }]} 
                    value={bookingForm.name}
                    onChangeText={v => setBookingForm(prev => ({ ...prev, name: v }))}
                    placeholder="Full Name"
                  />
                </View>

                <View style={styles.formRow}>
                  <View style={[styles.formGroup, { flex: 1 }]}>
                    <Text style={[styles.label, { color: bwMuted }]}>Age</Text>
                    <TextInput 
                      style={[styles.input, { color: colors.text, borderColor: bwBorder }]} 
                      value={bookingForm.age}
                      onChangeText={v => setBookingForm(prev => ({ ...prev, age: v }))}
                      keyboardType="numeric"
                      placeholder="e.g. 24"
                    />
                  </View>
                  <View style={[styles.formGroup, { flex: 2, marginLeft: 12 }]}>
                    <Text style={[styles.label, { color: bwMuted }]}>Email</Text>
                    <TextInput 
                      style={[styles.input, { color: colors.text, borderColor: bwBorder }]} 
                      value={bookingForm.email}
                      onChangeText={v => setBookingForm(prev => ({ ...prev, email: v }))}
                      autoCapitalize="none"
                      placeholder="hello@me.com"
                    />
                  </View>
                </View>

                {/* Dummy Payment */}
                <View style={[styles.paySection, { backgroundColor: colors.background, borderColor: bwBorder }]}>
                  <View>
                    <Text style={[styles.payLabel, { color: bwMuted }]}>FEES</Text>
                    <Text style={[styles.payCost, { color: colors.text }]}>₹{selectedEvent?.cost}</Text>
                  </View>
                  <View style={styles.qrIcon}>
                    <Ionicons name="qr-code" size={48} color={colors.text} />
                  </View>
                </View>

                <TouchableOpacity 
                  onPress={handleBookSlot}
                  disabled={bookingLoading}
                  style={[styles.bookActionBtn, { backgroundColor: colors.tint }]}
                >
                  {bookingLoading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.bookActionText}>Finalize Booking</Text>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    height: 80, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, borderBottomWidth: 1, paddingTop: 10,
  },
  headerLeft: { gap: 0 },
  headerTitle: { fontSize: 22, fontWeight: '900', letterSpacing: -0.5 },
  headerSubtitle: { fontSize: 13, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5 },
  
  listContent: { padding: 16, paddingBottom: 60 },
  columnWrapper: { justifyContent: 'space-between', marginBottom: 20 },
  card: {
    borderRadius: 24,
    borderWidth: 1,
    overflow: 'hidden',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10 },
      android: { elevation: 3 }
    })
  },
  imageWrapper: { width: '100%', aspectRatio: 1, position: 'relative' },
  cardImage: { width: '100%', height: '100%' },
  
  slotsPill: {
    position: 'absolute', top: 12, left: 12,
    paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 12,
  },
  slotsPillText: { color: '#fff', fontSize: 10, fontWeight: '900' },

  textOverlay: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    height: '60%', justifyContent: 'flex-end',
    padding: 12,
  },
  cardTitleLine: { color: '#fff', fontSize: 15, fontWeight: '900', letterSpacing: -0.2 },
  cardDateLine: { color: 'rgba(255,255,255,0.7)', fontSize: 11, fontWeight: '700', marginTop: 1 },

  // Modal Styles
  modalOverlay: { flex: 1, justifyContent: 'flex-end' },
  modalContent: { 
    height: '80%', 
    borderTopLeftRadius: 36, borderTopRightRadius: 36,
    padding: 24, paddingBottom: 0,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: -10 }, shadowOpacity: 0.1, shadowRadius: 20 },
      android: { elevation: 20 }
    })
  },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 },
  modalTitle: { fontSize: 24, fontWeight: '900' },
  modalScroll: { paddingBottom: 60 },
  
  eventSummaryCard: { 
    borderWidth: 1, borderRadius: 24, padding: 20, marginBottom: 24, gap: 4,
  },
  summaryTitle: { fontSize: 19, fontWeight: '800' },
  summaryInfo: { fontSize: 13, fontWeight: '700' },

  formSection: { gap: 20 },
  formGroup: { gap: 8 },
  formRow: { flexDirection: 'row' },
  label: { fontSize: 12, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1 },
  input: { 
    borderWidth: 1.5, borderRadius: 16, 
    paddingHorizontal: 16, paddingVertical: 14,
    fontSize: 16, fontWeight: '600' 
  },
  
  paySection: { 
    borderRadius: 24, borderWidth: 1.5,
    padding: 24, marginBottom: 32,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'
  },
  payLabel: { fontSize: 11, fontWeight: '800', textTransform: 'uppercase' },
  payCost: { fontSize: 32, fontWeight: '900' },
  qrIcon: { width: 70, height: 70, justifyContent: 'center', alignItems: 'center' },

  bookActionBtn: {
    height: 64, borderRadius: 32,
    alignItems: 'center', justifyContent: 'center',
  },
  bookActionText: { color: '#fff', fontSize: 18, fontWeight: '900' },
});
