# Technical Test: Implementation of Mobile Chat Application Features

## Developer
**Duvan Camargo** - FrontEnd Middle Developer Candidate

## General Project Description
This document details the implementation of new features in the mobile Chat application, focusing on feature additions, performance improvements, and UI/UX enhancements. The implementation includes both new features and optimizations to existing functionality.

## Implemented Features

### Feature Additions

1. **Media Sharing**
   - Implemented using Expo Image Picker
   - Added image compression using `expo-image-manipulator`
   - Defined image size
   - Optimized preview generation for better performance
   - Added to schema: `imageUrl` field in messages table
   - Preview functionality

2. **Message Status and Read Receipts**
   - Added delivery status tracking (`sending`, `sent`, `delivered`, `read`)
   - Implemented in schema in `messages` table: `deliveryStatus` and `isRead` fields
   - Real-time updates using optimized updates

3. **Message Reactions**
   - Added reaction system with emoji support
   - 5 default emojis displayed in a simple modal when selecting a message
   - Option to change or remove reaction
   - Implemented in schema in `messages` table: JSON `reactions` field
   - Real-time reaction updates

4. **Message Management**
   - Option to select multiple messages, customized options depending on selected messages
   - Message deletion (for me/for everyone)
   - Complete logical and visual management
   - Message editing, preview of previous and new message
   - Message forwarding to one or multiple chats
   - Added to schema in `messages` table: `isDeleted`, `isEdited`, `isForwarded`, `deletedFor` fields

5. **Voice Messages**
   - Implemented using Expo Audio
   - Added recording and playback functionality
   - Added to schema: `voiceUrl` and `messageType` fields

6. **Message Search**
   - Implemented chat room search functionality
   - Added search modal component
   - Optimized search performance

### Performance Improvements

1. **Message List Optimization**
   - Implemented FlatList with virtualization, limiting number of rendered elements
   - Added pagination for older messages, functionality triggered when reaching top with scroll
   - Optimized message rendering

2. **Database Optimization**
   - Implemented query optimizations in `useChatsDb` for Database

3. **Media Management**
   - Implemented image compression in chats

### UI/UX Improvements

1. **Theme Support**
   - Implemented dark/light mode using `useColorScheme`
   - Added theme-aware components
   - Consistent color palette throughout the application
   - Theme changes according to device theme

2. **Loading States**
   - Added skeleton screens for chat list
   - Implemented loading indicators

3. **Accessibility**
   - Added appropriate contrast ratios
   - Implemented screen reader support
   - Added proper focus management

4. **Animations and Feedback**
   - Added haptic feedback for important actions (selecting chats and messages)
   - Implemented smooth transitions
   - Added loading animations

## Technical Implementation Details

### Key Libraries Added
- `expo-image-picker`: For media selection
- `expo-image-manipulator`: For image compression
- `expo-av`: For voice message handling
- `@drizzle-orm/sqlite-core`: For database operations

## Known Issues and Future Work

1. **Testing**
   - Unit test implementation was attempted but faced issues
   - Need to implement proper testing infrastructure

## Additional Implementations

### 1. Individual and Group Chat Management
- **Chat Creation**
  - Single chat validation per person (except groups)
### 3. Reusable Components

1. **Modal Components**
- **Base Modal Structure**
  - Reusable modal wrapper with consistent styling
  - Standardized animations and transitions
  - Backdrop handling and press events

- **Specific Modal Types**
  - `DeleteChatModal`: For chat deletion confirmation
  - `NewChatModal`: For creating individual/group chats
  - `EditProfileModal`: For profile editing
  - `ImagePreviewModal`: For full-screen image viewing
  - `ReactionMenu`: For message reactions

2. **Loading Components**
- **Skeleton Screens**
  - `ChatListSkeleton`: Loading state for chat list
  - `MessageListSkeleton`: Loading state for messages
  - `ProfileSkeleton`: Loading state for profile views
  - Consistent animation and styling
  - Responsive to screen sizes

- **Loading Indicators**
  - `LoadingSpinner`: Reusable loading animation
  - `ProgressBar`: For media upload/download
  - `LoadingOverlay`: Full screen loading state

- **Chat Deletion**
  - Individual chat deletion
  - Multiple chat deletion
  - Deletion of all messages in a chat

### 2. Organization and Display
- **Chat Sorting**
  - Automatic reorganization by last message
  - Prioritization of chats with unread messages
  - Order maintenance when receiving new messages

- **Message Count**
  - Unread message counter per chat
  - Real-time updates
  - Counter reset when opening chat

## Icon and Component Implementation

### 1. Icon System
- **Icons**
  - Centralization of all application icons
  - Implementation of custom icons
  - Icon reuse throughout the application
  - Support for different sizes

### 2. Avatar Component Improvements
- **Profile Display**
  - Modal functionality to view profile picture in full size
  - Username editing function
  - Profile picture editing function

2. **Pending Features**
   - Group chat management needs improvements
   - Some animations could be smoother
   - Advanced caching strategies could be improved

## Dependencies
- React Native
- Expo
- Drizzle ORM
- SQLite
- Expo Image Picker
- Expo Image Manipulator
- Expo Audio
- React Navigation

### Database Schema Updates

### `chats` Table
```sql
-- Previous version
CREATE TABLE IF NOT EXISTS chats (
    id TEXT PRIMARY KEY
);

-- Current version
CREATE TABLE IF NOT EXISTS chats (
    id TEXT PRIMARY KEY,
    is_group INTEGER NOT NULL DEFAULT 0,
    group_name TEXT,
    deleted_for TEXT DEFAULT '[]'
);
```

### `messages` Table
```sql
-- Previous version
CREATE TABLE IF NOT EXISTS messages (
    id TEXT PRIMARY KEY,
    chat_id TEXT NOT NULL,
    sender_id TEXT NOT NULL,
    text TEXT NOT NULL,
    timestamp INTEGER NOT NULL,
    FOREIGN KEY (chat_id) REFERENCES chats (id)
);

-- Current version
CREATE TABLE IF NOT EXISTS messages (
    id TEXT PRIMARY KEY,
    chat_id TEXT NOT NULL,
    sender_id TEXT NOT NULL,
    text TEXT NOT NULL,
    image_url TEXT,
    voice_url TEXT,
    message_type TEXT NOT NULL DEFAULT 'text',
    is_edited INTEGER NOT NULL DEFAULT 0,
    is_forwarded INTEGER NOT NULL DEFAULT 0,
    is_deleted INTEGER NOT NULL DEFAULT 0,
    deleted_for TEXT DEFAULT '[]',
    is_read INTEGER NOT NULL DEFAULT 0,
    delivery_status TEXT NOT NULL DEFAULT 'sending',
    reactions TEXT,
    timestamp INTEGER NOT NULL,
    FOREIGN KEY (chat_id) REFERENCES chats (id)
);
```