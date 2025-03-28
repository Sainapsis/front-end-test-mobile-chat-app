# Change Log for Chat App

## Features
- Design system for Chat App using styles as shown in the Bridge app.
- Information and UI/elements about unreaded messages
- Search messages by user name
- Data fetch by backend node in node JS and bussiness logic isolated from front end 
- If and user have already logged in into the aplication, its profile is saved, and it could be switched easily
- Chat logic managed by web sockets for real time communication
- Badges for dates in chat rooms
- Added chat responses

## Bug Fixes
- Fixed a bug where after login the login view may appear before the chat rooms are shown
- Fixed a bug where chats are not sorted in main chat list
- Fixed a bug where login session is lost after realoding the application
- Fixed a bug where profile avatar is not showing the user's initials properly
- Fixed a bug about incorrect animations on login page
- Fixed a bug about scrolling to last message stopped in a previous one
- Fixed a bug where the message input is hidden after the keyboard is shown
- Icons weren't shown properly in android, it has been fixed
- Solved a bug in which initials werent shown properly in iOS devices for big avatar sizes

## Improvements
- Displaying user name and status in chat list and chat room no longer requires fetch all users data
- Refactor to reused and rendered components
- Improvements over protected routes and general structure of the router 
- Improvements over styles for message when an user has no chats available