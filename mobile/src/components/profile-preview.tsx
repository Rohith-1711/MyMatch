import React from 'react';
import {
  View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView,
  SafeAreaView
} from 'react-native';
import { useThemeColor } from '@/constants/Colors';
import { ProfileContent } from './profile-content';
import { Ionicons } from '@expo/vector-icons';

interface ProfilePreviewProps {
  visible: boolean;
  onClose: () => void;
  onSave: () => void;
  profile: any;
}

export function ProfilePreview({ visible, onClose, onSave, profile }: ProfilePreviewProps) {
  const colors = useThemeColor();

  const isLight = colors.background === '#ffffff';
  const bwBackground = isLight ? '#ffffff' : '#000000';
  const bwText = isLight ? '#000000' : '#ffffff';
  const bwBorder = isLight ? '#e4e4e7' : '#27272a';

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <SafeAreaView style={[styles.container, { backgroundColor: bwBackground }]}>
        
        {/* Header (Fixed) */}
        <View style={[styles.header, { borderBottomColor: bwBorder, backgroundColor: bwBackground }]}>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Ionicons name="chevron-back" size={24} color={bwText} />
            <Text style={[styles.closeBtnText, { color: bwText }]}>Edit Profile</Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: bwText }]}>Vibe Check</Text>
          <View style={{ width: 80 }} />
        </View>

        <ScrollView 
          showsVerticalScrollIndicator={false} 
          contentContainerStyle={styles.scrollContent}
          style={{ backgroundColor: bwBackground }}
        >
          <ProfileContent profile={profile} />
        </ScrollView>

        {/* Footer Action (Fixed) */}
        <View style={[styles.footer, { backgroundColor: bwBackground, borderTopColor: bwBorder }]}>
          <TouchableOpacity onPress={onSave} style={[styles.saveBtn, { backgroundColor: colors.tint }]}>
            <Text style={[styles.saveBtnText, { color: '#ffffff' }]}>Save & Go Live 🎉</Text>
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
    paddingHorizontal: 16, borderBottomWidth: 1,
  },
  headerTitle: { fontSize: 13, fontWeight: '900', letterSpacing: 1.5, textTransform: 'uppercase' },
  closeBtn: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingVertical: 8 
  },
  closeBtnText: { fontSize: 13, fontWeight: '800' },
  
  scrollContent: { 
    paddingBottom: 100,
    alignSelf: 'center',
    width: '100%',
    maxWidth: 600,
  },

  footer: {
    position: 'absolute', bottom: 0, width: '100%',
    paddingHorizontal: 24, paddingVertical: 20,
    borderTopWidth: 1,
    alignSelf: 'center',
    maxWidth: 600,
  },
  saveBtn: {
    height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.2, shadowRadius: 10, elevation: 5,
  },
  saveBtnText: { fontSize: 18, fontWeight: '900', letterSpacing: 0.5 },
});
