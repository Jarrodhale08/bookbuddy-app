import React, { memo } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ViewStyle, TextStyle, TextInputProps } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface FormInputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  error?: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  leftIcon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightIconPress?: () => void;
  disabled?: boolean;
  required?: boolean;
  style?: ViewStyle;
  inputStyle?: TextStyle;
}

function FormInput({
  label,
  error,
  variant = 'primary',
  size = 'md',
  leftIcon,
  rightIcon,
  onRightIconPress,
  disabled = false,
  required = false,
  style,
  inputStyle,
  ...textInputProps
}: FormInputProps) {
  const containerStyle = [
    styles.container,
    style,
  ];

  const inputContainerStyle = [
    styles.inputContainer,
    styles[`${variant}Container`],
    styles[`${size}Container`],
    error && styles.errorContainer,
    disabled && styles.disabledContainer,
  ];

  const textStyle = [
    styles.input,
    styles[`${size}Text`],
    styles[`${variant}Text`],
    error && styles.errorText,
    disabled && styles.disabledText,
    inputStyle,
  ];

  const labelStyle = [
    styles.label,
    styles[`${size}Label`],
    error && styles.errorLabel,
  ];

  const iconSize = size === 'sm' ? 16 : size === 'lg' ? 24 : 20;
  const iconColor = error ? '#EF4444' : variant === 'danger' ? '#EF4444' : variant === 'primary' ? '#F59E0B' : '#6B7280';

  return (
    <View style={containerStyle}>
      {label && (
        <Text style={labelStyle} accessibilityLabel={`${label} ${required ? 'required' : ''}`}>
          {label}
          {required && <Text style={styles.required}> *</Text>}
        </Text>
      )}
      <View style={inputContainerStyle}>
        {leftIcon && (
          <Ionicons 
            name={leftIcon} 
            size={iconSize} 
            color={iconColor} 
            style={styles.leftIcon}
          />
        )}
        <TextInput
          {...textInputProps}
          style={textStyle}
          editable={!disabled}
          placeholderTextColor={error ? '#EF4444' : '#9CA3AF'}
          accessibilityLabel={label || textInputProps.placeholder}
          accessibilityHint={error || undefined}
          accessibilityState={{ disabled }}
        />
        {rightIcon && (
          <TouchableOpacity
            onPress={onRightIconPress}
            disabled={disabled || !onRightIconPress}
            style={styles.rightIconButton}
            accessibilityRole="button"
            accessibilityLabel={`${label || 'input'} action`}
          >
            <Ionicons 
              name={rightIcon} 
              size={iconSize} 
              color={iconColor}
            />
          </TouchableOpacity>
        )}
      </View>
      {error && (
        <Text style={styles.errorMessage} accessibilityLiveRegion="polite">
          {error}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  smLabel: {
    fontSize: 12,
    marginBottom: 6,
  },
  mdLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  lgLabel: {
    fontSize: 16,
    marginBottom: 10,
  },
  required: {
    color: '#EF4444',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    minHeight: 44,
  },
  primaryContainer: {
    borderColor: '#F59E0B',
  },
  secondaryContainer: {
    borderColor: '#6B7280',
    backgroundColor: '#F9FAFB',
  },
  outlineContainer: {
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
  },
  ghostContainer: {
    borderColor: 'transparent',
    backgroundColor: 'transparent',
  },
  dangerContainer: {
    borderColor: '#EF4444',
  },
  smContainer: {
    minHeight: 36,
    paddingHorizontal: 8,
  },
  mdContainer: {
    minHeight: 44,
    paddingHorizontal: 12,
  },
  lgContainer: {
    minHeight: 52,
    paddingHorizontal: 16,
  },
  errorContainer: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  disabledContainer: {
    backgroundColor: '#F3F4F6',
    borderColor: '#E5E7EB',
    opacity: 0.6,
  },
  input: {
    flex: 1,
    color: '#111827',
    fontWeight: '400',
  },
  primaryText: {
    color: '#111827',
  },
  secondaryText: {
    color: '#374151',
  },
  outlineText: {
    color: '#111827',
  },
  ghostText: {
    color: '#111827',
  },
  dangerText: {
    color: '#111827',
  },
  smText: {
    fontSize: 12,
  },
  mdText: {
    fontSize: 14,
  },
  lgText: {
    fontSize: 16,
  },
  errorText: {
    color: '#991B1B',
  },
  disabledText: {
    color: '#9CA3AF',
  },
  leftIcon: {
    marginRight: 8,
  },
  rightIconButton: {
    marginLeft: 8,
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorLabel: {
    color: '#EF4444',
  },
  errorMessage: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 4,
    fontWeight: '400',
  },
});

export { FormInput };
export default memo(FormInput);
