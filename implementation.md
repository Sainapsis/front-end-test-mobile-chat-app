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

## Feature Additions

- **Chat exit button**: Added functionality to leave the chat and return to the general chat list screen.
- **Message status tracking**: Implemented logic to update and display message states (sent → read).

## Database & Backend Changes

- **Modified `db.ts`**: Added two new columns to the messages table to support read receipts.
- **Updated `seed.ts`**: Ensured database initialization aligns with the new schema (consistent mock data for message states).

## Code Quality & Architecture

- **Centralized repeated colors**: Extracted duplicate hex colors into shared variables for maintainability.
- **Simplified theme usage**: Themes can now be applied by name (only implemented `"dark"` and `"light"`) without manual overrides; invalid names throw compilation errors.
- **Removed unused CSS imports/parameters**: Cleaned up redundant code.
- **Theme colors as constants**: Colors are now defined as constants that adapt to the selected theme.