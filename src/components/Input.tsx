import React, { memo } from 'react';
import { TextInput, View, Text, StyleSheet, ViewStyle, TextStyle, TextInputProps } from 'react-native';

interface InputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  error?: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  style?: ViewStyle;
}

function Input({
  label,
  error,
  variant = 'primary',
  size = 'md',
  disabled = false,
  style,
  ...textInputProps
}: InputProps) {
  const containerStyle: ViewStyle[] = [styles.container, style];
  
  const inputWrapperStyle: ViewStyle[] = [
    styles.inputWrapper,
    styles[`${variant}Wrapper`],
    styles[`${size}Wrapper`],
    disabled && styles.disabledWrapper,
    error && styles.errorWrapper,
  ];

  const inputStyle: TextStyle[] = [
    styles.input,
    styles[`${size}Input`],
    disabled && styles.disabledInput,
  ];

  const getPlaceholderColor = (): string => {
    if (disabled) return '#D1D5DB';
    if (error) return '#FCA5A5';
    return '#9CA3AF';
  };

  return (
    <View style={containerStyle}>
      {label && (
        <Text style={[styles.label, error && styles.errorLabel]}>
          {label}
        </Text>
      )}
      <View style={inputWrapperStyle}>
        <TextInput
          {...textInputProps}
          style={inputStyle}
          editable={!disabled}
          placeholderTextColor={getPlaceholderColor()}
          accessibilityLabel={label || textInputProps.placeholder}
          accessibilityState={{ disabled }}
        />
      </View>
      {error && (
        <Text style={styles.errorText}>{error}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
  },
  errorLabel: {
    color: '#EF4444',
  },
  inputWrapper: {
    borderRadius: 8,
    borderWidth: 1,
    minHeight: 44,
    justifyContent: 'center',
  },
  primaryWrapper: {
    backgroundColor: '#FFFFFF',
    borderColor: '#F59E0B',
  },
  secondaryWrapper: {
    backgroundColor: '#F3F4F6',
    borderColor: '#6B7280',
  },
  outlineWrapper: {
    backgroundColor: 'transparent',
    borderColor: '#D1D5DB',
  },
  ghostWrapper: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
  },
  dangerWrapper: {
    backgroundColor: '#FFFFFF',
    borderColor: '#EF4444',
  },
  errorWrapper: {
    borderColor: '#EF4444',
  },
  disabledWrapper: {
    backgroundColor: '#F9FAFB',
    borderColor: '#E5E7EB',
    opacity: 0.6,
  },
  smWrapper: {
    minHeight: 36,
    paddingHorizontal: 10,
  },
  mdWrapper: {
    minHeight: 44,
    paddingHorizontal: 12,
  },
  lgWrapper: {
    minHeight: 52,
    paddingHorizontal: 16,
  },
  input: {
    fontSize: 16,
    color: '#111827',
    padding: 0,
  },
  smInput: {
    fontSize: 14,
  },
  mdInput: {
    fontSize: 16,
  },
  lgInput: {
    fontSize: 18,
  },
  disabledInput: {
    color: '#9CA3AF',
  },
  errorText: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 4,
  },
});

export { Input };
export default memo(Input);
