import React from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  Dimensions, Image, Platform
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeColor } from '@/constants/Colors';
import { 
  InfoRowItem, DetailListItem, TagChip, 
  calculateAge, formatHeight 
} from './profile-info-card';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface ProfileContentProps {
  profile: {
    name: string;
    dob?: string | Date | null;
    sex?: string;
    sexuality?: string;
    intent: string;
    height?: number;
    general_location?: string;
    drinking_habit?: string;
    smoking_habit?: string;
    weed_usage?: string;
    drug_usage?: string;
    religion?: string;
    hometown?: string;
    occupation?: string;
    sports?: string[];
    hobbies?: string[];
    bio?: string;
    photos: string[];
  };
  containerStyle?: any;
}

export function ProfileContent({ profile, containerStyle }: ProfileContentProps) {
  const colors = useThemeColor();

  const isLight = colors.background === '#ffffff';
  const bwBackground = isLight ? '#ffffff' : '#000000';
  const bwText = isLight ? '#000000' : '#ffffff';
  const bwMuted = isLight ? '#71717a' : '#a1a1aa';
  const bwBorder = isLight ? '#e4e4e7' : '#27272a';
  // Subtle surface for detail blocks — slightly off from main bg
  const blockBg = isLight ? '#fafafa' : '#0a0a0a';

  const photoCount = profile.photos?.length || 0;

  const renderPhoto = (uri: string, index: number) => (
    <View key={`photo-${index}`} style={styles.photoContainer}>
      <Image source={{ uri }} style={styles.photo} resizeMode="cover" />
      
      {/* Photo Indicator Bars */}
      <View style={styles.indicatorContainer}>
        {profile.photos.map((_, i) => (
          <View 
            key={`bar-${i}`} 
            style={[
              styles.indicatorBar, 
              { backgroundColor: i === index ? '#ffffff' : 'rgba(255,255,255,0.3)' }
            ]} 
          />
        ))}
      </View>

      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.8)']}
        style={styles.photoGradient}
      >
        {index === 0 && (
          <View style={styles.primaryInfo}>
            <Text style={styles.primaryName}>{profile.name}{profile.dob ? `, ${calculateAge(profile.dob)}` : ''}</Text>
            {profile.general_location ? (
              <View style={styles.locationRow}>
                <Ionicons name="location" size={16} color="#ffffff" />
                <Text style={styles.locationText}>{profile.general_location}</Text>
              </View>
            ) : null}
          </View>
        )}
      </LinearGradient>
    </View>
  );

  const renderBlock1 = () => (
    <View key="block-1" style={[styles.detailsContainer, { backgroundColor: blockBg }]}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: bwText }]}>About {profile.name.split(' ')[0]}</Text>
        <Ionicons name="sparkles" size={16} color={colors.tint} />
      </View>
      {profile.bio ? <Text style={[styles.bioText, { color: bwText }]}>{profile.bio}</Text> : null}
      
      <View style={[styles.infoGrid, { backgroundColor: isLight ? '#f4f4f5' : '#18181b', borderColor: bwBorder }]}>
        {profile.occupation ? <DetailListItem icon="briefcase" label="Occupation" value={profile.occupation} /> : null}
        {profile.occupation && profile.intent ? <View style={[styles.gridDivider, { backgroundColor: bwBorder }]} /> : null}
        {profile.intent ? <DetailListItem icon="search" label="Looking for" value={profile.intent} /> : null}
        {profile.intent && profile.hometown ? <View style={[styles.gridDivider, { backgroundColor: bwBorder }]} /> : null}
        {profile.hometown ? <DetailListItem icon="home" label="Hometown" value={profile.hometown} /> : null}
      </View>
    </View>
  );

  const renderBlock2 = () => (
    <View key="block-2" style={[styles.lifestyleContainer, { backgroundColor: blockBg }]}>
      <Text style={[styles.sectionTitle, { color: bwText, marginLeft: 24, marginBottom: 16 }]}>My Essentials</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalRow}>
        {profile.dob ? <InfoRowItem icon="calendar" text={`${calculateAge(profile.dob)} yrs`} /> : null}
        {profile.sexuality ? <InfoRowItem icon="heart" text={profile.sexuality} /> : null}
        {profile.height ? <InfoRowItem icon="resize" text={formatHeight(profile.height)} /> : null}
        {profile.drinking_habit ? <InfoRowItem icon="wine" text={`Drink: ${profile.drinking_habit}`} /> : null}
        {profile.smoking_habit ? <InfoRowItem icon="medical" text={`Smoke: ${profile.smoking_habit}`} /> : null}
        {profile.weed_usage ? <InfoRowItem icon="leaf" text={`Weed: ${profile.weed_usage}`} /> : null}
        {profile.drug_usage ? <InfoRowItem icon="pill" iconFamily="MaterialCommunityIcons" text={`Drugs: ${profile.drug_usage}`} isLast /> : null}
      </ScrollView>
    </View>
  );

  const renderBlock3 = () => (
    <View key="block-3" style={[styles.detailsContainer, { backgroundColor: blockBg }]}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: bwText }]}>More Info</Text>
      </View>
      <View style={[styles.infoGrid, { backgroundColor: isLight ? '#f4f4f5' : '#18181b', borderColor: bwBorder }]}>
        {profile.religion ? <DetailListItem icon="star" label="Religion" value={profile.religion} /> : null}
        {profile.religion && profile.general_location ? <View style={[styles.gridDivider, { backgroundColor: bwBorder }]} /> : null}
        {profile.general_location ? <DetailListItem icon="location" iconFamily="Ionicons" label="Area" value={profile.general_location} /> : null}
      </View>
    </View>
  );

  const renderBlock4 = () => {
    const hasTags = (profile.sports && profile.sports.length > 0) || (profile.hobbies && profile.hobbies.length > 0);
    if (!hasTags) return null;
    
    return (
      <View key="block-4" style={[styles.tagSection, { backgroundColor: blockBg }]}>
        <Text style={[styles.tagSectionLabel, { color: bwMuted }]}>Interests & Fun</Text>
        <View style={styles.tagWrap}>
          {profile.sports?.map((sport, i) => <TagChip key={`sport-${i}`} text={sport} />)}
          {profile.hobbies?.map((hobby, i) => <TagChip key={`hobby-${i}`} text={hobby} />)}
        </View>
      </View>
    );
  };

  const content = [];
  if (photoCount === 0) {
    content.push(
      <View key="no-photos" style={[styles.photoContainer, { backgroundColor: isLight ? '#f4f4f5' : '#18181b', justifyContent: 'center', alignItems: 'center' }]}>
        <Ionicons name="image-outline" size={48} color={bwMuted} />
        <Text style={{ color: bwMuted, marginTop: 12, fontWeight: '700' }}>No Photos Uploaded</Text>
      </View>
    );
    content.push(
      <View key="fallback-blocks">
        {renderBlock1()}
        {renderBlock2()}
        {renderBlock3()}
        {renderBlock4()}
      </View>
    );
  } else {
    for (let i = 0; i < photoCount; i++) {
      content.push(renderPhoto(profile.photos[i], i));
      
      if (i === 0) content.push(renderBlock1());
      else if (i === 1) content.push(renderBlock2());
      else if (i === 2) content.push(renderBlock3());
      else if (i === 3) content.push(renderBlock4());
    }

    if (photoCount < 4) {
      if (photoCount < 1) content.push(renderBlock1());
      if (photoCount < 2) content.push(renderBlock2());
      if (photoCount < 3) content.push(renderBlock3());
      if (photoCount < 4) content.push(renderBlock4());
    }
  }

  return (
    <View style={[styles.scrollContent, { backgroundColor: bwBackground }, containerStyle]}>
      {content}
    </View>
  );
}

const styles = StyleSheet.create({
  scrollContent: { 
    alignSelf: 'center',
    width: '100%',
    maxWidth: 600,
  },
  
  photoContainer: { 
    width: '100%',
    aspectRatio: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  photo: { width: '100%', height: '100%' },
  
  indicatorContainer: {
    position: 'absolute',
    top: 10,
    left: 10,
    right: 10,
    flexDirection: 'row',
    gap: 4,
    zIndex: 10,
  },
  indicatorBar: {
    flex: 1,
    height: 3,
    borderRadius: 2,
  },

  photoGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
    justifyContent: 'flex-end',
    padding: 24,
  },
  primaryInfo: {
    gap: 4,
  },
  primaryName: {
    color: '#ffffff',
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: -0.5,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
    fontWeight: '700',
  },
  
  detailsContainer: { padding: 24, gap: 16 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sectionTitle: { fontSize: 18, fontWeight: '900', letterSpacing: -0.2 },
  bioText: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '500',
    letterSpacing: 0.1,
  },

  infoGrid: {
    borderRadius: 20,
    borderWidth: 1,
    paddingVertical: 12,
  },
  gridDivider: {
    height: 1,
    marginHorizontal: 20,
    opacity: 0.1,
  },

  lifestyleContainer: {
    paddingVertical: 16,
  },
  horizontalRow: { paddingHorizontal: 24, alignItems: 'center' },

  tagSection: { padding: 24, paddingTop: 16, gap: 16 },
  tagSectionLabel: { fontSize: 11, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 1.5, opacity: 0.5 },
  tagWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
});
