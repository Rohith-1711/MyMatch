import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, Alert,
  ActivityIndicator, ScrollView, StyleSheet, KeyboardAvoidingView, Platform, Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/auth';
import { useRouter } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import Slider from '@react-native-community/slider';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import DraggableFlatList, { ScaleDecorator } from 'react-native-draggable-flatlist';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useThemeColor } from '@/constants/Colors';
import { ProfilePreview } from '@/components/profile-preview';

const TOTAL_STEPS = 19;

const INTENTS = [
  { id: 'dating', label: '❤️ Dating', desc: 'Looking for romance' },
  { id: 'platonic', label: '🤝 Friends', desc: 'New friendships' },
  { id: 'both', label: '✨ Both', desc: 'Open to anything' },
];

const SEX_OPTIONS = ['Male', 'Female', 'Prefer not to say'];
const SEXUALITY_OPTIONS = ['Straight', 'Bisexual', 'Gay/Lesbian', 'Other'];
const HABIT_OPTIONS = ['Yes', 'Sometimes', 'Never', 'Prefer not to say'];

const RELIGION_OPTIONS = [
  { id: 'Hindu', icon: '🛕' }, { id: 'Muslim', icon: '☪️' }, { id: 'Christian', icon: '✝️' },
  { id: 'Spiritual', icon: '🕉️' }, { id: 'Buddhist', icon: '☸️' }, { id: 'Jewish', icon: '✡️' },
  { id: 'Sikh', icon: '🪯' }, { id: 'Atheist', icon: '🚫' }, { id: 'Agnostic', icon: '🌍' },
  { id: 'Prefer not to say', icon: '🙈' }
];

const SPORTS_OPTIONS = [
  { id: 'Cricket', icon: '🏏' }, { id: 'Football', icon: '⚽' }, { id: 'Basketball', icon: '🏀' },
  { id: 'Tennis', icon: '🎾' }, { id: 'Table Tennis', icon: '🏓' }, { id: 'Badminton', icon: '🏸' },
  { id: 'Volleyball', icon: '🏐' }, { id: 'Pickleball', icon: '🏏' }, { id: 'Running', icon: '🏃' },
  { id: 'Cycling', icon: '🚴' }
];

const HOBBIES_OPTIONS = [
  { id: 'Music', icon: '🎵' }, { id: 'Movies', icon: '🎬' }, { id: 'Reading', icon: '📚' },
  { id: 'Traveling', icon: '✈️' }, { id: 'Gaming', icon: '🎮' }, { id: 'Photography', icon: '📸' },
  { id: 'Cooking', icon: '🧑‍🍳' }, { id: 'Art', icon: '🎨' }, { id: 'Dancing', icon: '💃' },
  { id: 'Tech', icon: '💻' }
];

export default function OnboardingScreen() {
  const { session, setProfile } = useAuthStore();
  const router = useRouter();
  const colors = useThemeColor();
  
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);

  // Form State
  const [photos, setPhotos] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [name, setName] = useState('');
  const [dob, setDob] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [sex, setSex] = useState('');
  const [sexuality, setSexuality] = useState('');
  const [intent, setIntent] = useState<'dating' | 'platonic' | 'both'>('dating');
  const [height, setHeight] = useState(170); // cm
  const [location, setLocation] = useState('');
  const [gettingLocation, setGettingLocation] = useState(false);
  const [drinking, setDrinking] = useState('');
  const [smoking, setSmoking] = useState('');
  const [weed, setWeed] = useState('');
  const [drugs, setDrugs] = useState('');
  const [religion, setReligion] = useState('');
  const [religionOther, setReligionOther] = useState('');
  const [hometown, setHometown] = useState('');
  const [occupation, setOccupation] = useState('');
  const [sports, setSports] = useState<string[]>([]);
  const [hobbies, setHobbies] = useState<string[]>([]);
  const [bio, setBio] = useState('');
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);

  const handleDetectLocation = async () => {
    setGettingLocation(true);
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Please enter your location manually.');
        setGettingLocation(false);
        return;
      }
      let loc = await Location.getCurrentPositionAsync({});
      
      if (Platform.OS === 'web') {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${loc.coords.latitude}&lon=${loc.coords.longitude}`);
        const data = await res.json();
        if (data && data.address) {
          const area = data.address.city || data.address.town || data.address.village || data.address.suburb || data.address.district;
          const state = data.address.state || data.address.country;
          setLocation(area ? `${area}, ${state}` : state);
        }
      } else {
        let geocode = await Location.reverseGeocodeAsync({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude
        });
        if (geocode && geocode.length > 0) {
          const place = geocode[0];
          const area = place.city || place.subregion || place.district;
          setLocation(area ? `${area}, ${place.region || place.country}` : (place.region || place.country || ''));
        }
      }
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Could not fetch location.');
    }
    setGettingLocation(false);
  };

  const pickImage = async () => {
    if (photos.length >= 6) { return Alert.alert('Limit Reached', 'Up to 6 photos max.'); }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 5],
      quality: 0.8,
    });
    if (!result.canceled && result.assets?.length > 0) {
      uploadImage(result.assets[0].uri);
    }
  };

  const uploadImage = async (uri: string) => {
    if (!session?.user) return;
    setUploading(true);
    try {
      let ext = 'jpg';
      if (!uri.startsWith('blob:') && uri.includes('.')) {
        const parts = uri.split('.');
        ext = parts[parts.length - 1].split('?')[0].toLowerCase();
      }
      const fileName = `${Date.now()}.${ext}`;
      const filePath = `${session.user.id}/${fileName}`;
      let uploadBody;

      if (Platform.OS === 'web') {
        const response = await fetch(uri);
        uploadBody = await response.blob();
      } else {
        const formData = new FormData();
        formData.append('file', { uri, name: fileName, type: `image/jpeg` } as any);
        uploadBody = formData;
      }

      const { error: uploadError } = await supabase.storage
        .from('photos')
        .upload(filePath, uploadBody, { cacheControl: '3600', upsert: false });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('photos').getPublicUrl(filePath);
      setPhotos(prev => [...prev, data.publicUrl]);
    } catch (error: any) {
      Alert.alert('Upload Failed', error.message);
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (photoUrl: string) => {
    setPhotos(prev => prev.filter(url => url !== photoUrl));
  };

  const renderPhotoItem = ({ item, drag, isActive, getIndex }: any) => {
    const index = getIndex ? getIndex() : 0;
    const isMain = index === 0;
    return (
      <ScaleDecorator>
        <TouchableOpacity
          activeOpacity={0.9}
          onLongPress={drag}
          disabled={isActive}
          style={[styles.photoCard, { backgroundColor: colors.card, borderColor: colors.border }, isActive && { opacity: 0.7 }]}
        >
          <Image source={{ uri: item }} style={styles.photoImg} />
          {isMain && (
             <View style={[styles.mainBadge, { backgroundColor: colors.tint }]}>
               <Text style={styles.mainBadgeText}>⭐ Main</Text>
             </View>
          )}
          <TouchableOpacity onPress={() => removeImage(item)} style={styles.removeBtn}>
             <Text style={styles.removeBtnText}>✕</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      </ScaleDecorator>
    );
  };

  const toggleSelection = (item: string, list: string[], setList: (val: string[]) => void) => {
    if (list.includes(item)) setList(list.filter(i => i !== item));
    else setList([...list, item]);
  };

  const nextStep = () => {
    if (step === 0 && photos.length === 0) return Alert.alert('Photos Required', 'Please upload at least 1 photo to continue.');
    if (step === 1 && !name.trim()) return Alert.alert('Required', 'Please enter your name.');
    if (step === 2) {
      if (!dob) return Alert.alert('Required', 'Please select your Date of Birth.');
      const ageDiff = new Date().getTime() - dob.getTime();
      const ageDate = new Date(ageDiff); 
      const age = Math.abs(ageDate.getUTCFullYear() - 1970);
      if (age < 18) return Alert.alert('Too Young', 'You must be at least 18 years old to use MyMatch.');
    }
    if (step === 3 && !sex) return Alert.alert('Required', 'Please select your sex.');
    if (step === 4 && !sexuality) return Alert.alert('Required', 'Please select your sexuality.');
    if (step === 7 && !location.trim()) return Alert.alert('Required', 'Please enter your location.');
    if (step === 8 && !drinking) return Alert.alert('Required', 'Please select an option.');
    if (step === 9 && !smoking) return Alert.alert('Required', 'Please select an option.');
    if (step === 10 && !weed) return Alert.alert('Required', 'Please select an option.');
    if (step === 11 && !drugs) return Alert.alert('Required', 'Please select an option.');
    if (step === 12 && !religion) return Alert.alert('Required', 'Please select a religion (or Prefer not to say).');
    if (step === 13 && !hometown.trim()) return Alert.alert('Required', 'Please enter your hometown.');
    if (step === 14 && !occupation.trim()) return Alert.alert('Required', 'Please enter your occupation.');
    if (step === 17 && !bio.trim()) return Alert.alert('Required', 'Please write a short bio about yourself.');

    setStep(s => Math.min(s + 1, TOTAL_STEPS - 1));
  };

  const handleSaveProfile = async () => {
    if (!session?.user) return;
    setLoading(true);
    
    const finalReligion = religion === 'Other' ? religionOther : religion;

    const newProfile = {
      user_id: session.user.id,
      name: name.trim(),
      dob: dob?.toISOString().split('T')[0],
      sex,
      sexuality,
      intent,
      height,
      general_location: location.trim(),
      drinking_habit: drinking,
      smoking_habit: smoking,
      weed_usage: weed,
      drug_usage: drugs,
      religion: finalReligion,
      hometown: hometown.trim(),
      occupation: occupation.trim(),
      sports,
      hobbies,
      bio: bio.trim(),
      photos,
      is_precise_location_opted_in: false,
      is_profile_completed: true,
    };

    const { data, error } = await supabase.from('profiles').upsert([newProfile], { onConflict: 'user_id' }).select().single();
    setLoading(false);
    
    if (error) { 
      Alert.alert('Error Savings Profile', error.message); 
    } else { 
      setProfile(data); 
      router.replace('/(app)/(tabs)'); 
    }
  };

  const renderChips = (options: string[], selected: string, onSelect: (val: string) => void) => (
    <View style={styles.chipWrap}>
      {options.map(opt => (
        <TouchableOpacity 
          key={opt} 
          onPress={() => onSelect(opt)} 
          style={[styles.chip, { backgroundColor: colors.card, borderColor: colors.border }, selected === opt && { backgroundColor: colors.tint, borderColor: colors.tint }]} 
          activeOpacity={0.8}
        >
          <Text style={[styles.chipText, { color: colors.textMuted }, selected === opt && { color: '#fff' }]}>{opt}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderEmojiGrid = (options: any[], selected: string | string[], onSelect: Function, multi = false) => (
    <View style={styles.gridWrap}>
      {options.map(opt => {
        const isActive = multi ? (selected as string[]).includes(opt.id) : selected === opt.id;
        return (
          <TouchableOpacity 
            key={opt.id} 
            onPress={() => multi ? onSelect(opt.id, selected, setSports) : onSelect(opt.id)} 
            style={[styles.gridCard, { backgroundColor: colors.card, borderColor: colors.border }, isActive && { backgroundColor: colors.card, borderColor: colors.tint }]} 
            activeOpacity={0.8}
          >
            <Text style={styles.gridEmoji}>{opt.icon}</Text>
            <Text style={[styles.gridText, { color: colors.textMuted }, isActive && { color: colors.text }]}>{opt.id}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  const formatHeight = (cm: number) => {
    const inches = Math.round(cm / 2.54);
    const feet = Math.floor(inches / 12);
    const remInches = inches % 12;
    return `${cm} cm (${feet}'${remInches}")`;
  };

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.background }}>
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          
          {/* Progress Header */}
          <View style={styles.topNav}>
            <TouchableOpacity onPress={() => step > 0 ? setStep(s => s - 1) : null} style={{ opacity: step > 0 ? 1 : 0 }}>
              <Text style={styles.backArrow}>←</Text>
            </TouchableOpacity>
            <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
              <View style={[styles.progressFill, { width: `${((step + 1) / TOTAL_STEPS) * 100}%`, backgroundColor: colors.tint }]} />
            </View>
            <Text style={[styles.stepCount, { color: colors.textMuted }]}>{step + 1}/{TOTAL_STEPS}</Text>
          </View>

          {step === 0 ? (
            <View style={styles.scrollContent}>
               <View style={{ flex: 1, justifyContent: 'center' }}>
                 <Text style={[styles.title, { color: colors.text }]}>Upload Photos 📸</Text>
                 <Text style={[styles.subtitle, { color: colors.textMuted }]}>Hold and drag to reorder. The first photo is your main profile picture!</Text>
                 
                 <View style={{ height: 260, marginVertical: 20 }}>
                   <DraggableFlatList
                     data={photos}
                     onDragEnd={({ data }: { data: string[] }) => setPhotos(data)}
                     keyExtractor={(item: string) => item}
                     renderItem={renderPhotoItem}
                     horizontal
                     showsHorizontalScrollIndicator={false}
                     contentContainerStyle={{ gap: 12, paddingRight: 40 }}
                     ListFooterComponent={() => photos.length < 6 ? (
                        <TouchableOpacity onPress={pickImage} disabled={uploading} style={[styles.addBtnCard, { borderColor: colors.border }]}>
                          {uploading ? <ActivityIndicator color={colors.tint}/> : (
                            <>
                              <Text style={[styles.addBtnIcon, { color: colors.tint }]}>+</Text>
                              <Text style={[styles.addBtnLabel, { color: colors.textMuted }]}>Add Photo</Text>
                            </>
                          )}
                        </TouchableOpacity>
                     ) : null}
                   />
                 </View>

                 <View style={[styles.tipCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                   <Text style={[styles.tipTitle, { color: colors.text }]}>📝 Photo Tips</Text>
                   <Text style={[styles.tipText, { color: colors.textMuted }]}>• Use a clear, well-lit photo of your face</Text>
                   <Text style={[styles.tipText, { color: colors.textMuted }]}>• Add at least 2–3 photos to get more matches</Text>
                 </View>
               </View>
            </View>
          ) : (
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              
              {step === 1 && (
                <View style={styles.stepContainer}>
                  <Text style={[styles.title, { color: colors.text }]}>What's your name?</Text>
                  <Text style={[styles.subtitle, { color: colors.textMuted }]}>This is how you'll appear on MyMatch.</Text>
                  <TextInput placeholder="Your First Name" placeholderTextColor={colors.textMuted} value={name} onChangeText={setName} style={[styles.inputLarge, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]} autoFocus />
                </View>
              )}

              {step === 2 && (
                <View style={styles.stepContainer}>
                  <Text style={[styles.title, { color: colors.text }]}>When were you born?</Text>
                  <Text style={[styles.subtitle, { color: colors.textMuted }]}>You must be at least 18 to use MyMatch. Your age will be public.</Text>
                  {Platform.OS === 'web' ? (
                    React.createElement('input', {
                      type: 'date',
                      max: new Date().toISOString().split('T')[0],
                      value: dob ? dob.toISOString().split('T')[0] : '',
                      onChange: (e: any) => {
                        if (e.target.value) {
                          setDob(new Date(e.target.value));
                        }
                      },
                      style: { 
                        padding: '16px', borderRadius: '16px', 
                        backgroundColor: colors.card, color: colors.text, 
                        border: `1px solid ${colors.border}`, fontSize: '18px', 
                        colorScheme: colors.background === '#ffffff' ? 'light' : 'dark', fontFamily: 'inherit'
                      }
                    })
                  ) : (
                    <>
                      <TouchableOpacity onPress={() => setShowDatePicker(true)} style={[styles.datePickerBtn, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <Text style={[styles.datePickerText, { color: colors.text }]}>{dob ? dob.toDateString() : 'Select your birth date 📅'}</Text>
                      </TouchableOpacity>
                      {showDatePicker && (
                        <DateTimePicker 
                          value={dob || new Date(2000, 0, 1)} 
                          mode="date" 
                          display="default"
                          maximumDate={new Date()}
                          onChange={(evt, selected) => {
                            setShowDatePicker(Platform.OS === 'ios');
                            if (selected) setDob(selected);
                          }} 
                        />
                      )}
                    </>
                  )}
                </View>
              )}

              {step === 3 && (
                <View style={styles.stepContainer}>
                  <Text style={[styles.title, { color: colors.text }]}>What's your sex?</Text>
                  {renderChips(SEX_OPTIONS, sex, setSex)}
                </View>
              )}

              {step === 4 && (
                <View style={styles.stepContainer}>
                  <Text style={[styles.title, { color: colors.text }]}>Your sexuality?</Text>
                  {renderChips(SEXUALITY_OPTIONS, sexuality, setSexuality)}
                </View>
              )}

              {step === 5 && (
                <View style={styles.stepContainer}>
                  <Text style={[styles.title, { color: colors.text }]}>What are you looking for?</Text>
                  <View style={{ gap: 12 }}>
                    {INTENTS.map(({ id, label, desc }) => (
                      <TouchableOpacity key={id} onPress={() => setIntent(id as any)} style={[styles.intentCard, { backgroundColor: colors.card, borderColor: colors.border }, intent === id && { borderColor: colors.tint }]}>
                        <Text style={[styles.intentLabel, { color: colors.text }, intent === id && { color: colors.tint }]}>{label}</Text>
                        <Text style={[styles.intentDesc, { color: colors.textMuted }]}>{desc}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}

              {step === 6 && (
                <View style={styles.stepContainer}>
                  <Text style={[styles.title, { color: colors.text }]}>How tall are you?</Text>
                  <Text style={[styles.heightDisplay, { color: colors.tint }]}>{formatHeight(height)}</Text>
                  <Slider
                    style={{ width: '100%', height: 40, marginTop: 20 }}
                    minimumValue={120} maximumValue={220} step={1}
                    value={height} onValueChange={setHeight}
                    minimumTrackTintColor={colors.tint} maximumTrackTintColor={colors.border} thumbTintColor={colors.text}
                  />
                </View>
              )}

              {step === 7 && (
                <View style={styles.stepContainer}>
                  <Text style={[styles.title, { color: colors.text }]}>Where do you live?</Text>
                  <Text style={[styles.subtitle, { color: colors.textMuted }]}>We use this to show you potential matches nearby.</Text>
                  <TextInput placeholder="e.g. New York, USA" placeholderTextColor={colors.textMuted} value={location} onChangeText={setLocation} style={[styles.inputLarge, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]} />
                  <View style={styles.divider}><Text style={[styles.dividerText, { color: colors.textMuted }]}>OR</Text></View>
                  <TouchableOpacity onPress={handleDetectLocation} disabled={gettingLocation} style={[styles.gpsBtn, { backgroundColor: colors.card }]}>
                    <Text style={styles.gpsBtnText}>{gettingLocation ? 'Finding you...' : '📍 Auto-detect location'}</Text>
                  </TouchableOpacity>
                </View>
              )}

              {step === 8 && (
                <View style={styles.stepContainer}>
                  <Text style={[styles.title, { color: colors.text }]}>Do you drink? 🍺</Text>
                  {renderChips(HABIT_OPTIONS, drinking, setDrinking)}
                </View>
              )}
              {step === 9 && (
                <View style={styles.stepContainer}>
                  <Text style={[styles.title, { color: colors.text }]}>Do you smoke? 🚬</Text>
                  {renderChips(HABIT_OPTIONS, smoking, setSmoking)}
                </View>
              )}
              {step === 10 && (
                <View style={styles.stepContainer}>
                  <Text style={[styles.title, { color: colors.text }]}>Weed usage? 🍃</Text>
                  {renderChips(HABIT_OPTIONS, weed, setWeed)}
                </View>
              )}
              {step === 11 && (
                <View style={styles.stepContainer}>
                  <Text style={[styles.title, { color: colors.text }]}>Other drugs? 💊</Text>
                  {renderChips(HABIT_OPTIONS, drugs, setDrugs)}
                </View>
              )}

              {step === 12 && (
                <View style={styles.stepContainer}>
                  <Text style={[styles.title, { color: colors.text }]}>Your religion? 🕊️</Text>
                  {renderEmojiGrid(RELIGION_OPTIONS, religion, (id: string) => { setReligion(id); if (id !== 'Other') setReligionOther(''); })}
                  
                  <TouchableOpacity onPress={() => setReligion('Other')} style={[styles.chip, { backgroundColor: colors.card, borderColor: colors.border, marginTop: 12 }, religion === 'Other' && { backgroundColor: colors.tint, borderColor: colors.tint }]}>
                    <Text style={[styles.chipText, { color: colors.textMuted }, religion === 'Other' && { color: '#fff' }]}>Other / specific...</Text>
                  </TouchableOpacity>
                  {religion === 'Other' && (
                    <TextInput placeholder="Specify..." placeholderTextColor={colors.textMuted} value={religionOther} onChangeText={setReligionOther} style={[styles.inputLarge, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text, marginTop: 12 }]} autoFocus />
                  )}
                </View>
              )}

              {step === 13 && (
                <View style={styles.stepContainer}>
                  <Text style={[styles.title, { color: colors.text }]}>Where's your Hometown?</Text>
                  <TextInput placeholder="e.g. Kyoto, Japan" placeholderTextColor={colors.textMuted} value={hometown} onChangeText={setHometown} style={[styles.inputLarge, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]} />
                </View>
              )}

              {step === 14 && (
                <View style={styles.stepContainer}>
                  <Text style={[styles.title, { color: colors.text }]}>What's your Occupation?</Text>
                  <Text style={[styles.subtitle, { color: colors.textMuted }]}>What do you do for a living?</Text>
                  <TextInput placeholder="e.g. Software Engineer, Student" placeholderTextColor={colors.textMuted} value={occupation} onChangeText={setOccupation} style={[styles.inputLarge, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]} autoFocus />
                </View>
              )}

              {step === 15 && (
                <View style={styles.stepContainer}>
                  <Text style={[styles.title, { color: colors.text }]}>Sports you like? 🏅</Text>
                  <Text style={[styles.subtitle, { color: colors.textMuted }]}>Select all that apply.</Text>
                  {renderEmojiGrid(SPORTS_OPTIONS, sports, toggleSelection, true)}
                </View>
              )}

              {step === 16 && (
                <View style={styles.stepContainer}>
                  <Text style={[styles.title, { color: colors.text }]}>Your hobbies? 🎨</Text>
                  <Text style={[styles.subtitle, { color: colors.textMuted }]}>Pick what interests you.</Text>
                  <View style={styles.chipWrap}>
                    {HOBBIES_OPTIONS.map(opt => {
                      const isActive = hobbies.includes(opt.id);
                      return (
                        <TouchableOpacity key={opt.id} onPress={() => toggleSelection(opt.id, hobbies, setHobbies)} style={[styles.chip, { backgroundColor: colors.card, borderColor: colors.border }, isActive && { backgroundColor: colors.tint, borderColor: colors.tint }]}>
                          <Text style={[styles.chipText, { color: colors.textMuted }, isActive && { color: '#fff' }]}>{opt.icon} {opt.id}</Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              )}

              {step === 17 && (
                <View style={styles.stepContainer}>
                  <Text style={[styles.title, { color: colors.text }]}>Add a Bio ✍️</Text>
                  <Text style={[styles.subtitle, { color: colors.textMuted }]}>Write a little bit about yourself and what you're looking for!</Text>
                  <View style={[styles.bioContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <TextInput 
                      placeholder="Tell something interesting about yourself...&#10;What are you looking for?" 
                      placeholderTextColor={colors.textMuted} 
                      value={bio} 
                      onChangeText={setBio} 
                      style={[styles.bioInput, { color: colors.text }]} 
                      multiline 
                      maxLength={300}
                      textAlignVertical="top"
                    />
                    <Text style={styles.charCount}>{bio.length}/300</Text>
                  </View>
                </View>
              )}

              {step === 18 && (
                <View style={styles.stepContainer}>
                  <Text style={[styles.title, { color: colors.text }]}>Almost there! 🚀</Text>
                  <Text style={[styles.subtitle, { color: colors.textMuted }]}>
                    Your profile is looking great. Review how others will see it before saving.
                  </Text>
                  
                  <View style={{ gap: 16, marginTop: 20 }}>
                    <TouchableOpacity 
                      onPress={() => setIsPreviewVisible(true)} 
                      style={[styles.previewBtn, { borderColor: colors.tint }]}
                    >
                      <Text style={[styles.previewBtnText, { color: colors.tint }]}>👁️ Preview Profile</Text>
                    </TouchableOpacity>
                    
                    <View style={[styles.tipCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                       <Text style={[styles.tipTitle, { color: colors.text }]}>✨ Pro-Tip</Text>
                       <Text style={[styles.tipText, { color: colors.textMuted }]}>
                         High-quality photos and a meaningful bio increase your match rate by 3x!
                       </Text>
                    </View>
                  </View>
                </View>
              )}
            </ScrollView>
          )}

          <View style={styles.footer}>
            {step < TOTAL_STEPS - 1 ? (
              <TouchableOpacity onPress={nextStep} style={[styles.primaryBtn, { backgroundColor: colors.tint, shadowColor: colors.tint }]}>
                <Text style={styles.primaryBtnText}>Continue →</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity onPress={handleSaveProfile} disabled={loading} style={[styles.primaryBtn, { backgroundColor: colors.tint, shadowColor: colors.tint }, loading && { opacity: 0.6 }]}>
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryBtnText}>Complete Profile 🎉</Text>}
              </TouchableOpacity>
            )}
          </View>

          <ProfilePreview 
            visible={isPreviewVisible}
            onClose={() => setIsPreviewVisible(false)}
            onSave={() => {
              setIsPreviewVisible(false);
              handleSaveProfile();
            }}
            profile={{
              name, dob, sex, sexuality, intent, height,
              general_location: location, drinking_habit: drinking,
              smoking_habit: smoking, weed_usage: weed, drug_usage: drugs,
              religion, hometown, occupation, sports, hobbies, bio, photos
            }}
          />

        </KeyboardAvoidingView>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  topNav: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 24, paddingTop: 16, paddingBottom: 16, gap: 16 },
  backArrow: { color: '#a1a1aa', fontSize: 24, fontWeight: '700' },
  progressBar: { flex: 1, height: 6, borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%' },
  stepCount: { fontSize: 13, fontWeight: '700' },
  
  scrollContent: { flexGrow: 1, paddingHorizontal: 24, paddingBottom: 40 },
  stepContainer: { flex: 1, justifyContent: 'center' },
  title: { fontSize: 36, fontWeight: '900', letterSpacing: -1, marginBottom: 8 },
  subtitle: { fontSize: 15, marginBottom: 32, lineHeight: 22 },
  
  photoCard: {
    width: 180, height: 240, borderRadius: 20, 
    overflow: 'hidden', borderWidth: 1
  },
  photoImg: { width: '100%', height: '100%' },
  mainBadge: {
    position: 'absolute', bottom: 12, left: 12,
    paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12,
  },
  mainBadgeText: { color: '#fff', fontSize: 11, fontWeight: '800' },
  removeBtn: {
    position: 'absolute', top: 12, right: 12, width: 28, height: 28, borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.7)', alignItems: 'center', justifyContent: 'center'
  },
  removeBtnText: { color: '#fff', fontSize: 12, fontWeight: '800' },
  addBtnCard: {
    width: 180, height: 240, borderRadius: 20, borderWidth: 2,
    borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center', backgroundColor: 'transparent'
  },
  addBtnIcon: { fontSize: 40, fontWeight: '300' },
  addBtnLabel: { fontSize: 14, marginTop: 8, fontWeight: '600' },
  tipCard: { borderRadius: 20, padding: 20, gap: 8, marginTop: 20, borderWidth: 1 },
  tipTitle: { fontSize: 15, fontWeight: '800', marginBottom: 4 },
  tipText: { fontSize: 14 },

  inputLarge: {
    borderWidth: 1,
    borderRadius: 16, padding: 20, fontSize: 18, fontWeight: '600'
  },
  inputLabel: { fontSize: 14, fontWeight: '600', marginBottom: 8, marginLeft: 4 },
  
  datePickerBtn: {
    borderWidth: 1,
    borderRadius: 16, padding: 20, alignItems: 'center'
  },
  datePickerText: { fontSize: 18, fontWeight: '600' },
  
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  chip: {
    paddingHorizontal: 20, paddingVertical: 14, borderRadius: 24,
    borderWidth: 1
  },
  chipText: { fontSize: 16, fontWeight: '600' },

  intentCard: {
    padding: 20, borderRadius: 20, 
    borderWidth: 1
  },
  intentLabel: { fontSize: 18, fontWeight: '800', marginBottom: 4 },
  intentDesc: { fontSize: 14 },

  heightDisplay: { fontSize: 24, fontWeight: '800', textAlign: 'center', marginVertical: 10 },

  divider: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginVertical: 24 },
  dividerText: { fontWeight: '800' },
  
  gpsBtn: { borderRadius: 16, padding: 20, alignItems: 'center', borderWidth: 1, borderColor: '#0ea5e9' },
  gpsBtnText: { color: '#38bdf8', fontSize: 16, fontWeight: '700' },

  gridWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'space-between' },
  gridCard: {
    width: '48%', borderWidth: 1,
    borderRadius: 16, padding: 20, alignItems: 'center', gap: 8
  },
  gridEmoji: { fontSize: 32 },
  gridText: { fontSize: 14, fontWeight: '600' },

  bioContainer: {
    borderWidth: 1,
    borderRadius: 16, overflow: 'hidden'
  },
  bioInput: {
    padding: 20, fontSize: 17, minHeight: 180, lineHeight: 24
  },
  charCount: { alignSelf: 'flex-end', padding: 12, color: '#52525b', fontSize: 13, fontWeight: '600' },

  footer: { paddingHorizontal: 24, paddingBottom: Platform.OS === 'ios' ? 0 : 20 },
  primaryBtn: {
    paddingVertical: 18, borderRadius: 20, alignItems: 'center',
    shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.5, shadowRadius: 16, elevation: 12
  },
  primaryBtnText: { color: '#fff', fontSize: 18, fontWeight: '800', letterSpacing: 0.5 },
  
  previewBtn: {
    paddingVertical: 18, borderRadius: 20, alignItems: 'center',
    borderWidth: 2, borderStyle: 'dashed'
  },
  previewBtnText: { fontSize: 18, fontWeight: '800' },
});
