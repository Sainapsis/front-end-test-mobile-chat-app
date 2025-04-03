import getUserById from "../getUserById";
import { UserInterface } from "@/interfaces/User.interface";

describe("getUserById", () => {
  const usersMock: UserInterface[] = [
    { id: "1", name: "John Doe", status: "online", avatar: "avatar1.png" },
    { id: "2", name: "Jane Doe", status: "offline", avatar: "avatar2.png" },
    { id: "3", name: "Mary Doe", status: "away", avatar: "avatar3.png" },
  ];

  it("Should return the correct user when the ID exists", () => {
    const user = getUserById("1", usersMock);
    expect(user).toEqual({
      id: "1",
      name: "John Doe",
      status: "online",
      avatar: "avatar1.png",
    });
  });

  it("Should return undefined when the ID does not exist", () => {
    const user = getUserById("999", usersMock);
    expect(user).toBeUndefined();
  });

  it("Should return undefined when the users array is empty", () => {
    const user = getUserById("1", []);
    expect(user).toBeUndefined();
  });

  it("Should return undefined when ID is an empty string", () => {
    const user = getUserById("", usersMock);
    expect(user).toBeUndefined();
  });

  it("Should return undefined when ID is null", () => {
    const user = getUserById(null as unknown as string, usersMock);
    expect(user).toBeUndefined();
  });

  it("Should return undefined when ID is undefined", () => {
    const user = getUserById(undefined as unknown as string, usersMock);
    expect(user).toBeUndefined();
  });
});
