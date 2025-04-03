// BL
import { UserInterface } from "@/interfaces/User.interface";

/** This function searches a user by id from an array of users and return the user
 *
 * @param {string} id - The id of the user to search
 * @param {UserInterface[]} users - The array of users
 *
 * @returns {UserInterface} - The user found
 *
 * @example
 * const user = getUserById("1", users); // { id: "1", name: "John", avatar: "https://example.com/avatar.png", status: "online" }
 */

const getUserById = (
  id: string,
  users: UserInterface[]
): UserInterface | undefined => {
  return users.find((user) => user.id === id);
};

export default getUserById;
