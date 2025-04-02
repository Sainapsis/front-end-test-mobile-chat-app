import * as React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import renderer from 'react-test-renderer';
import { ThemeProvider } from '@/context/ThemeContext';
import { MessageBubble } from '@/design_system/components/organisms/MessageBubble';
import { Message } from '@/types/Chat';

jest.mock('@/design_system/components/atoms/ThemedText', () => {
    const React = require('react');
    const { Text } = require('react-native');
    return {
      ThemedText: ({ children }: { children: React.ReactNode }) => <Text>{children}</Text>,
    };
  });
  
  jest.mock('@/design_system/components/organisms/OptionsMenu', () => {
    const React = require('react');
    const { View } = require('react-native');
    return {
      OptionsMenu: ({ visible, onClose, onEdit, onDelete, onAddEmoji }: 
        { visible: boolean; onClose: () => void; onEdit: () => void; onDelete: () => void; onAddEmoji: () => void }) => 
        <View testID="options-menu" />,
    };
  });
  
  jest.mock('react-native-emoji-selector', () => {
    const React = require('react');
    const { View } = require('react-native');
    return {
      __esModule: true,
      default: ({ onEmojiSelected }: { onEmojiSelected: (emoji: string) => void }) => 
        <View testID="emoji-selector" />,
      Categories: { emotion: 'emotion' },
    };
  });
  
  jest.mock('@/hooks/components/useMessageBubble', () => ({
    useMessageBubble: jest.fn(() => ({
      isDark: false,
      bubbleColors: { background: '#E5E5EA' },
      handleLongPress: jest.fn(),
      showEmojiSelector: false,
      setShowEmojiSelector: jest.fn(),
      handleEmojiSelected: jest.fn(),
      handleRemoveReaction: jest.fn(),
      showOptionsMenu: false,
      setShowOptionsMenu: jest.fn(),
    })),
  }));
  

describe('MessageBubble Component', () => {
  const mockMessage: Message = {
    id: '123',
    text: 'Hello, this is a test message',
    timestamp: 1620000000000,
    senderId: 'user1',
    reactions: [{ id: 'r1', emoji: '👍', userId: 'user2', createdAt: Date.now() }],
  };

  const defaultProps = {
    message: mockMessage,
    isCurrentUser: true,
    userId: 'user1',
    onDeleteMessage: jest.fn(),
    onAddReaction: jest.fn(),
    onRemoveReaction: jest.fn(),
    onEditMessage: jest.fn(),
  };

  const renderWithTheme = (component: React.ReactNode) =>
    render(<ThemeProvider>{component}</ThemeProvider>);

  it('renders correctly with snapshot', () => {
    const tree = renderer.create(
      <ThemeProvider>
        <MessageBubble {...defaultProps} />
      </ThemeProvider>
    ).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('displays message text correctly', () => {
    const { getByText } = renderWithTheme(<MessageBubble {...defaultProps} />);
    getByText('Hello, this is a test message');
  });

  it('formats and displays timestamp correctly', () => {
    const mockToLocaleTimeString = jest
      .spyOn(Date.prototype, 'toLocaleTimeString')
      .mockReturnValue('10:00 AM');

    const { getByText } = renderWithTheme(<MessageBubble {...defaultProps} />);
    getByText('10:00 AM');

    mockToLocaleTimeString.mockRestore();
  });

  it('renders reactions when present', () => {
    const { getByText } = renderWithTheme(<MessageBubble {...defaultProps} />);
    getByText('👍');
  });

  it('applies different styles for current user vs other users', () => {
    const { rerender, getByTestId } = renderWithTheme(
      <MessageBubble {...defaultProps} isCurrentUser={true} />
    );
  
    const selfMessageContainer = getByTestId('message-bubble-container');
    expect(selfMessageContainer).toBeTruthy(); // Asegura que existe
  
    const selfStyle = selfMessageContainer.props.style;
  
    rerender(
      <ThemeProvider>
        <MessageBubble {...defaultProps} isCurrentUser={false} />
      </ThemeProvider>
    );
  
    const otherMessageContainer = getByTestId('message-bubble-container');
    expect(otherMessageContainer).toBeTruthy(); // Asegura que existe después del rerender
  
    const otherStyle = otherMessageContainer.props.style;
  
    expect(selfStyle).not.toEqual(otherStyle);
  });
  
  

  it('renders OptionsMenu component', () => {
    const { getByTestId } = renderWithTheme(<MessageBubble {...defaultProps} />);
    getByTestId('options-menu');
  });

  it('handles messages without reactions', () => {
    const messageWithoutReactions = { ...mockMessage, reactions: [] };
    const { queryByText } = renderWithTheme(
      <MessageBubble {...defaultProps} message={messageWithoutReactions} />
    );
    expect(queryByText('👍')).toBeNull();
  });
});
