// TP
import Toast from "react-native-toast-message";

//BL
import { isChatAlreadyCreatedProps } from "@/interfaces/Messages.interface";

/**
 * Checks if a chat already exists based on the participants and selected users.
 *
 * @param {isChatAlreadyCreatedProps} props - The props object containing participants, chats, and selected users.
 * @param {string[]} props.participants - The participants of the chat.
 * @param {ChatInterface[]} props.chats - The array of chats.
 * @param {string[]} props.selectedUsers - The selected users.
 *
 * @returns {boolean} - True if the chat already exists, false otherwise.
 *
 * @example
 * const isChatAlreadyCreated = isChatAlreadyCreated({
 *   participants: ["1", "2"],
 *   chats: [{ id: "1", participants: ["1", "2"] }],
 *   selectedUsers: ["1", "2"],
 * }); //  true
 */
export const isChatAlreadyCreated = ({
  participants,
  chats,
  selectedUsers,
}: isChatAlreadyCreatedProps): boolean => {
  const chatsMap = new Map();

  chats.forEach((chat) => {
    chatsMap.set(chat.participants.sort().join("-"), chat.participants);
  });

  const isChatAlreadyCreated = chatsMap.has(participants.sort().join("-"));

  if (isChatAlreadyCreated) {
    Toast.show({
      text1:
        selectedUsers.length > 1
          ? "Group chat already created"
          : "Chat already created",
      type: "error",
      autoHide: true,
      visibilityTime: 2000,
    });
    return true;
  }
  return false;
};
