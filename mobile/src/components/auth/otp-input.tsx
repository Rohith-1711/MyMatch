import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  NativeSyntheticEvent,
  StyleSheet,
  Text,
  TextInput,
  TextInputKeyPressEventData,
  TouchableOpacity,
  View,
} from 'react-native';
import { useThemeColor } from '@/constants/Colors';

const OTP_LENGTH = 8;

interface OtpInputProps {
  value: string;
  onChange: (value: string) => void;
  hasError?: boolean;
}

export function OtpInput({ value, onChange, hasError }: OtpInputProps) {
  const colors = useThemeColor();
  const inputRefs = useRef<(TextInput | null)[]>([]);
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(''));

  // Shake animation triggered on error
  useEffect(() => {
    if (hasError) {
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: 10, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -10, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 8, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -8, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
      ]).start();
    }
  }, [hasError]);

  const handleChange = (text: string, index: number) => {
    const digit = text.slice(-1); // only take last character
    const newDigits = [...digits];
    newDigits[index] = digit;
    setDigits(newDigits);
    onChange(newDigits.join(''));

    // Auto-advance
    if (digit && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (
    e: NativeSyntheticEvent<TextInputKeyPressEventData>,
    index: number,
  ) => {
    if (e.nativeEvent.key === 'Backspace') {
      const newDigits = [...digits];
      if (newDigits[index]) {
        newDigits[index] = '';
        setDigits(newDigits);
        onChange(newDigits.join(''));
      } else if (index > 0) {
        newDigits[index - 1] = '';
        setDigits(newDigits);
        onChange(newDigits.join(''));
        inputRefs.current[index - 1]?.focus();
      }
    }
  };

  return (
    <Animated.View style={[styles.row, { transform: [{ translateX: shakeAnim }] }]}>
      {Array(OTP_LENGTH)
        .fill(null)
        .map((_, i) => {
          const isFilled = !!digits[i];
          return (
              <TouchableOpacity
              key={i}
              activeOpacity={1}
              onPress={() => inputRefs.current[i]?.focus()}
              style={[
                styles.cell,
                { backgroundColor: colors.background, borderColor: colors.border },
                isFilled && [styles.cellFilled, { borderColor: colors.tint, backgroundColor: colors.card }],
                hasError && [styles.cellError, { borderColor: colors.error }],
              ]}
            >
              <TextInput
                ref={ref => (inputRefs.current[i] = ref)}
                value={digits[i]}
                onChangeText={text => handleChange(text, i)}
                onKeyPress={e => handleKeyPress(e, i)}
                keyboardType="number-pad"
                maxLength={1}
                style={[styles.cellText, { color: colors.text }]}
                selectionColor={colors.tint}
                caretHidden
              />
              {!digits[i] && <Text style={[styles.placeholder, { color: colors.textMuted }]}>·</Text>}
            </TouchableOpacity>
          );
        })}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 6,
    justifyContent: 'center',
  },
  cell: {
    width: 36,
    height: 50,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellFilled: {
  },
  cellError: {
  },
  cellText: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    textAlign: 'center',
    fontSize: 24,
    fontWeight: '700',
  },
  placeholder: {
    fontSize: 28,
    fontWeight: '700',
  },
});
