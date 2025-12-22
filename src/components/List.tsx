import React, { memo } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ViewStyle, TextStyle, ListRenderItem } from 'react-native';

interface ListItem {
  id: string;
  title: string;
  subtitle?: string;
  value?: string;
  onPress?: () => void;
}

interface ListProps {
  items: ListItem[];
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  style?: ViewStyle;
  showSeparator?: boolean;
  emptyText?: string;
}

function List({
  items,
  variant = 'primary',
  size = 'md',
  disabled = false,
  style,
  showSeparator = true,
  emptyText = 'No items',
}: ListProps) {
  const getItemStyles = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      ...styles.itemBase,
    };

    const sizeStyles: Record<string, ViewStyle> = {
      sm: { paddingVertical: 8, paddingHorizontal: 12, minHeight: 44 },
      md: { paddingVertical: 12, paddingHorizontal: 16, minHeight: 56 },
      lg: { paddingVertical: 16, paddingHorizontal: 20, minHeight: 68 },
    };

    const variantStyles: Record<string, ViewStyle> = {
      primary: { backgroundColor: '#FFFFFF' },
      secondary: { backgroundColor: '#F3F4F6' },
      outline: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E5E7EB' },
      ghost: { backgroundColor: 'transparent' },
      danger: { backgroundColor: '#FEF2F2' },
    };

    return {
      ...baseStyle,
      ...sizeStyles[size],
      ...variantStyles[variant],
      opacity: disabled ? 0.5 : 1,
    };
  };

  const getTextStyles = (): TextStyle => {
    const sizeStyles: Record<string, TextStyle> = {
      sm: { fontSize: 14 },
      md: { fontSize: 16 },
      lg: { fontSize: 18 },
    };

    const variantStyles: Record<string, TextStyle> = {
      primary: { color: '#111827' },
      secondary: { color: '#374151' },
      outline: { color: '#111827' },
      ghost: { color: '#6B7280' },
      danger: { color: '#DC2626' },
    };

    return {
      ...styles.titleBase,
      ...sizeStyles[size],
      ...variantStyles[variant],
    };
  };

  const getSubtitleStyles = (): TextStyle => {
    const sizeStyles: Record<string, TextStyle> = {
      sm: { fontSize: 12 },
      md: { fontSize: 14 },
      lg: { fontSize: 16 },
    };

    return {
      ...styles.subtitleBase,
      ...sizeStyles[size],
    };
  };

  const getValueStyles = (): TextStyle => {
    const sizeStyles: Record<string, TextStyle> = {
      sm: { fontSize: 13 },
      md: { fontSize: 15 },
      lg: { fontSize: 17 },
    };

    const variantStyles: Record<string, TextStyle> = {
      primary: { color: '#F59E0B' },
      secondary: { color: '#6B7280' },
      outline: { color: '#F59E0B' },
      ghost: { color: '#9CA3AF' },
      danger: { color: '#DC2626' },
    };

    return {
      ...styles.valueBase,
      ...sizeStyles[size],
      ...variantStyles[variant],
    };
  };

  const renderItem: ListRenderItem<ListItem> = ({ item, index }) => {
    const isLastItem = index === items.length - 1;
    const showDivider = showSeparator && !isLastItem;

    return (
      <TouchableOpacity
        style={[
          getItemStyles(),
          showDivider && styles.separator,
        ]}
        onPress={item.onPress}
        disabled={disabled || !item.onPress}
        accessibilityRole="button"
        accessibilityLabel={item.title}
        accessibilityHint={item.subtitle}
        activeOpacity={0.7}
      >
        <View style={styles.itemContent}>
          <View style={styles.textContainer}>
            <Text style={getTextStyles()} numberOfLines={1}>
              {item.title}
            </Text>
            {item.subtitle && (
              <Text style={getSubtitleStyles()} numberOfLines={1}>
                {item.subtitle}
              </Text>
            )}
          </View>
          {item.value && (
            <Text style={getValueStyles()} numberOfLines={1}>
              {item.value}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>{emptyText}</Text>
    </View>
  );

  return (
    <View style={[styles.container, style]}>
      <FlatList
        data={items}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={renderEmpty}
        scrollEnabled={false}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  itemBase: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  itemContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  textContainer: {
    flex: 1,
    marginRight: 12,
  },
  titleBase: {
    fontWeight: '600',
  },
  subtitleBase: {
    color: '#6B7280',
    marginTop: 2,
  },
  valueBase: {
    fontWeight: '500',
  },
  separator: {
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  emptyContainer: {
    paddingVertical: 32,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#9CA3AF',
  },
});

export { List };
export default memo(List);
