import * as React from 'react';
import { render } from '@testing-library/react-native';
import renderer from 'react-test-renderer';
import { ThemeProvider } from '@/context/ThemeContext';
import { BaseTemplate } from '@/design_system/components/templates/BaseTemplate/BaseTemplate';
import { Text, View } from 'react-native';

// Mock para ThemedView
jest.mock('@/design_system/components/atoms/ThemedView', () => {
    const React = require('react');
    const { View } = require('react-native');
    return {
      ThemedView: ({ children, testID, style }: { children: React.ReactNode, testID?: string, style?: object }) => (
        <View testID={testID} style={style}>
          {children}
        </View>
      ),
    };
  });
  
  
  

describe('BaseTemplate Component', () => {
  const renderWithTheme = (component: React.ReactNode) => {
    return render(
      <ThemeProvider>
        {component}
      </ThemeProvider>
    );
  };

  it('renders correctly with snapshot', () => {
    const tree = renderer.create(
      <ThemeProvider>
        <BaseTemplate>
          <Text>Content</Text>
        </BaseTemplate>
      </ThemeProvider>
    ).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('renders children correctly', () => {
    const { getByText } = renderWithTheme(
      <BaseTemplate>
        <Text>Test Content</Text>
      </BaseTemplate>
    );
    
    expect(getByText('Test Content')).toBeTruthy();
  });

  it('renders header when provided', () => {
    const { getByText } = renderWithTheme(
      <BaseTemplate
        header={<Text>Header Content</Text>}
      >
        <Text>Main Content</Text>
      </BaseTemplate>
    );
    
    expect(getByText('Header Content')).toBeTruthy();
    expect(getByText('Main Content')).toBeTruthy();
  });

  it('renders footer when provided', () => {
    const { getByText } = renderWithTheme(
      <BaseTemplate
        footer={<Text>Footer Content</Text>}
      >
        <Text>Main Content</Text>
      </BaseTemplate>
    );
    
    expect(getByText('Footer Content')).toBeTruthy();
    expect(getByText('Main Content')).toBeTruthy();
  });

  it('renders both header and footer when provided', () => {
    const { getByText } = renderWithTheme(
      <BaseTemplate
        header={<Text>Header Content</Text>}
        footer={<Text>Footer Content</Text>}
      >
        <Text>Main Content</Text>
      </BaseTemplate>
    );
    
    expect(getByText('Header Content')).toBeTruthy();
    expect(getByText('Main Content')).toBeTruthy();
    expect(getByText('Footer Content')).toBeTruthy();
  });

  it('applies custom styles when provided', () => {
    const customStyle = { backgroundColor: 'red' };
    const { getByTestId } = renderWithTheme(
      <BaseTemplate style={customStyle}>
        <Text>Styled Content</Text>
      </BaseTemplate>
    );
  
    // Verificamos que el componente con testID="base-template" esté presente
    const container = getByTestId('base-template');
    expect(container).toBeTruthy();
  });
  
  
  
  
});
