import * as React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import renderer from 'react-test-renderer';
import { ThemeProvider } from '@/context/ThemeContext';
import { OptionButton } from '@/design_system/components/molecules/OptionButton/OptionButton';

// Mock para Ionicons
jest.mock('react-native-vector-icons/Ionicons', () => {
    const React = require('react');
    const { View } = require('react-native');
  
    return {
      __esModule: true,
      default: ({ name, size, color }: { name: string; size: number; color: string }) => (
        <View testID={`icon-${name}`} style={{ width: size, height: size, backgroundColor: color }} />
      ),
    };
  });
  
  

// Mock para useColorScheme
jest.mock('@/hooks/useColorScheme', () => ({
  useColorScheme: jest.fn(() => 'light')
}));

describe('OptionButton Component', () => {
  const defaultProps = {
    icon: 'heart',
    text: 'Like',
    onPress: jest.fn()
  };

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
        <OptionButton {...defaultProps} />
      </ThemeProvider>
    ).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('renders with correct text', () => {
    const { getByText } = renderWithTheme(
      <OptionButton {...defaultProps} />
    );
    expect(getByText('Like')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const onPressMock = jest.fn();
    const { getByText } = renderWithTheme(
      <OptionButton {...defaultProps} onPress={onPressMock} />
    );
    
    fireEvent.press(getByText('Like'));
    expect(onPressMock).toHaveBeenCalledTimes(1);
  });

  it('renders with custom color', () => {
    const customColor = '#FF0000';
    const { getByText } = renderWithTheme(
      <OptionButton {...defaultProps} color={customColor} />
    );
    
    expect(getByText('Like')).toBeTruthy();
  });

  it('renders with different icons', () => {
    const icons = ['heart', 'share', 'chatbubble', 'bookmark'];
    
    icons.forEach(icon => {
      const { getByText } = renderWithTheme(
        <OptionButton {...defaultProps} icon={icon} text={`${icon} action`} />
      );
      expect(getByText(`${icon} action`)).toBeTruthy();
    });
  });
});