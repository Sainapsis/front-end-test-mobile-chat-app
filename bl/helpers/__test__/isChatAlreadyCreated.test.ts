import { isChatAlreadyCreated } from "../isChatAlreadyCreated";
import { isChatAlreadyCreatedProps } from "@/interfaces/Messages.interface";
import Toast from "react-native-toast-message";

jest.mock("react-native-toast-message", () => ({
  show: jest.fn(),
}));

describe("isChatAlreadyCreated", () => {
  const chatsMock: isChatAlreadyCreatedProps["chats"] = [
    { id: "1", participants: ["1", "2"], messages: [] },
    { id: "2", participants: ["1", "3"], messages: [] },
    { id: "3", participants: ["1", "2", "3"], messages: [] },
    { id: "4", participants: ["1", "2", "3", "4"], messages: [] },
  ];

  it("Should return true and show a toast if chat already exists", () => {
    const result = isChatAlreadyCreated({
      participants: ["1", "2"],
      chats: chatsMock,
      selectedUsers: ["2"],
    });

    expect(result).toBe(true);
    expect(Toast.show).toHaveBeenCalledWith({
      text1: "Chat already created",
      type: "error",
      autoHide: true,
      visibilityTime: 2000,
    });
  });

  it("Should return false if chat does not exist", () => {
    const result = isChatAlreadyCreated({
      participants: ["1", "4"],
      chats: chatsMock,
      selectedUsers: ["4"],
    });

    expect(result).toBe(false);
  });

  it("Should return true and show 'Group chat already created' if a group chat already exists", () => {
    const result = isChatAlreadyCreated({
      participants: ["1", "2", "3", "4"],
      chats: chatsMock,
      selectedUsers: ["2", "3", "4"],
    });

    expect(result).toBe(true);
    expect(Toast.show).toHaveBeenCalledWith({
      text1: "Group chat already created",
      type: "error",
      autoHide: true,
      visibilityTime: 2000,
    });
  });

  it("Should handle chats with different order of participants", () => {
    const result = isChatAlreadyCreated({
      participants: ["2", "3", "1"],
      chats: chatsMock,
      selectedUsers: ["3", "2"],
    });

    expect(result).toBe(true);
    expect(Toast.show).toHaveBeenCalledWith({
      text1: "Group chat already created",
      type: "error",
      autoHide: true,
      visibilityTime: 2000,
    });
  });

  it("Should return false if the chat list is empty", () => {
    const result = isChatAlreadyCreated({
      participants: ["1", "2"],
      chats: [],
      selectedUsers: ["2"],
    });

    expect(result).toBe(false);
  });

  it("Should be able to create another chat even if have chats in common with more participants", () => {
    const result = isChatAlreadyCreated({
      participants: ["1", "2", "3", "4", "5"],
      chats: chatsMock,
      selectedUsers: ["2", "3", "4", "5"],
    });

    expect(result).toBe(false);
  });
});
