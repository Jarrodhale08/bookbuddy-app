import React, { memo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  style?: ViewStyle;
  showIcon?: boolean;
}

function ErrorState({
  title = 'Something went wrong',
  message = 'An error occurred. Please try again.',
  onRetry,
  variant = 'primary',
  size = 'md',
  disabled = false,
  style,
  showIcon = true,
}: ErrorStateProps) {
  const containerStyle = [
    styles.container,
    sizeStyles[size].container,
    style,
  ];

  const iconSize = size === 'sm' ? 40 : size === 'lg' ? 64 : 48;
  const buttonStyle = [
    styles.button,
    variantStyles[variant].button,
    sizeStyles[size].button,
    disabled && styles.buttonDisabled,
  ];
  const buttonTextStyle = [
    styles.buttonText,
    variantStyles[variant].text,
    sizeStyles[size].text,
    disabled && styles.buttonTextDisabled,
  ];

  return (
    <View style={containerStyle} accessibilityRole="alert">
      {showIcon && (
        <Ionicons
          name="alert-circle-outline"
          size={iconSize}
          color="#EF4444"
          style={styles.icon}
        />
      )}
      <Text style={[styles.title, sizeStyles[size].title]} accessibilityRole="header">
        {title}
      </Text>
      <Text style={[styles.message, sizeStyles[size].message]}>
        {message}
      </Text>
      {onRetry && (
        <TouchableOpacity
          style={buttonStyle}
          onPress={onRetry}
          disabled={disabled}
          accessibilityRole="button"
          accessibilityLabel="Retry"
          accessibilityState={{ disabled }}
        >
          <Ionicons
            name="refresh"
            size={size === 'sm' ? 16 : size === 'lg' ? 24 : 20}
            color={variantStyles[variant].text.color}
            style={styles.buttonIcon}
          />
          <Text style={buttonTextStyle}>Try Again</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  icon: {
    marginBottom: 16,
  },
  title: {
    fontWeight: '700',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 8,
  },
  message: {
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    minHeight: 44,
    paddingHorizontal: 24,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    fontWeight: '600',
  },
  buttonTextDisabled: {
    opacity: 0.5,
  },
});

const sizeStyles = StyleSheet.create({
  sm: {
    container: {
      padding: 16,
    } as ViewStyle,
    title: {
      fontSize: 16,
    } as TextStyle,
    message: {
      fontSize: 13,
      marginBottom: 16,
    } as TextStyle,
    button: {
      minHeight: 36,
      paddingHorizontal: 16,
    } as ViewStyle,
    text: {
      fontSize: 13,
    } as TextStyle,
  },
  md: {
    container: {
      padding: 24,
    } as ViewStyle,
    title: {
      fontSize: 18,
    } as TextStyle,
    message: {
      fontSize: 14,
      marginBottom: 24,
    } as TextStyle,
    button: {
      minHeight: 44,
      paddingHorizontal: 24,
    } as ViewStyle,
    text: {
      fontSize: 15,
    } as TextStyle,
  },
  lg: {
    container: {
      padding: 32,
    } as ViewStyle,
    title: {
      fontSize: 22,
    } as TextStyle,
    message: {
      fontSize: 16,
      marginBottom: 32,
    } as TextStyle,
    button: {
      minHeight: 52,
      paddingHorizontal: 32,
    } as ViewStyle,
    text: {
      fontSize: 17,
    } as TextStyle,
  },
});

const variantStyles = StyleSheet.create({
  primary: {
    button: {
      backgroundColor: '#F59E0B',
    } as ViewStyle,
    text: {
      color: '#FFFFFF',
    } as TextStyle,
  },
  secondary: {
    button: {
      backgroundColor: '#6B7280',
    } as ViewStyle,
    text: {
      color: '#FFFFFF',
    } as TextStyle,
  },
  outline: {
    button: {
      backgroundColor: 'transparent',
      borderWidth: 2,
      borderColor: '#F59E0B',
    } as ViewStyle,
    text: {
      color: '#F59E0B',
    } as TextStyle,
  },
  ghost: {
    button: {
      backgroundColor: 'transparent',
    } as ViewStyle,
    text: {
      color: '#F59E0B',
    } as TextStyle,
  },
  danger: {
    button: {
      backgroundColor: '#EF4444',
    } as ViewStyle,
    text: {
      color: '#FFFFFF',
    } as TextStyle,
  },
});

export { ErrorState };
export default memo(ErrorState);
