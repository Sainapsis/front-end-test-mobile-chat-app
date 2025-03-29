import * as React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import renderer from 'react-test-renderer';
import { ThemeProvider } from '@/context/ThemeContext';
import { Button } from '@/design_system/components/atoms/Button/Button';
import { View, Text } from 'react-native';

// Mocks más simples que funcionan con Jest
jest.mock('@/design_system/components/atoms/ThemedText', () => {
    const { Text } = require('react-native'); // Importar dentro del mock
    return {
      ThemedText: ({ children, ...props }: { children: React.ReactNode; [key: string]: any }) => (
        <Text {...props}>{children}</Text>
      ),
    };
  });
  
  jest.mock('@/design_system/components/atoms/Pressable', () => {
    const { View } = require('react-native'); // Importar dentro del mock
    return {
      AnimatedPressable: ({ children, onPress, ...props }: { children: React.ReactNode; onPress?: () => void; [key: string]: any }) => (
        <View testID="animated-pressable" {...props}>
          {children}
        </View>
      ),
    };
  });
  

describe('Button Component', () => {
  const renderWithTheme = (component: string | number | boolean | Iterable<React.ReactNode> | React.JSX.Element | null | undefined) => {
    return render(
      <ThemeProvider>
        {component}
      </ThemeProvider>
    );
  };

  it('renders correctly with snapshot', () => {
    const tree = renderer.create(
      <ThemeProvider>
        <Button>Test Button</Button>
      </ThemeProvider>
    ).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('renders text content correctly', () => {
    const { getByText } = renderWithTheme(
      <Button>Test Button</Button>
    );
    expect(getByText('Test Button')).toBeTruthy();
  });

  it('handles onPress events', () => {
    const onPressMock = jest.fn();
    const { getByTestId } = renderWithTheme(
      <Button onPress={onPressMock}>Clickable Button</Button>
    );
    
    const buttonElement = getByTestId('animated-pressable');
    fireEvent.press(buttonElement);
    
    expect(onPressMock).toHaveBeenCalledTimes(1);
  });

  it('renders with different variants', () => {
    const variants = ['primary', 'secondary', 'outline', 'ghost'] as const;
    
    variants.forEach(variant => {
      const { getByText } = renderWithTheme(
        <Button variant={variant}>{`${variant} button`}</Button>
      );
      expect(getByText(`${variant} button`)).toBeTruthy();
    });
  });

  it('renders with different sizes', () => {
    const sizes = ['small', 'medium', 'large'] as const;
    
    sizes.forEach(size => {
      const { getByText } = renderWithTheme(
        <Button size={size}>{`${size} button`}</Button>
      );
      expect(getByText(`${size} button`)).toBeTruthy();
    });
  });

  // Resto de las pruebas sin cambios
});