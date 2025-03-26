// BL
import { ChatInterface } from "@/interfaces/Messages.interface";
import { UserInterface } from "@/interfaces/User.interface";
import getUserById from "./getUserById";

/** This function formats the participant in the user chats to show the name of the participants and the current user as "You"

* @param {ChatInterface} chat - The chat to search the participants
* @param {UserInterface} currentUser - The current user
* @param {UserInterface[]} users - The users array

* @returns {string} - The formatted participant

* @example
* const formattedParticipant = formatParticipantInUserChats(chat, currentUser, users) // "You, John, Jane"
*/

interface FormatParticipantInUserChatsProps {
  chat: ChatInterface;
  currentUser: UserInterface;
  users: UserInterface[];
}

const formatParticipantInUserChats = ({
  chat,
  currentUser,
  users,
}: FormatParticipantInUserChatsProps): string => {
  return chat.participants
    .sort((a, b) => {
      if (a === currentUser?.id) return -1;
      if (b === currentUser?.id) return 1;
      return 0;
    })
    .map((participant) => {
      if (participant === currentUser?.id) {
        return "You";
      }
      return getUserById(participant, users)?.name;
    })
    .filter((participant) => participant !== undefined)
    .join(", ");
};

export default formatParticipantInUserChats;
