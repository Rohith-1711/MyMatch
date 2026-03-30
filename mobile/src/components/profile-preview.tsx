import React, { useState } from 'react';
import {
  View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView,
  Dimensions, Image, Platform, SafeAreaView
} from 'react-native';
import { useThemeColor } from '@/constants/Colors';
import { 
  ProfileInfoCard, InfoRowItem, DetailListItem, TagChip, 
  calculateAge, formatHeight 
} from './profile-info-card';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface ProfilePreviewProps {
  visible: boolean;
  onClose: () => void;
  onSave: () => void;
  profile: {
    name: string;
    dob: string | Date | null;
    sex: string;
    sexuality: string;
    intent: string;
    height: number;
    general_location: string;
    drinking_habit: string;
    smoking_habit: string;
    weed_usage: string;
    drug_usage: string;
    religion: string;
    hometown: string;
    occupation: string;
    sports: string[];
    hobbies: string[];
    bio: string;
    photos: string[];
  };
}

export function ProfilePreview({ visible, onClose, onSave, profile }: ProfilePreviewProps) {
  const colors = useThemeColor();

  // Black & White Theme logic based on the app's current theme
  const isLight = colors.background === '#ffffff';
  const bwBackground = isLight ? '#ffffff' : '#000000';
  const bwText = isLight ? '#000000' : '#ffffff';
  const bwMuted = isLight ? '#71717a' : '#a1a1aa';
  const bwBorder = isLight ? '#e4e4e7' : '#27272a';

  // The ProfilePreview uses the standardized components for a consistent B&W look.
  const photoCount = profile.photos.length;

  const renderPhoto = (uri: string, index: number) => (
    <View key={`photo-${index}`} style={styles.photoContainer}>
      <Image source={{ uri }} style={styles.photo} resizeMode="cover" />
      {/* Overlay for Compliment Demo */}
      <TouchableOpacity style={[styles.complimentOverlay, { backgroundColor: 'rgba(0,0,0,0.3)' }]} activeOpacity={0.8} onPress={() => {}}>
        <Text style={styles.complimentText}>💌 Compliment Photo {index + 1}</Text>
      </TouchableOpacity>
    </View>
  );

  const renderBlock1 = () => (
    <View key="block-1" style={styles.detailsContainer}>
      <View style={styles.bioSection}>
        <Text style={[styles.nameText, { color: bwText }]}>{profile.name}</Text>
      </View>
      <View style={styles.verticalList}>
        <DetailListItem icon="document-text-outline" label="Bio" value={profile.bio} />
        <View style={[styles.listDivider, { backgroundColor: bwBorder }]} />
        <DetailListItem icon="briefcase-outline" label="Occupation" value={profile.occupation} />
        <View style={[styles.listDivider, { backgroundColor: bwBorder }]} />
        <DetailListItem icon="search-outline" label="Looking for" value={profile.intent} />
        <View style={[styles.listDivider, { backgroundColor: bwBorder }]} />
        <DetailListItem icon="location-outline" label="Current Location" value={profile.general_location} />
      </View>
    </View>
  );

  const renderBlock2 = () => (
    <View key="block-2" style={styles.megaRowContainer}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalRow}>
        <InfoRowItem icon="calendar-outline" text={`${calculateAge(profile.dob)} Years`} />
        <InfoRowItem icon="heart-outline" text={profile.sexuality} />
        <InfoRowItem icon="resize-outline" text={formatHeight(profile.height)} />
        <InfoRowItem icon="location-outline" text={profile.general_location} />
        <InfoRowItem icon="wine-outline" text={`Drink: ${profile.drinking_habit}`} />
        <InfoRowItem icon="medical-outline" text={`Smoke: ${profile.smoking_habit}`} />
        <InfoRowItem icon="leaf-outline" text={`Weed: ${profile.weed_usage}`} />
        <InfoRowItem icon="pill" iconFamily="MaterialCommunityIcons" text={`Drugs: ${profile.drug_usage}`} isLast />
      </ScrollView>
    </View>
  );

  const renderBlock3 = () => (
    <View key="block-3" style={styles.detailsContainer}>
      <View style={styles.verticalList}>
        <DetailListItem icon="star-outline" label="Religion" value={profile.religion} />
        <View style={[styles.listDivider, { backgroundColor: bwBorder }]} />
        <DetailListItem icon="home-outline" label="Hometown" value={profile.hometown} />
      </View>
    </View>
  );

  const renderBlock4 = () => (
    <View key="block-4" style={styles.detailsContainer}>
      <View style={styles.tagSection}>
        <Text style={[styles.tagSectionLabel, { color: bwMuted }]}>Sports</Text>
        <View style={styles.tagWrap}>
          {profile.sports?.map((sport, i) => <TagChip key={i} text={sport} />)}
        </View>
      </View>
      <View style={[styles.listDivider, { backgroundColor: bwBorder }]} />
      <View style={styles.tagSection}>
        <Text style={[styles.tagSectionLabel, { color: bwMuted }]}>Hobbies</Text>
        <View style={styles.tagWrap}>
          {profile.hobbies?.map((hobby, i) => <TagChip key={i} text={hobby} />)}
        </View>
      </View>
    </View>
  );

  const renderContent = () => {
    const content = [];
    if (photoCount === 0) {
      content.push(
        <View key="no-photos" style={[styles.photoContainer, { backgroundColor: bwBorder, justifyContent: 'center', alignItems: 'center' }]}>
          <Text style={{ color: bwMuted }}>No Photos Uploaded</Text>
        </View>
      );
      content.push(renderBlock1(), renderBlock2(), renderBlock3(), renderBlock4());
      return content;
    }

    // Interleaving logic
    for (let i = 0; i < photoCount; i++) {
      content.push(renderPhoto(profile.photos[i], i));
      
      if (i === 0) {
        content.push(renderBlock1());
        if (photoCount === 1) {
          content.push(renderBlock2(), renderBlock3(), renderBlock4());
        }
      } else if (i === 1) {
        content.push(renderBlock2());
        if (photoCount === 2) {
          content.push(renderBlock3(), renderBlock4());
        }
      } else if (i === 2) {
        content.push(renderBlock3());
        if (photoCount === 3) {
          content.push(renderBlock4());
        }
      } else if (i === 3) {
        content.push(renderBlock4());
      }
    }
    return content;
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <SafeAreaView style={[styles.container, { backgroundColor: bwBackground }]}>
        
        {/* Header (Fixed) */}
        <View style={[styles.header, { borderBottomColor: bwBorder }]}>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Text style={[styles.closeBtnText, { color: bwText }]}>← Back to Edit</Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: bwText }]}>Profile Preview</Text>
          <View style={{ width: 80 }} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {renderContent()}
        </ScrollView>

        {/* Footer Action (Fixed) */}
        <View style={[styles.footer, { backgroundColor: bwBackground, borderTopColor: bwBorder }]}>
          <TouchableOpacity onPress={onSave} style={[styles.saveBtn, { backgroundColor: bwText }]}>
            <Text style={[styles.saveBtnText, { color: bwBackground }]}>Save & Go Live 🎉</Text>
          </TouchableOpacity>
        </View>

      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    height: 60, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, borderBottomWidth: 1,
  },
  headerTitle: { fontSize: 16, fontWeight: '800', letterSpacing: 1 },
  closeBtn: { paddingVertical: 8 },
  closeBtnText: { fontSize: 14, fontWeight: '600' },
  
  scrollContent: { paddingBottom: 100 },
  
  photoContainer: { width: SCREEN_WIDTH, height: SCREEN_WIDTH * 1.25, position: 'relative' },
  photo: { width: '100%', height: '100%' },
  
  complimentOverlay: {
    position: 'absolute', bottom: 20, right: 20,
    paddingHorizontal: 16, paddingVertical: 10, borderRadius: 25,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.4)'
  },
  complimentText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  
  detailsContainer: { padding: 24 },
  bioSection: { marginBottom: 12 },
  nameText: { fontSize: 40, fontWeight: '900', letterSpacing: -1.5 },
  
  verticalList: { paddingVertical: 8 },
  listDivider: { height: 1, marginVertical: 4, marginLeft: 60, opacity: 0.1 },

  megaRowContainer: { paddingVertical: 20, borderTopWidth: 1, borderBottomWidth: 1, borderColor: 'rgba(0,0,0,0.05)' },
  horizontalRow: { paddingHorizontal: 20, alignItems: 'center' },

  tagSection: { paddingVertical: 16, gap: 12 },
  tagSectionLabel: { fontSize: 11, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 1.5, opacity: 0.5 },
  tagWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },

  footer: {
    position: 'absolute', bottom: 0, width: '100%',
    paddingHorizontal: 24, paddingVertical: 20,
    borderTopWidth: 1,
  },
  saveBtn: {
    height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.2, shadowRadius: 10, elevation: 5,
  },
  saveBtnText: { fontSize: 18, fontWeight: '900', letterSpacing: 0.5 },
});
