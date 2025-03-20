// TP
import Toast from "react-native-toast-message";

//BL
import { isChatAlreadyCreatedProps } from "@/interfaces/Messages.interface";

export const isChatAlreadyCreated = ({
  participants,
  chats,
  selectedUsers,
}: isChatAlreadyCreatedProps) => {
  const chatsMap = new Map();

  console.log(chats);

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
