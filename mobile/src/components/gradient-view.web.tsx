import React from 'react';
import { View, ViewProps } from 'react-native';

interface GradientViewProps extends ViewProps {
  colors: string[];
  className?: string;
  style?: any;
  children?: React.ReactNode;
}

export function GradientView({ colors, className, style, children, ...props }: GradientViewProps) {
  return (
    <View
      {...props}
      className={className}
      style={[
        style,
        {
          backgroundImage: `linear-gradient(to bottom, ${colors.join(', ')})`,
        },
      ]}
    >
      {children}
    </View>
  );
}
