import React from 'react';
import { View, Text, Image, Dimensions, TouchableOpacity, StyleSheet } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  runOnJS,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { GradientView } from './gradient-view';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.3;

export interface ProfileCard {
  id: string;
  user_id: string;
  name: string;
  bio: string;
  intent: string;
  photos: string[];
}

interface SwipeCardProps {
  profile: ProfileCard;
  onSwipeLeft: (profile: ProfileCard) => void;
  onSwipeRight: (profile: ProfileCard) => void;
  onCompliment: (profile: ProfileCard) => void;
  isFirst: boolean;
}

const INTENT_COLORS: Record<string, string> = {
  dating: '#e11d48',
  platonic: '#7c3aed',
  both: '#d97706',
};

export function SwipeCard({ profile, onSwipeLeft, onSwipeRight, onCompliment, isFirst }: SwipeCardProps) {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      translateX.value = event.translationX;
      translateY.value = event.translationY * 0.3;
    })
    .onEnd(() => {
      if (translateX.value > SWIPE_THRESHOLD) {
        translateX.value = withSpring(SCREEN_WIDTH * 1.5, { damping: 15 }, () => runOnJS(onSwipeRight)(profile));
      } else if (translateX.value < -SWIPE_THRESHOLD) {
        translateX.value = withSpring(-SCREEN_WIDTH * 1.5, { damping: 15 }, () => runOnJS(onSwipeLeft)(profile));
      } else {
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
      }
    });

  const cardStyle = useAnimatedStyle(() => {
    const rotate = interpolate(translateX.value, [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2], [-12, 0, 12], Extrapolation.CLAMP);
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { rotate: `${rotate}deg` },
      ],
    };
  });

  const likeStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [20, SWIPE_THRESHOLD], [0, 1], Extrapolation.CLAMP),
    transform: [{ scale: interpolate(translateX.value, [20, SWIPE_THRESHOLD], [0.7, 1], Extrapolation.CLAMP) }],
  }));

  const nopeStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [-20, -SWIPE_THRESHOLD], [0, 1], Extrapolation.CLAMP),
    transform: [{ scale: interpolate(translateX.value, [-20, -SWIPE_THRESHOLD], [0.7, 1], Extrapolation.CLAMP) }],
  }));

  const photoUrl = profile.photos?.[0] || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800';
  const intentColor = INTENT_COLORS[profile.intent] || '#e11d48';

  return (
    <View style={StyleSheet.absoluteFillObject} pointerEvents={isFirst ? 'auto' : 'none'}>
      <GestureDetector gesture={panGesture}>
        <Animated.View style={[styles.card, cardStyle]}>
          <Image source={{ uri: photoUrl }} style={styles.image} resizeMode="cover" />

          {/* Gradient overlay */}
          <GradientView
            colors={['transparent', 'rgba(0,0,0,0.2)', 'rgba(0,0,0,0.85)', '#000']}
            style={styles.gradient}
          />

          {/* Like stamp */}
          <Animated.View style={[styles.stamp, styles.likeStamp, likeStyle]}>
            <Text style={styles.stampTextLike}>LIKE</Text>
          </Animated.View>

          {/* Nope stamp */}
          <Animated.View style={[styles.stamp, styles.nopeStamp, nopeStyle]}>
            <Text style={styles.stampTextNope}>NOPE</Text>
          </Animated.View>

          {/* User info */}
          <View style={styles.info}>
            <View style={styles.nameRow}>
              <Text style={styles.name}>{profile.name}</Text>
              <View style={[styles.intentBadge, { backgroundColor: intentColor + '33', borderColor: intentColor }]}>
                <Text style={[styles.intentText, { color: intentColor }]}>
                  {profile.intent === 'dating' ? '❤️' : profile.intent === 'platonic' ? '🤝' : '✨'} {profile.intent}
                </Text>
              </View>
            </View>

            {profile.bio ? (
              <Text style={styles.bio} numberOfLines={2}>{profile.bio}</Text>
            ) : null}

            <TouchableOpacity
              onPress={() => onCompliment(profile)}
              style={styles.complimentBtn}
              activeOpacity={0.8}
            >
              <Text style={styles.complimentText}>💌 Send Compliment</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    position: 'absolute', top: 8, left: 12, right: 12, bottom: 8,
    borderRadius: 32, overflow: 'hidden', backgroundColor: '#18181b',
    shadowColor: '#000', shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.6, shadowRadius: 40, elevation: 20,
  },
  image: { ...StyleSheet.absoluteFillObject },
  gradient: { position: 'absolute', bottom: 0, left: 0, right: 0, height: '65%' },
  stamp: {
    position: 'absolute', top: 50,
    paddingHorizontal: 20, paddingVertical: 8,
    borderWidth: 4, borderRadius: 12,
  },
  likeStamp: { left: 24, transform: [{ rotate: '-15deg' }], borderColor: '#22c55e' },
  nopeStamp: { right: 24, transform: [{ rotate: '15deg' }], borderColor: '#ef4444' },
  stampTextLike: { color: '#22c55e', fontSize: 36, fontWeight: '900', letterSpacing: 2 },
  stampTextNope: { color: '#ef4444', fontSize: 36, fontWeight: '900', letterSpacing: 2 },
  info: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 24, gap: 10 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 10, flexWrap: 'wrap' },
  name: { fontSize: 30, fontWeight: '900', color: '#fff', letterSpacing: -0.5 },
  intentBadge: {
    paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 20, borderWidth: 1,
  },
  intentText: { fontSize: 11, fontWeight: '800', textTransform: 'capitalize' },
  bio: { fontSize: 15, color: 'rgba(255,255,255,0.8)', lineHeight: 22 },
  complimentBtn: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20, paddingVertical: 12,
    alignItems: 'center', marginTop: 4,
  },
  complimentText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
