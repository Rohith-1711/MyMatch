import React from 'react';
import { View, Text, Dimensions, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  runOnJS,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { ProfileContent } from './profile-content';
import { useThemeColor } from '@/constants/Colors';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.4;

export interface ProfileCard {
  id: string;
  user_id: string;
  name: string;
  bio?: string;
  intent: string;
  photos: string[];
  dob?: string;
  sex?: string;
  sexuality?: string;
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
}

interface SwipeCardProps {
  profile: ProfileCard;
  onSwipeLeft: (profile: ProfileCard) => void;
  onSwipeRight: (profile: ProfileCard) => void;
  onCompliment: (profile: ProfileCard) => void;
  isFirst: boolean;
}

export function SwipeCard({ profile, onSwipeLeft, onSwipeRight, onCompliment, isFirst }: SwipeCardProps) {
  const colors = useThemeColor();
  const isLight = colors.background === '#ffffff';

  const bwBackground = isLight ? '#ffffff' : '#000000';
  const bwText = isLight ? '#000000' : '#ffffff';
  const bwMuted = isLight ? '#71717a' : '#a1a1aa';
  const actionBg = isLight ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.5)';

  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  const panGesture = Gesture.Pan()
    .activeOffsetX([-20, 20])
    .failOffsetY([-10, 10])
    .onUpdate((event) => {
      translateX.value = event.translationX;
      translateY.value = event.translationY * 0.15;
    })
    .onEnd(() => {
      if (translateX.value > SWIPE_THRESHOLD) {
        translateX.value = withSpring(SCREEN_WIDTH * 1.5, { damping: 20 }, () => runOnJS(onSwipeRight)(profile));
      } else if (translateX.value < -SWIPE_THRESHOLD) {
        translateX.value = withSpring(-SCREEN_WIDTH * 1.5, { damping: 20 }, () => runOnJS(onSwipeLeft)(profile));
      } else {
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
      }
    });

  const cardStyle = useAnimatedStyle(() => {
    const rotate = interpolate(translateX.value, [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2], [-10, 0, 10], Extrapolation.CLAMP);
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { rotate: `${rotate}deg` },
      ],
    };
  });

  const likeStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [20, SWIPE_THRESHOLD / 2], [0, 1], Extrapolation.CLAMP),
    transform: [{ scale: interpolate(translateX.value, [20, SWIPE_THRESHOLD / 2], [0.5, 1.2], Extrapolation.CLAMP) }],
  }));

  const nopeStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [-20, -SWIPE_THRESHOLD / 2], [0, 1], Extrapolation.CLAMP),
    transform: [{ scale: interpolate(translateX.value, [-20, -SWIPE_THRESHOLD / 2], [0.5, 1.2], Extrapolation.CLAMP) }],
  }));

  return (
    <View style={styles.container} pointerEvents={isFirst ? 'auto' : 'none'}>
      <GestureDetector gesture={panGesture}>
        <Animated.View style={[styles.card, { backgroundColor: bwBackground }, cardStyle]}>
          <ScrollView 
            showsVerticalScrollIndicator={false} 
            bounces={true}
            contentContainerStyle={styles.scrollContent}
          >
            <ProfileContent profile={profile as any} />
            
            {/* Explicit Action Buttons at the bottom of the profile */}
            <View style={[styles.bottomActions, { backgroundColor: bwBackground }]}>
               <TouchableOpacity 
                 onPress={() => onSwipeLeft(profile)}
                 style={[styles.miniActionBtn, { borderColor: '#ef4444', backgroundColor: actionBg }]}
               >
                 <Text style={{ fontSize: 24, color: '#ef4444' }}>✕</Text>
               </TouchableOpacity>

               <TouchableOpacity 
                 onPress={() => onCompliment(profile)}
                 style={[styles.miniActionBtn, { borderColor: '#7c3aed', width: 140, backgroundColor: actionBg }]}
               >
                 <Text style={[styles.miniActionText, { color: '#7c3aed' }]}>💌 Compliment</Text>
               </TouchableOpacity>

               <TouchableOpacity 
                 onPress={() => onSwipeRight(profile)}
                 style={[styles.miniActionBtn, { borderColor: '#22c55e', backgroundColor: actionBg }]}
               >
                 <Text style={{ fontSize: 24, color: '#22c55e' }}>♥</Text>
               </TouchableOpacity>
            </View>
          </ScrollView>

          {/* Like/Nope Overlays */}
          <Animated.View style={[styles.stamp, styles.likeStamp, likeStyle]}>
            <Text style={styles.stampTextLike}>LIKE</Text>
          </Animated.View>

          <Animated.View style={[styles.stamp, styles.nopeStamp, nopeStyle]}>
            <Text style={styles.stampTextNope}>NOPE</Text>
          </Animated.View>
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { ...StyleSheet.absoluteFillObject },
  card: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 20,
    borderRadius: 32, overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5, shadowRadius: 20, elevation: 15,
  },
  scrollContent: { paddingBottom: 20 },
  
  stamp: {
    position: 'absolute', top: 60,
    paddingHorizontal: 24, paddingVertical: 12,
    borderWidth: 6, borderRadius: 16,
    zIndex: 100,
  },
  likeStamp: { left: 40, transform: [{ rotate: '-15deg' }], borderColor: '#22c55e' },
  nopeStamp: { right: 40, transform: [{ rotate: '15deg' }], borderColor: '#ef4444' },
  stampTextLike: { color: '#22c55e', fontSize: 48, fontWeight: '900', letterSpacing: 4 },
  stampTextNope: { color: '#ef4444', fontSize: 48, fontWeight: '900', letterSpacing: 4 },

  bottomActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 32,
    gap: 20,
  },
  miniActionBtn: {
    height: 60, width: 60, borderRadius: 30,
    borderWidth: 2, alignItems: 'center', justifyContent: 'center',
  },
  miniActionText: { fontSize: 13, fontWeight: '900' },
});
