import React, { memo } from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface EmptyStateProps {
  icon?: keyof typeof Ionicons.glyphMap;
  title?: string;
  message?: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  style?: ViewStyle;
}

function EmptyState({
  icon = 'folder-open-outline',
  title = 'No Data',
  message = 'There is nothing to display yet',
  variant = 'primary',
  size = 'md',
  style,
}: EmptyStateProps) {
  const containerStyle = [
    styles.container,
    styles[`container_${size}`],
    style,
  ];

  const iconSize = size === 'sm' ? 48 : size === 'lg' ? 80 : 64;
  const iconColor = variant === 'danger' ? '#EF4444' : variant === 'secondary' ? '#6B7280' : '#F59E0B';

  const titleStyle = [
    styles.title,
    styles[`title_${size}`],
    styles[`title_${variant}`],
  ];

  const messageStyle = [
    styles.message,
    styles[`message_${size}`],
    styles[`message_${variant}`],
  ];

  return (
    <View style={containerStyle} accessibilityRole="text" accessibilityLabel={`${title}. ${message}`}>
      <Ionicons name={icon} size={iconSize} color={iconColor} />
      <Text style={titleStyle}>{title}</Text>
      <Text style={messageStyle}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
    paddingHorizontal: 24,
  },
  container_sm: {
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  container_md: {
    paddingVertical: 32,
    paddingHorizontal: 24,
  },
  container_lg: {
    paddingVertical: 48,
    paddingHorizontal: 32,
  },
  title: {
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 16,
  },
  title_sm: {
    fontSize: 14,
    marginTop: 8,
  },
  title_md: {
    fontSize: 18,
    marginTop: 16,
  },
  title_lg: {
    fontSize: 22,
    marginTop: 20,
  },
  title_primary: {
    color: '#F59E0B',
  },
  title_secondary: {
    color: '#6B7280',
  },
  title_outline: {
    color: '#1F2937',
  },
  title_ghost: {
    color: '#374151',
  },
  title_danger: {
    color: '#EF4444',
  },
  message: {
    textAlign: 'center',
    marginTop: 8,
  },
  message_sm: {
    fontSize: 12,
    marginTop: 4,
  },
  message_md: {
    fontSize: 14,
    marginTop: 8,
  },
  message_lg: {
    fontSize: 16,
    marginTop: 12,
  },
  message_primary: {
    color: '#9CA3AF',
  },
  message_secondary: {
    color: '#9CA3AF',
  },
  message_outline: {
    color: '#6B7280',
  },
  message_ghost: {
    color: '#9CA3AF',
  },
  message_danger: {
    color: '#9CA3AF',
  },
});

export { EmptyState };
export default memo(EmptyState);
