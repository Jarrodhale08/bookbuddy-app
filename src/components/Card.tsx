import React, { memo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle, TextStyle, ActivityIndicator } from 'react-native';

interface CardProps {
  title?: string;
  description?: string;
  onPress?: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  children?: React.ReactNode;
}

function Card({
  title,
  description,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  style,
  children,
}: CardProps) {
  const containerStyle: ViewStyle[] = [
    styles.container,
    styles[`container_${size}`],
    styles[`container_${variant}`],
    disabled && styles.container_disabled,
    style,
  ];

  const titleStyle: TextStyle[] = [
    styles.title,
    styles[`title_${size}`],
    styles[`title_${variant}`],
    disabled && styles.title_disabled,
  ];

  const descriptionStyle: TextStyle[] = [
    styles.description,
    styles[`description_${size}`],
    styles[`description_${variant}`],
    disabled && styles.description_disabled,
  ];

  const content = (
    <>
      {loading && (
        <ActivityIndicator
          size={size === 'sm' ? 'small' : 'large'}
          color={variant === 'primary' ? '#FFFFFF' : '#F59E0B'}
          style={styles.loader}
        />
      )}
      {!loading && (
        <>
          {title && <Text style={titleStyle}>{title}</Text>}
          {description && <Text style={descriptionStyle}>{description}</Text>}
          {children}
        </>
      )}
    </>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        style={containerStyle}
        onPress={onPress}
        disabled={disabled || loading}
        accessibilityRole="button"
        accessibilityLabel={title || 'Card'}
        accessibilityState={{ disabled: disabled || loading }}
      >
        {content}
      </TouchableOpacity>
    );
  }

  return (
    <View
      style={containerStyle}
      accessibilityRole="text"
      accessibilityLabel={title || 'Card'}
    >
      {content}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    alignItems: 'flex-start',
    justifyContent: 'center',
    minHeight: 44,
  },
  container_sm: {
    padding: 8,
  },
  container_md: {
    padding: 16,
  },
  container_lg: {
    padding: 24,
  },
  container_primary: {
    backgroundColor: '#F59E0B',
    borderWidth: 0,
  },
  container_secondary: {
    backgroundColor: '#6B7280',
    borderWidth: 0,
  },
  container_outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#F59E0B',
  },
  container_ghost: {
    backgroundColor: 'transparent',
    borderWidth: 0,
  },
  container_danger: {
    backgroundColor: '#EF4444',
    borderWidth: 0,
  },
  container_disabled: {
    opacity: 0.5,
  },
  title: {
    fontWeight: '600',
  },
  title_sm: {
    fontSize: 14,
  },
  title_md: {
    fontSize: 16,
  },
  title_lg: {
    fontSize: 18,
  },
  title_primary: {
    color: '#FFFFFF',
  },
  title_secondary: {
    color: '#FFFFFF',
  },
  title_outline: {
    color: '#F59E0B',
  },
  title_ghost: {
    color: '#1F2937',
  },
  title_danger: {
    color: '#FFFFFF',
  },
  title_disabled: {
    opacity: 1,
  },
  description: {
    marginTop: 4,
  },
  description_sm: {
    fontSize: 12,
  },
  description_md: {
    fontSize: 14,
  },
  description_lg: {
    fontSize: 16,
  },
  description_primary: {
    color: '#FFF7ED',
  },
  description_secondary: {
    color: '#F3F4F6',
  },
  description_outline: {
    color: '#6B7280',
  },
  description_ghost: {
    color: '#6B7280',
  },
  description_danger: {
    color: '#FEE2E2',
  },
  description_disabled: {
    opacity: 1,
  },
  loader: {
    marginVertical: 8,
  },
});

export { Card };
export default memo(Card);
