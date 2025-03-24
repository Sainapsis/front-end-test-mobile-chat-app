# Change Log for Chat App

## Features
- Design system for Chat App using styles as shown in the Bridge app.
- Information and UI/elements about unreaded messages
- Search messages by user name
- Data fetch by backend node in node JS and bussiness logic isolated from front end 

## Bug Fixes
- Fixed a bug where after login the list of users may appear before the messages are shown
- Fixed a bug where chats are not sorted in main chat list
- Fixed a bug where login session is lost after realoding the application
- Fixed a bug where profile avatar is not showing the user's initials properly

## Improvements
- Displaying user name and status in chat list and chat room no longer requires fetch all users data
- Refactor to reused and rendered components
- Improvements over protected routes and general structure of the router 