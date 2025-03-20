💬 **Read Receipts Implementation**

🎯 **Feature Overview**

The goal of this feature was to add read receipts to the chat messages, providing users with a clear visual indicator of message status — whether it was sent or read.

✅ **Task:** "Add read receipts for messages along with status indicators (sent, read)"

🔧 **Implementation Breakdown**

🛠️ **Data Handling**

- Message Schema Update:
  - Extended the message object to include a status field ("sent" / "read").

- Backend Integration:
  - Created a handler that update the status of the message to "read" when the component is mounted.

🎨 **UI/UX Changes**

- Icons for Status Indicators:
  - Added a "sent" icon (✅ single check).
  - Added a "read" icon (✅✅ double check).

- Conditionally Rendered Icons: Rendered the appropriate icon based on the message status and if is the current user.




--------------------------------

💬 **Create duplicate chat validation**

🎯 **Feature Overview**

In this implementation a bug was fixed.

🐞 **Bug:** A user can create a chat or a group chat even if the chat already exists.

🔧 **Implementation Breakdown**

🛠️ **Data Handling**

- Backend Validation:
  - Added a validation in the handler to create chat to check if the chat already exists, and the chat will only be created if it doesn't exist.

🎨 **UI/UX Changes**

- Added a toast to the user to inform that the chat already exists.
  - If the participants are more than 2, the toast will inform that the group chat already exists.
  - If the participant are 2, the toast will inform that the chat already exists.

