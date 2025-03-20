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



---------------------------------

🗑️ **Delete and edit Messages**

🎯 **Feature Overview**

The goal of this feature was to add a delete and edit message functionality to the chat messages.

✅ **Task:** "Add message deletion and editing"

🔧 **Implementation Breakdown**

🛠️ **Data Handling**

- Backend Integration:
  - Created a handler to delete a message.
  - Created a handler to edit a message.

🎨 **UI/UX Changes**

- Icons for Status Indicators:
  - Added a input to edit the message.
  - When press long on a message, the options to edit or delete will be shown.
  - When the delete option is selected, an alert will display to confirm and if confirms the message will be deleted.
  - When the edit option is selected, the input will be shown and the message will be replaced by the input.

