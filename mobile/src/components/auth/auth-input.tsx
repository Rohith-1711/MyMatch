import React, { useState } from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  View,
} from 'react-native';
import { useThemeColor } from '@/constants/Colors';

interface AuthInputProps extends TextInputProps {
  label: string;
  error?: string;
  isPassword?: boolean;
}

export function AuthInput({ label, error, isPassword, style, ...props }: AuthInputProps) {
  const colors = useThemeColor();
  const [focused, setFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const borderAnim = React.useRef(new Animated.Value(0)).current;

  const handleFocus = () => {
    setFocused(true);
    Animated.timing(borderAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: false,
    }).start();
    props.onFocus?.(null as any);
  };

  const handleBlur = () => {
    setFocused(false);
    Animated.timing(borderAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
    props.onBlur?.(null as any);
  };

  const borderColor = borderAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [error ? colors.error : colors.border, error ? colors.error : colors.tint],
  });

  return (
    <View style={styles.wrapper}>
      <Text style={[styles.label, { color: colors.textMuted }]}>{label}</Text>
      <Animated.View style={[styles.inputContainer, { borderColor, backgroundColor: colors.background }]}>
        <TextInput
          {...props}
          secureTextEntry={isPassword && !showPassword}
          onFocus={handleFocus}
          onBlur={handleBlur}
          style={[styles.input, style, { color: colors.text }]}
          placeholderTextColor={colors.textMuted}
          selectionColor={colors.tint}
        />
        {isPassword && (
          <TouchableOpacity
            onPress={() => setShowPassword(v => !v)}
            style={styles.eyeBtn}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={styles.eyeIcon}>{showPassword ? '🙈' : '👁️'}</Text>
          </TouchableOpacity>
        )}
      </Animated.View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 16,
    paddingHorizontal: 16,
  },
  input: {
    flex: 1,
    paddingVertical: 15,
    fontSize: 16,
    fontWeight: '400',
  },
  eyeBtn: {
    paddingLeft: 8,
  },
  eyeIcon: {
    fontSize: 18,
  },
  errorText: {
    fontSize: 12,
    color: '#ef4444',
    fontWeight: '500',
    marginTop: -2,
  },
});
