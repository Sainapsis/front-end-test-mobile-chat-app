# Front-End Test: Mobile Chat App

Welcome to the **Sainapsis Front-End Test!** This test involves implementing a series of improvements—both bug fixes and new features—within the codebase of this repository. The project is a **fully functional mobile chat app** built with **Expo** and **React Native**.

> **New to Expo?** No worries! The codebase already covers most of the framework’s fundamentals, and your web development experience should help you get up to speed quickly. If you're unfamiliar with Expo, **just let us know—we’ll consider that when reviewing your submission**.

## 📌 Notes

- We’ve designed this test to reflect real-world challenges you'll face at **Sainapsis**—although in a much simpler form.
- We encourage you to leverage **AI tools**, such as [Cursor IDE](https://cursor.sh) (which offers a free tier with advanced AI models), to enhance your workflow. However, **you must remain in full control** of any AI-generated code.
- Ensure that all changes adhere to **high-quality standards** and follow **best practices**.
- During the review process, we will analyze your decisions, and in a **live coding session**, we may request further improvements. **You can still use AI in your IDE of choise** during live coding, but be ready to explain your codebase understanding and the reasoning behind your modifications—whether implemented with AI assistance or manually.

## 🎉 Fun Fact

This codebase was generated **entirely from scratch** using **Cursor IDE** with **Sonnet 3.7** in approximately **2 hours** and around **3 prompts** (plus a few failed prompts/responses from the AI in between). There was **little to almost no supervision** during the process—**intentionally**.

Why? Because we wanted to allow possible **errors that result from improper AI usage**, giving you the opportunity to **possible identify and fix them** and above all, ensuring you **don’t introduce new ones**. Remember, we expect you to demonstrate **good AI-assisted coding practices** throughout this test if you choose to use it.

## Getting Started with running the app in local

1. Clone this repository
2. Install dependencies with `npm install`
3. Start the development server with `npm start`
4. Use the Expo Go app on your device or an emulator to run the application
7. Download and install mongodb
8. Set your MongoDB database to localhost:27017
9. In `providers/api/apiProviders.ts` replace the URL API_BASE_URL to `http://&lt;Your Local Ip Address&gt;:3000`
10. Go to `/back-end-test-mobile-chat-app` and install dependencies with `npm install`
11. Start the bakcend server with `npm start`

## Your Challenge

You are free to choose any number of tasks from the list of **Bug Fixes, UI/UX Enhancements, Feature Additions, or Performance Improvements**. Alternatively, you can **ignore the list and improve the app as you see fit**—which we’d love to see as well!  

In any case, **remember to document your task selection, implementation details, and reasoning** in the `IMPLEMENTATION.md` file, as outlined in the **Submission Guidelines**.

### Feature Additions

- [ ] Add media sharing capabilities (photos preferably, with a optimized/compressed preview instead of the original image)
- [ ] Add read receipts for messages along with status indicators (sent, read)
- [ ] Implement message reactions (emoji responses, easy but still gets points)
- [ ] Create group chat creation and management
- [ ] Implement message search functionality
- [ ] Add message deletion and editing
- [ ] Add voice messages (recording/playing)
- [ ] Implement message forwarding

### Performance Improvements

- [ ] Optimize message list rendering with virtualization
- [ ] Optimize database queries and state management
- [ ] Implement proper memory management for media content
- [ ] Add pagination for loading older messages

### Code Quality & Architecture

- [ ] Implement comprehensive unit and integration tests
- [ ] Refactor components for better reusability
- [ ] Implement proper logging and monitoring

### Bug Fixes

- [ ] Fix message ordering in chat rooms (newest messages should appear at the bottom, next to the input box)
- [ ] Resolve keyboard or other components overlap issues on different device sizes

### UI/UX Enhancements

- [ ] Implement dark mode support
- [ ] Improve loading states and skeleton screens
- [ ] Enhance accessibility features (screen reader support, contrast)
- [ ] Add haptic feedback for important actions
- [ ] Improve empty state designs (no messages, no chats)
- [ ] Implement smoother animations and transitions

## Assessment Criteria

Your submission will be evaluated on:

1. **Code Quality**: Clean, maintainable, and well-structured code
2. **Problem Solving**: How you approach and solve the identified issues
3. **Technical Proficiency**: Effective use of React Native, TypeScript, and related technologies
4. **UI/UX Skills**: Visual appeal and user experience of your implementation
5. **Documentation**: Clear explanation of your changes and decisions

## Submission Guidelines

1. Fork this repository
2. Implement your changes in a clean, organized manner
3. Document your changes (and reasoning behind your choises if you fell its woth it) in a IMPLEMENTATION.md
4. Submit a pull request with your improvements
5. Include a brief summary of what you implemented and why

Good luck with your assessment! We look forward to reviewing your submission.
