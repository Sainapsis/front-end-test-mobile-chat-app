import * as React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import renderer from 'react-test-renderer';
import { ThemeProvider } from '@/context/ThemeContext';
import { SearchResultItem } from '@/design_system/components/molecules/SearchResultItem/SearchResultItem';
// Mock para MessageBubble

jest.mock('@/design_system/components/organisms/MessageBubble', () => {
    const { View, Text } = require('react-native');
  
    return {
      MessageBubble: ({ message }: { message: { content: string } }) => (
        <View testID="message-bubble">
          <Text>{message.content}</Text>
        </View>
      )
    };
  });
  


// Mock para IconSymbol
jest.mock('@/design_system/ui/vendors/IconSymbol', () => {
    const { View } = require('react-native');
  
    return {
      IconSymbol: ({ name }: { name: string }) => (
        <View testID={`icon-${name}`} />
      ),
    };
  });
  

// Mock para useColorScheme
jest.mock('@/hooks/useColorScheme', () => ({
  useColorScheme: jest.fn(() => 'light')
}));

describe('SearchResultItem Component', () => {
  const mockItem = {
    id: '123',
    participant_names: 'John Doe,Jane Smith',
    sender_id: 'user2',
    timestamp: '2023-05-15T14:30:00Z',
    content: 'Hello, this is a test message'
  };

  const defaultProps = {
    item: mockItem,
    currentUserName: 'Jane Smith',
    currentUserId: 'user1',
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
        <SearchResultItem {...defaultProps} />
      </ThemeProvider>
    ).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('displays the correct chat name', () => {
    const { getByText } = renderWithTheme(
      <SearchResultItem {...defaultProps} />
    );
    
    // Debería mostrar el nombre del otro participante
    expect(getByText(/Chat with John Doe/)).toBeTruthy();
  });


  it('renders MessageBubble with correct props', () => {
    const { getByTestId } = renderWithTheme(
      <SearchResultItem {...defaultProps} />
    );
    
    expect(getByTestId('message-bubble')).toBeTruthy();
  });

  it('renders with correct icon', () => {
    const { getByTestId } = renderWithTheme(
      <SearchResultItem {...defaultProps} />
    );
    
    expect(getByTestId('icon-chevron.right')).toBeTruthy();
  });

  it('displays the correct timestamp', () => {
    // Crear un mock de Date.prototype.toLocaleTimeString
    const originalToLocaleTimeString = Date.prototype.toLocaleTimeString;
    Date.prototype.toLocaleTimeString = jest.fn(() => '2:30 PM');
    
    const { getByText } = renderWithTheme(
      <SearchResultItem {...defaultProps} />
    );
    
    expect(getByText('2:30 PM')).toBeTruthy();
    
    // Restaurar el método original
    Date.prototype.toLocaleTimeString = originalToLocaleTimeString;
  });
});

function queryByTestId(arg0: string) {
    throw new Error('Function not implemented.');
}
