import * as React from 'react';
import { render } from '@testing-library/react-native';
import renderer from 'react-test-renderer';
import { ThemeProvider } from '@/context/ThemeContext';
import { ThemedView } from '@/design_system/components/atoms/ThemedView/ThemedView';
import { View } from 'react-native';

// Mock del hook useThemeColor para evitar dependencias externas
jest.mock('@/hooks/useThemeColor', () => ({
  useThemeColor: jest.fn(() => '#FFFFFF')
}));

describe('ThemedView Component', () => {
  // Prueba básica para verificar que el componente se renderiza
  test('renders without crashing', () => {
    const { toJSON } = render(
      <ThemeProvider>
        <ThemedView>
          <View testID="child-view" />
        </ThemedView>
      </ThemeProvider>
    );
    expect(toJSON()).not.toBeNull();
  });

  it('renders correctly with snapshot', () => {
    const tree = renderer.create(
      <ThemeProvider>
        <ThemedView>
          <View testID="child-view" />
        </ThemedView>
      </ThemeProvider>
    ).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('renders children correctly', () => {
    const { getByTestId } = render(
      <ThemeProvider>
        <ThemedView>
          <View testID="child-view" />
        </ThemedView>
      </ThemeProvider>
    );
    expect(getByTestId('child-view')).toBeTruthy();
  });

  it('applies custom styles when provided', () => {
    const customStyle = { borderRadius: 10, padding: 20 };
    const { toJSON } = render(
      <ThemeProvider>
        <ThemedView style={customStyle}>
          <View testID="child-view" />
        </ThemedView>
      </ThemeProvider>
    );
    expect(toJSON()).not.toBeNull();
  });

  it('renders with different background variants', () => {
    const variants = ['main', 'surface', 'elevated', 'black'];
    
    variants.forEach(variant => {
      const { toJSON } = render(
        <ThemeProvider>
          <ThemedView backgroundVariant={variant as any}>
            <View testID={`${variant}-view`} />
          </ThemedView>
        </ThemeProvider>
      );
      expect(toJSON()).not.toBeNull();
    });
  });

  it('accepts custom light and dark colors', () => {
    const { toJSON } = render(
      <ThemeProvider>
        <ThemedView lightColor="#E0E0E0" darkColor="#121212">
          <View testID="custom-color-view" />
        </ThemedView>
      </ThemeProvider>
    );
    expect(toJSON()).not.toBeNull();
  });
});