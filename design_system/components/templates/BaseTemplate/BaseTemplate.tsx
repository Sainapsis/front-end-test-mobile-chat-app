import React from 'react';
import { StatusBar, View, ViewStyle, StyleProp } from 'react-native';
import { styles } from './BaseTemplate.styles';
import { ThemedView } from '@/design_system/components/atoms';

interface BaseTemplateProps {
  /** Main content of the template */
  children: React.ReactNode;
  /** Optional header component */
  header?: React.ReactNode;
  /** Optional footer component */
  footer?: React.ReactNode;
  /** Custom styles to be applied to the template */
  style?: StyleProp<ViewStyle>;
  /** Test ID for testing purposes */
  testID?: string;
}

/**
 * BaseTemplate component provides a basic layout structure for screens.
 * It includes optional header and footer sections, and supports custom styling.
 */
export const BaseTemplate: React.FC<BaseTemplateProps> = ({
  children,
  header,
  footer,
  style,
}) => (
  <ThemedView testID="base-template" style={[styles.container, style]}>
    <StatusBar barStyle="dark-content" />
    {header && <View style={styles.header}>{header}</View>}
    <View style={styles.content}>{children}</View>
    {footer && <View style={styles.footer}>{footer}</View>}
  </ThemedView>
);
