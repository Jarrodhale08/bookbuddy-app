import React, { memo } from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface HeaderProps {
  title?: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  showBackButton?: boolean;
  showRightIcon?: boolean;
  rightIconName?: keyof typeof Ionicons.glyphMap;
  onBackPress?: () => void;
  onRightPress?: () => void;
  style?: ViewStyle;
}

function Header({
  title = 'Header',
  variant = 'primary',
  size = 'md',
  showBackButton = false,
  showRightIcon = false,
  rightIconName = 'menu',
  onBackPress,
  onRightPress,
  style,
}: HeaderProps) {
  const containerStyle: ViewStyle[] = [
    styles.container,
    styles[`container_${variant}`],
    styles[`container_${size}`],
  ];

  const textStyle: TextStyle[] = [
    styles.text,
    styles[`text_${variant}`],
    styles[`text_${size}`],
  ];

  const iconColor = variant === 'outline' || variant === 'ghost' ? '#F59E0B' : '#FFFFFF';
  const iconSize = size === 'sm' ? 20 : size === 'lg' ? 28 : 24;

  return (
    <View style={[containerStyle, style]} accessible={true} accessibilityRole="header">
      {showBackButton && (
        <View style={styles.leftButton}>
          <Ionicons
            name="arrow-back"
            size={iconSize}
            color={iconColor}
            onPress={onBackPress}
            accessibilityLabel="Go back"
            accessibilityRole="button"
          />
        </View>
      )}
      <View style={styles.titleContainer}>
        <Text style={textStyle} numberOfLines={1} accessibilityLabel={title}>
          {title}
        </Text>
      </View>
      {showRightIcon && (
        <View style={styles.rightButton}>
          <Ionicons
            name={rightIconName}
            size={iconSize}
            color={iconColor}
            onPress={onRightPress}
            accessibilityLabel="Menu"
            accessibilityRole="button"
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    borderRadius: 8,
    minHeight: 44,
  },
  container_primary: {
    backgroundColor: '#F59E0B',
  },
  container_secondary: {
    backgroundColor: '#6B7280',
  },
  container_outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#F59E0B',
  },
  container_ghost: {
    backgroundColor: 'transparent',
  },
  container_danger: {
    backgroundColor: '#EF4444',
  },
  container_sm: {
    minHeight: 44,
    paddingVertical: 8,
  },
  container_md: {
    minHeight: 56,
    paddingVertical: 12,
  },
  container_lg: {
    minHeight: 64,
    paddingVertical: 16,
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: '600',
    textAlign: 'center',
  },
  text_primary: {
    color: '#FFFFFF',
  },
  text_secondary: {
    color: '#FFFFFF',
  },
  text_outline: {
    color: '#F59E0B',
  },
  text_ghost: {
    color: '#F59E0B',
  },
  text_danger: {
    color: '#FFFFFF',
  },
  text_sm: {
    fontSize: 14,
  },
  text_md: {
    fontSize: 18,
  },
  text_lg: {
    fontSize: 22,
  },
  leftButton: {
    minWidth: 44,
    minHeight: 44,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  rightButton: {
    minWidth: 44,
    minHeight: 44,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
});

export { Header };
export default memo(Header);
