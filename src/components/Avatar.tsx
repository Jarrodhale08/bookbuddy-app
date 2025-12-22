import React, { memo } from 'react';
import { View, Text, Image, StyleSheet, ViewStyle, TextStyle, ImageStyle } from 'react-native';

interface AvatarProps {
  uri?: string;
  name?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  style?: ViewStyle;
}

function Avatar({
  uri,
  name,
  size = 'md',
  variant = 'primary',
  style,
}: AvatarProps) {
  const sizeStyles = {
    sm: { width: 32, height: 32, fontSize: 14 },
    md: { width: 48, height: 48, fontSize: 18 },
    lg: { width: 64, height: 64, fontSize: 24 },
  };

  const variantStyles = {
    primary: { backgroundColor: '#F59E0B', color: '#FFFFFF' },
    secondary: { backgroundColor: '#6B7280', color: '#FFFFFF' },
    outline: { backgroundColor: 'transparent', borderWidth: 2, borderColor: '#F59E0B', color: '#F59E0B' },
    ghost: { backgroundColor: 'rgba(245, 158, 11, 0.1)', color: '#F59E0B' },
    danger: { backgroundColor: '#EF4444', color: '#FFFFFF' },
  };

  const dimensions = sizeStyles[size];
  const colors = variantStyles[variant];

  const getInitials = (name?: string): string => {
    if (!name) return '?';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const containerStyle: ViewStyle = {
    width: dimensions.width,
    height: dimensions.height,
    borderRadius: dimensions.width / 2,
    backgroundColor: colors.backgroundColor,
    borderWidth: colors.borderWidth || 0,
    borderColor: colors.borderColor,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  };

  const textStyle: TextStyle = {
    color: colors.color,
    fontSize: dimensions.fontSize,
    fontWeight: '600',
  };

  return (
    <View style={[containerStyle, style]} accessibilityRole="image" accessibilityLabel={name || 'Avatar'}>
      {uri ? (
        <Image source={{ uri }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
      ) : (
        <Text style={textStyle}>{getInitials(name)}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({});

export { Avatar };
export default memo(Avatar);
