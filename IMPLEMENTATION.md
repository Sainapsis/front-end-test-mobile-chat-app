# Change Log for Chat App  

## Features  
- Implemented a design system for the Chat App, inspired by the Bridge app's style.  
- Added UI elements and indicators for unread messages.  
- Enabled message search by username and message content.  
- Backend data fetching using Node.js, with business logic isolated from the frontend.  
- If a user is already logged in, their profile is saved and can be switched easily.  
- Real-time chat functionality using WebSockets.  
- Added date badges in chat rooms for better message organization.  
- Implemented chat responses.  
- Added users creation functionality

## Bug Fixes  
- Fixed an issue where the login view could appear after logging in, even before chat rooms are displayed.  
- Resolved a problem where chats were not sorted correctly in the main chat list.  
- Fixed a bug where the login session was lost after reloading the app.  
- Corrected the profile avatar issue where user initials were not displayed properly.  
- Fixed animation glitches on the login page.  
- Addressed an issue where scrolling to the last message would stop at a previous one.  
- Fixed a bug where the message input was hidden when the keyboard was shown.  
- Corrected an issue where icons were not displayed properly on Android devices.  
- Fixed a problem with displaying initials correctly on iOS devices when using large avatar sizes.  

## Improvements  
- Optimized user name and status display in chat lists and rooms without fetching all user data.  
- Refactored components to improve reusability and performance.  
- Enhanced routing structure with better protection for specific routes.  
- Improved message styles when no chats are available.  
- Optimized message list rendering with virtualization for smoother performance.  
- Improved database model by reducing SQLite tables to just two.  

# Implementation Details  

## Rationale  
It is not a good practice to handle business logic on the frontend. Initially, the chat application managed a single user implementation while switching between accounts. This caused information for all users to be stored on a single device. Although the app was not intended for a production environment, I decided to follow best practices. Additionally, in the context of software development, it is quite common to encounter scenarios where technology migration or full platform upgrades are required.  

Given that the app already used an SQLite database in the React Native frontend, I decided to implement a strategy that would support offline usage. I developed a backend using NestJS with MongoDB to handle the business logic through an API, exposing a WebSocket for real-time communication.  

## Implementation  
During the development process, I considered using message queues to manage chat messages more efficiently. However, I concluded that, for the purposes of this migration exercise, the chosen solution would suffice. The current approach involves sending a notification to the user rooms whenever there is a database event updating messages. The client then retrieves the data (currently the entire set, as a more optimized partial data retrieval strategy—like timestamps or a staging area—has not yet been implemented) and updates the records in two locally stored tables: `Messages` and `Chats`. Additionally, public user data is stored in another table called `Users`, enabling offline mode.  

## Offline Mode  
If the app fails to connect to the API, it displays a badge indicating that the user is in offline mode. This mode is restricted and prevents common actions such as logging out, creating new chats, and sending new messages. However, it still allows users to read previous messages from any chat room.  

## Real-Time Chat Synchronization Strategy  

To ensure that chats are displayed in real-time, I designed the following synchronization strategy:  

1. The sender sends a message.  
2. Once the message is inserted into the remote database, it triggers an event in the recipient’s socket room.  
3. Upon receiving the message from the socket, the recipient updates their database by fetching all available messages and chats.  
4. Simultaneously, the sender also retrieves the same data.  
5. The modified data is updated in the SQLite table on each device, and any new messages or chats are inserted.  

This process occurs in the following scenarios:  
1. When sending a message.  
2. When entering a chat room and updating the chat status to "read."  
3. When logging into the application.  

In the event of disconnection, an "offline mode" badge is displayed. An interval runs every 30 seconds to attempt reconnection. Once the connection is reestablished, new and edited chats marked as "read" are retrieved.  

This strategy ensures that the application has an offline mode for reading chats without an active connection. However, it is resource-intensive since it retrieves the entire chat history.  


## Frontend Adaptation  
A significant overhaul of the data handling on the frontend was necessary to accommodate this new strategy. The main challenge was ensuring that the chat functionality remained consistent despite the offline mode. By maintaining local storage for critical data and synchronizing when online, the app ensures a smoother user experience, even in intermittent connectivity scenarios.

## Design and Look & Feel  

To enhance the design and user experience of the app, I decided to emulate the design system of the Bridge app. I started by analyzing the layout presented on the Bridge website ([Bridge App](https://www.bridge.new/)) and the login form. Using a color picker tool and the browser's inspector, I managed to extract some of the key colors. For other elements, I shared partial design screenshots with ChatGPT to get suggestions for complementary color schemes, especially for dark mode.  

I utilized the existing hooks implementations within the app to add the new colors to the `Colors.ts` file, ensuring that they would be properly integrated into the theme. I also made adjustments to the chat message view layout to closely resemble the Bridge app as I gradually implemented new features in the views.  

The goal was to create a familiar yet distinctive look and feel that would align with modern design standards while maintaining consistency throughout the app. The final result is a visually appealing interface that mirrors the aesthetics of Bridge while fitting the specific needs of our chat application.  


## Authentication  

For the authentication system, I used the JSON Web Token (JWT) strategy. In the NestJS backend, I implemented the `req.user` mechanism to "sign" all requests, ensuring that every request only affects the data that the managing user owns.  

This approach enhances security by associating each request with the authenticated user, preventing unauthorized data manipulation. By leveraging JWT, I established a secure and reliable authentication method that aligns with best practices for backend systems.  

## Search Functionality  

To implement the search functionality, I performed an `array.filter` operation on both the messages and chats, as they are stored locally in SQLite tables. Although directly querying the database would be more efficient and less error-prone, I opted for this approach to maintain a seamless integration with the existing frontend structure.  

To optimize the rendering in the respective lists, I used the `useMemo` hook to cache the filtered results. This way, the search remains efficient while avoiding unnecessary re-renders. Despite the limitations, this solution works well given the current architecture.  

When selecting a message from the chat or message search, the application automatically scrolls to the corresponding message within the chat. To achieve this, I obtained the list index using the messageID. If a chat is selected from the search, the application scrolls to the bottom. 

## Handling Native Expo Functionalities

Some of the native Expo functionalities posed a significant challenge for me. Although I have experience with React and understand its component-based architecture, I am more accustomed to Angular's reactive programming approach. In contrast, React's declarative nature required me to adapt my mindset. For instance, in Angular, I would typically use Observables and reactive patterns for handling asynchronous data, whereas in React, I had to manage state updates more explicitly and think in terms of rendering components based on state changes.

One of the most time-consuming aspects was working with the application context to trigger data fetch and scroll events when navigating to specific views containing lists. Additionally, managing `KeyboardAvoidingView` alongside `ScrollView` required a nuanced understanding of how to use the `flex` property within styled components. To overcome these challenges, I relied on ChatGPT and DeepSeek to find relevant documentation and best practices for each specific case.

## Date Badges and Dynamic Header  

I added small date badges to group chats, as well as a floating badge in the header that dynamically updates based on the scroll position within the list. To achieve this, I converted dates into timestamps using the format "year-month-day" and performed comparisons depending on the currently rendered element on the screen. 

I leveraged the existing method for displaying chat dates, making some adjustments to fit the new grouping logic. As a result, each chat date is displayed in a way that resembles how WhatsApp shows them, providing a familiar and intuitive experience for users. 


## List Rendering and Scrolling Behavior  

Although the list rendering is optimized using `memo`, I couldn't achieve a smooth scrolling experience until reaching the bottom of the screen. I experimented with reversing the order of the lists, data, and flex properties, but I was unable to make it work properly with the date badge. 

In some cases, this led to infinite scrolling issues. Despite multiple attempts to adjust the layout, the desired behavior remained elusive. Further investigation and testing might be needed to address this scrolling challenge effectively.  


## Chat Replies and Message Handling  

To implement chat replies, I modified the `ChatBubble` component and created an element that displays the message being replied to when swiping left. The current chat data (sender's name, message, and message ID) is stored in several states. When the dismiss button is pressed, these states are set to `undefined`, and upon sending the message, the API is called to retrieve the message, which is then stored in the database.  

The `messages` database contains three fields to store these reply-related data, which can be null if the message does not include a reply. The component within the chat bubble that displays the message data for replied messages directly uses these fields and renders them as they are, effectively eliminating additional SQL queries.  

For any sent message, the strategy is consistent: the message is sent, the response is obtained, and it is inserted into the database. Additionally, when connected to the socket, messages are retrieved and either inserted or updated as needed (e.g., updating the read status of a message).  

## Scalability Considerations  

In a hypothetical scenario where the application evolves into a production environment, the use of MongoDB as the database and the separation between frontend and backend logic could enable scalability. However, it is important to consider migrating the absolute synchronization logic to a more efficient strategy, such as utilizing message queues or other synchronization mechanisms that better support distributed systems.  


## Backend Technology Choice  

I chose to use NestJS for the backend to demonstrate my abilities not only in frontend development but also as a full-stack developer. NestJS is a framework built on Node.js that uses TypeScript, making it easy to maintain since the modular structure ensures an organized development process. Additionally, it integrates well with MongoDB through Mongoose.  

SQLite was retained because it works efficiently on both Android and iOS devices and supports data storage for offline functionality.  

## Next Steps and Improvements  

The application is not completely finished. It would be great to add media functionalities. For this, I planned to use repositories to store videos, audio, and photos. Once these media files are retrieved on all devices of users in a chat room, they would be deleted from the remote storage.  

The scroll animations for large message lists need improvement, and it would be beneficial to explore better synchronization strategies. Additionally, implementing group chat creation is still pending. Although the necessary components are already present in the application, I did not complete the views.  


