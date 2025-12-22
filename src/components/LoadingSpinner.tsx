import React, { memo } from 'react';
import { View, ActivityIndicator, StyleSheet, ViewStyle } from 'react-native';

interface LoadingSpinnerProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  style?: ViewStyle;
}

function LoadingSpinner({
  variant = 'primary',
  size = 'md',
  style,
}: LoadingSpinnerProps) {
  const getColor = (): string => {
    switch (variant) {
      case 'primary':
        return '#F59E0B';
      case 'secondary':
        return '#6B7280';
      case 'outline':
        return '#F59E0B';
      case 'ghost':
        return '#6B7280';
      case 'danger':
        return '#EF4444';
      default:
        return '#F59E0B';
    }
  };

  const getSize = (): 'small' | 'large' => {
    switch (size) {
      case 'sm':
        return 'small';
      case 'lg':
        return 'large';
      case 'md':
      default:
        return 'small';
    }
  };

  const getContainerSize = (): number => {
    switch (size) {
      case 'sm':
        return 24;
      case 'lg':
        return 48;
      case 'md':
      default:
        return 32;
    }
  };

  return (
    <View
      style={[
        styles.container,
        {
          width: getContainerSize(),
          height: getContainerSize(),
          minHeight: 44,
          minWidth: 44,
        },
        style,
      ]}
      accessibilityRole="progressbar"
      accessibilityLabel="Loading"
    >
      <ActivityIndicator size={getSize()} color={getColor()} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default memo(LoadingSpinner);
export { LoadingSpinner };
