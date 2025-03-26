// BL
import { handleCreateChatProps } from "@/interfaces/Messages.interface";
import { isChatAlreadyCreated } from "../helpers/isChatAlreadyCreated";

export const handleCreateChat = ({
  currentUser,
  selectedUsers,
  setModalVisible,
  setSelectedUsers,
  chats,
  createChat,
}: handleCreateChatProps) => {
  if (!currentUser) return;

  if (selectedUsers.length > 0) {
    const participants = [currentUser.id, ...selectedUsers];

    if (isChatAlreadyCreated({ participants, chats, selectedUsers })) return;

    createChat(participants);
    setModalVisible(false);
    setSelectedUsers([]);
  }
};
