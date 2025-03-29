import React from 'react';
import { StatusBar, View, ViewStyle, StyleProp } from 'react-native';
import { styles } from './BaseTemplate.styles';
import { ThemedView } from '@/design_system/components/atoms';

interface BaseTemplateProps {
  children: React.ReactNode;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  style?: StyleProp<ViewStyle>;  // Definimos el tipo de style
  testID?: string;  // Definimos testID como un string opcional
}

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
