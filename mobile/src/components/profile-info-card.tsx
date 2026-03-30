import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Platform
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useThemeColor } from '@/constants/Colors';

export const calculateAge = (dob: string | Date | null) => {
  if (!dob) return '??';
  const birthDate = new Date(dob);
  let age = new Date().getFullYear() - birthDate.getFullYear();
  const m = new Date().getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && new Date().getDate() < birthDate.getDate())) age--;
  return age.toString();
};

export const formatHeight = (cm: number) => {
  const inches = Math.round(cm / 2.54);
  const feet = Math.floor(inches / 12);
  const remInches = inches % 12;
  return `${cm}cm (${feet}'${remInches}")`;
};

interface InfoRowItemProps {
  icon: string;
  iconFamily?: 'Ionicons' | 'MaterialCommunityIcons';
  text: string;
  isLast?: boolean;
}

export const InfoRowItem = ({ icon, iconFamily = 'Ionicons', text, isLast }: InfoRowItemProps) => {
  const colors = useThemeColor();
  const isLight = colors.background === '#ffffff';
  const bwText = isLight ? '#000000' : '#ffffff';
  const bwBorder = isLight ? '#e4e4e7' : '#27272a';

  return (
    <View style={styles.infoRowItemContainer}>
      <View style={styles.infoRowItem}>
        {iconFamily === 'Ionicons' ? (
          <Ionicons name={icon as any} size={18} color={bwText} />
        ) : (
          <MaterialCommunityIcons name={icon as any} size={18} color={bwText} />
        )}
        <Text style={[styles.infoRowText, { color: bwText }]}>{text}</Text>
      </View>
      {!isLast && <View style={[styles.verticalDivider, { backgroundColor: bwBorder }]} />}
    </View>
  );
};

interface DetailListItemProps {
  icon: string;
  iconFamily?: 'Ionicons' | 'MaterialCommunityIcons';
  label: string;
  value: string | string[];
}

export const DetailListItem = ({ icon, iconFamily = 'Ionicons', label, value }: DetailListItemProps) => {
  const colors = useThemeColor();
  const isLight = colors.background === '#ffffff';
  const bwText = isLight ? '#000000' : '#ffffff';
  const bwMuted = isLight ? '#71717a' : '#a1a1aa';

  const displayValue = Array.isArray(value) ? value.join(', ') : value;

  return (
    <View style={styles.detailListItem}>
      <View style={styles.detailListIcon}>
        {iconFamily === 'Ionicons' ? (
          <Ionicons name={icon as any} size={22} color={bwText} />
        ) : (
          <MaterialCommunityIcons name={icon as any} size={22} color={bwText} />
        )}
      </View>
      <View style={styles.detailListContent}>
        <Text style={[styles.detailListLabel, { color: bwMuted }]}>{label}</Text>
        <Text style={[styles.detailListValue, { color: bwText }]}>{displayValue || 'Not specified'}</Text>
      </View>
    </View>
  );
};

interface TagChipProps {
  text: string;
}

export const TagChip = ({ text }: TagChipProps) => {
  const colors = useThemeColor();
  const isLight = colors.background === '#ffffff';
  const bwText = isLight ? '#000000' : '#ffffff';
  const bwBorder = isLight ? '#e4e4e7' : '#27272a';

  return (
    <View style={[styles.tagChip, { borderColor: bwBorder }]}>
      <Text style={[styles.tagChipText, { color: bwText }]}>{text}</Text>
    </View>
  );
};

export interface ProfileInfoCardProps {
  profile: {
    dob: string | Date | null;
    sexuality: string;
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
    intent: string;
  };
}

export const ProfileInfoCard = ({ profile }: ProfileInfoCardProps) => {
  const colors = useThemeColor();
  const isLight = colors.background === '#ffffff';
  const bwBackground = isLight ? '#ffffff' : '#000000';
  const bwBorder = isLight ? '#e4e4e7' : '#27272a';

  return (
    <View style={[styles.cardContainer, { backgroundColor: bwBackground }]}>
      
      {/* 2. Top Info Row (Primary Attributes) */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalRow}>
        <InfoRowItem icon="calendar-outline" text={`${calculateAge(profile.dob)} Years`} />
        <InfoRowItem icon="heart-outline" text={profile.sexuality} />
        <InfoRowItem icon="resize-outline" text={formatHeight(profile.height)} />
        <InfoRowItem icon="location-outline" text={profile.general_location} isLast />
      </ScrollView>

      <View style={[styles.horizontalDivider, { backgroundColor: bwBorder }]} />

      {/* 3. Lifestyle Section (Habits Row) */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalRow}>
        <InfoRowItem icon="wine-outline" text={`Drink: ${profile.drinking_habit}`} />
        <InfoRowItem icon="medical-outline" text={`Smoke: ${profile.smoking_habit}`} />
        <InfoRowItem icon="leaf-outline" text={`Weed: ${profile.weed_usage}`} />
        <InfoRowItem icon="pill" iconFamily="MaterialCommunityIcons" text={`Drugs: ${profile.drug_usage}`} isLast />
      </ScrollView>

      <View style={[styles.horizontalDivider, { backgroundColor: bwBorder }]} />

      {/* 4. Details Section (Vertical List) */}
      <View style={styles.verticalList}>
        <DetailListItem icon="star-outline" label="Religion" value={profile.religion} />
        <View style={[styles.listDivider, { backgroundColor: bwBorder }]} />
        <DetailListItem icon="home-outline" label="Hometown" value={profile.hometown} />
        <View style={[styles.listDivider, { backgroundColor: bwBorder }]} />
        <DetailListItem icon="briefcase-outline" label="Occupation" value={profile.occupation} />
        <View style={[styles.listDivider, { backgroundColor: bwBorder }]} />
        
        {/* Looking For */}
        <DetailListItem icon="search-outline" label="Looking for" value={profile.intent} />
        <View style={[styles.listDivider, { backgroundColor: bwBorder }]} />

        {/* Multi-value fields display as Chips */}
        <View style={styles.tagSection}>
          <Text style={[styles.tagSectionLabel, { color: isLight ? '#71717a' : '#a1a1aa' }]}>Sports</Text>
          <View style={styles.tagWrap}>
            {profile.sports?.map((sport, i) => <TagChip key={i} text={sport} />)}
          </View>
        </View>

        <View style={[styles.listDivider, { backgroundColor: bwBorder }]} />

        <View style={styles.tagSection}>
          <Text style={[styles.tagSectionLabel, { color: isLight ? '#71717a' : '#a1a1aa' }]}>Hobbies</Text>
          <View style={styles.tagWrap}>
            {profile.hobbies?.map((hobby, i) => <TagChip key={i} text={hobby} />)}
          </View>
        </View>
      </View>

    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    borderRadius: 20,
    paddingVertical: 8,
    marginVertical: 12,
    // Soft shadow logic
    ...Platform.select({
      ios: {
        shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12,
      },
      android: {
        elevation: 4
      }
    })
  },
  horizontalRow: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    alignItems: 'center',
  },
  infoRowItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoRowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingRight: 16,
  },
  infoRowText: {
    fontSize: 14,
    fontWeight: '600',
  },
  verticalDivider: {
    width: 1,
    height: 16,
    marginRight: 16,
  },
  horizontalDivider: {
    height: 1,
    width: '100%',
  },
  verticalList: {
    paddingVertical: 8,
  },
  detailListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 64,
    paddingHorizontal: 20,
    gap: 16,
  },
  detailListIcon: {
    width: 24,
    alignItems: 'center',
  },
  detailListContent: {
    flex: 1,
    gap: 2,
  },
  detailListLabel: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  detailListValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  listDivider: {
    height: 1,
    marginLeft: 60, // Align with content, not icon
  },
  tagChip: {
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  tagChipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  tagSection: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  tagSectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tagWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
});
