import React from 'react';
import { ViewProps } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface GradientViewProps extends ViewProps {
  colors: string[];
  className?: string;
  style?: any;
  children?: React.ReactNode;
}

// This file is used on iOS/Android. Web uses gradient-view.web.tsx
export function GradientView({ colors, className, style, children, ...props }: GradientViewProps) {
  return (
    <LinearGradient
      colors={colors as any}
      style={style}
      {...props}
    >
      {children}
    </LinearGradient>
  );
}
