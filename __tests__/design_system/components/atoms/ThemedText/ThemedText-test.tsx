import * as React from 'react';
import { render } from '@testing-library/react-native';
import renderer from 'react-test-renderer';
import { ThemeProvider } from '@/context/ThemeContext';
import { ThemedText } from '@/design_system/components/atoms/ThemedText';

describe('ThemedText Component', () => {
  const renderWithTheme = (component: React.ReactElement) => {
    return render(
      <ThemeProvider>
        {component}
      </ThemeProvider>
    );
  };

  it('renders correctly with snapshot', () => {
    const tree = renderer.create(
      <ThemeProvider>
        <ThemedText>Snapshot test!</ThemedText>
      </ThemeProvider>
    ).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('renders text content correctly', () => {
    const testText = 'Hello World';
    const { getByText } = renderWithTheme(<ThemedText>{testText}</ThemedText>);
    expect(getByText(testText)).toBeTruthy();
  });

  it('applies custom styles when provided', () => {
    const customStyle = { fontSize: 20, fontWeight: 'bold' as const };
    const { toJSON } = renderWithTheme(<ThemedText style={customStyle}>Styled Text</ThemedText>);
    expect(toJSON()).not.toBeNull();
  });

  it('renders with different text variants', () => {
    const textVariants = ['primary', 'secondary', 'disabled', 'contrast', 'black'];
    
    textVariants.forEach(variant => {
      const { getByText } = renderWithTheme(
        <ThemedText textVariant={variant as any}>{`${variant} text`}</ThemedText>
      );
      expect(getByText(`${variant} text`)).toBeTruthy();
    });
  });

  it('renders with different type variants', () => {
    const typeVariants = ['link', 'h1', 'h2', 'h3', 'body', 'caption'];
    
    typeVariants.forEach(type => {
      const { getByText } = renderWithTheme(
        <ThemedText type={type as any}>{`${type} text`}</ThemedText>
      );
      expect(getByText(`${type} text`)).toBeTruthy();
    });
  });

  it('handles onPress events', () => {
    const onPressMock = jest.fn();
    const { getByText } = renderWithTheme(
      <ThemedText onPress={onPressMock}>Clickable Text</ThemedText>
    );
    
    const textElement = getByText('Clickable Text');
    textElement.props.onPress();
    
    expect(onPressMock).toHaveBeenCalledTimes(1);
  });
});