import { ChatInterface } from "@/interfaces/Messages.interface";
import { UserInterface } from "@/interfaces/User.interface";
import formatParticipantInUserChats from "../formatParticipantInUserChats";

describe("formatParticipantInUserChats", () => {
  const chatsMock: ChatInterface = {
    id: "1",
    participants: ["1", "2", "3"],
    messages: [],
  };

  const currentUserMock: UserInterface = {
    id: "1",
    name: "John Doe",
    status: "online",
    avatar: "avatar.png",
  };

  const usersMock: UserInterface[] = [
    {
      id: "1",
      name: "John Doe",
      status: "online",
      avatar: "avatar.png",
    },
    {
      id: "2",
      name: "Jane Doe",
      status: "online",
      avatar: "avatar.png",
    },
    {
      id: "3",
      name: "Mary Doe",
      status: "online",
      avatar: "avatar.png",
    },
    {
      id: "4",
      name: "Carlos Doe",
      status: "online",
      avatar: "avatar.png",
    },
  ];

  it("Should return the name of the participants in the chat", () => {
    const formattedParticipants = formatParticipantInUserChats({
      chat: chatsMock,
      currentUser: currentUserMock,
      users: usersMock,
    });

    expect(formattedParticipants).toBe("You, Jane Doe, Mary Doe");
  });

  it("Should return You at the beginning of the list even if the current user is not the first participant", () => {
    const chatsMockWithCurrentUserAtTheEnd: ChatInterface = {
      ...chatsMock,
      participants: ["3", "2", "1", "4"],
    };
    const formattedParticipants = formatParticipantInUserChats({
      chat: chatsMockWithCurrentUserAtTheEnd,
      currentUser: currentUserMock,
      users: usersMock,
    });

    expect(formattedParticipants).toBe("You, Mary Doe, Jane Doe, Carlos Doe");
  });

  it("Should return You and the name of the other participant in the chat", () => {
    const chatsMockWithTwoParticipants: ChatInterface = {
      ...chatsMock,
      participants: ["1", "2"],
    };

    const formattedParticipants = formatParticipantInUserChats({
      chat: chatsMockWithTwoParticipants,
      currentUser: currentUserMock,
      users: usersMock,
    });

    expect(formattedParticipants).toBe("You, Jane Doe");
  });

  it("Should return en empty string if the chat has no participants", () => {
    const chatsMockWithNoParticipants: ChatInterface = {
      ...chatsMock,
      participants: [],
    };

    const formattedParticipants = formatParticipantInUserChats({
      chat: chatsMockWithNoParticipants,
      currentUser: currentUserMock,
      users: usersMock,
    });

    expect(formattedParticipants).toBe("");
  });

  it("Should return en empty string if the chat has users that are not in the users array", () => {
    const chatsMockWithNoParticipants: ChatInterface = {
      ...chatsMock,
      participants: ["10", "32", "92", "10"],
    };

    const formattedParticipants = formatParticipantInUserChats({
      chat: chatsMockWithNoParticipants,
      currentUser: currentUserMock,
      users: usersMock,
    });

    expect(formattedParticipants).toBe("");
  });
});
