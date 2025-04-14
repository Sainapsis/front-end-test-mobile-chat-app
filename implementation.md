# Implementation Details

## UI/UX Enhancements

- **Implemented dark mode support**: Added theme switching functionality for better user experience.
- **Added new theme colors**: Extended color palette for both light/dark modes (input background, cursor, bubble colors).
- **Improved send button**: Enlarged and styled the chat send button with theme-appropriate colors.
- **Added missing icons**: Fixed rendering issues by including previously absent icons.
- **Fixed hardcoded colors**: Replaced hardcoded colors with theme variables for consistency.
- **Themed chat bubbles**: Messages now display colors based on the active theme, with distinct tones for sent/received messages.
- **Themed links**: Links now dynamically adapt to the selected theme.
- **Read receipts & status indicators**: Added message status icons (sent, read) inside chat bubbles for real-time feedback.
- **Enhanced reaction interface**: Redesigned reactions for better visual clarity and interaction.
- **Improved menu animations**: Smoother transitions for context menus (message long-press).
- **Adaptive context menus**: Menus now adjust position/size based on screen boundaries.
- **Message deletion and editing**: Users can now delete or edit messages directly from the chat interface.
- **Haptic feedback**: Added tactile responses for message long-press and reaction selection.

## Feature Additions

- **Chat exit button**: Added functionality to leave the chat and return to the general chat list screen.
- **Message status tracking**: Implemented logic to update and display message states (sent → read).
- **Message reactions**: Users can add reactions to messages.
- **Edit timestamps**: Edited messages now display the last modification time.
- **Multimedia support groundwork**: Installed required packages for future media uploads (images, files).

## Database & Backend Changes

- **Modified `db.ts`**:
    - Added `is_deleted` (boolean) and `last_edited_at` (timestamp) columns to the messages table.
    - New columns are added via SQLite migrations (schema verification before altering tables).
- **Updated `seed.ts`**:
    - Mock data now includes `is_deleted` and `last_edited_at` for testing consistency.
- **Soft delete implementation**: Messages are flagged as `is_deleted` instead of permanent removal.

## Code Quality & Architecture

- **Centralized repeated colors**: Extracted duplicate hex colors into shared variables for maintainability.
- **Simplified theme usage**: Themes can now be applied by name (for now only `"dark"` and `"light"` are implemented) without manual overrides; invalid names throw compilation errors.
- **Removed unused CSS imports/parameters**: Cleaned up redundant code.
- **Theme colors as constants**: Colors are now defined as constants that adapt to the selected theme.
- **Refactored MessageBubble**: Improved component reusability (separated logic for reactions, menus, and status indicators).
- **Code documentation**: Added inline comments for better documentation.
- **Dependency management**: Installed packages for haptic feedback (`react-native-haptic-feedback`) and multimedia handling.